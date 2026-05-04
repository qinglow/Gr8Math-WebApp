'use client';

import React, { useState, useEffect, useRef } from 'react';
import { uploadLessonMediaToTigris } from '@/app/service/upload';
import 'mathlive';
import { WordBankModal } from '@/components/ui/WordBankModal';
import trashIcon from '@/app/(teacher)/class-page/photos/trash.svg';

export type QuestionType = 'Multiple Choice' | 'Short Answer' | 'Paragraph' | 'Checkboxes' | 'Dropdown' | 'Upload Image';

export interface QuestionData {
    id: string;
    type: QuestionType;
    question: string;
    imageUrl?: string;
    pendingQuestionImage?: File | null;
    choices: string[];
    hasError: boolean;
    choiceErrors: boolean[];
    points: number;
    correctAnswers: string[];
    pendingAnswerImage?: File | null;
    isAnswerKeyMode: boolean;
    hasKeyError?: boolean;
}

interface Gr8AssessmentEditorProps {
    onBack: () => void;
    onPublish: (questions: QuestionData[], timeLimit: number) => void;
    initialQuestions?: QuestionData[];
    initialTimeLimit?: number;
    isEditing?: boolean;
    courseId: string;
}

const QUESTION_TYPES: QuestionType[] = [
    'Multiple Choice', 'Checkboxes', 'Dropdown', 'Short Answer', 'Paragraph', 'Upload Image'
];

export function Gr8AssessmentEditor({ onBack, onPublish, initialQuestions, initialTimeLimit = 0, isEditing, courseId }: Gr8AssessmentEditorProps) {

    // --- MATH REFS & STATE ---
    const [showWordBank, setShowWordBank] = useState(false);
    const [timeLimit, setTimeLimit] = useState<number>(initialTimeLimit);
    const mathFieldRef = useRef<any>(null);
    const [showMathModal, setShowMathModal] = useState(false);
    const [mathValue, setMathValue] = useState('');
    const [activeMathTarget, setActiveMathTarget] = useState<{ qId: string, choiceIndex?: number } | null>(null);

    const [questions, setQuestions] = useState<QuestionData[]>(() => {
        if (initialQuestions && initialQuestions.length > 0) {
            return initialQuestions.map(q => {
                const stripPts = (s: string) => s.replace(/^\s*\[\s*\d+(?:\.\d+)?\s*pts?\s*\]\s*/i, '').trim();

                let currentPoints = 1;

                if (q.type === 'Upload Image') {
                    // Because we saved just the raw number in the backend for Upload Image
                    if (q.choices && q.choices.length > 0 && !isNaN(parseFloat(q.choices[0]))) {
                        currentPoints = parseFloat(q.choices[0]);
                    } else if (typeof q.points === 'number' && q.points > 0) {
                        currentPoints = q.points;
                    }
                } else {
                    // Points live in the [X pts] tag for text-based questions
                    const allText = [q.question || '', ...(q.choices || []), ...(q.correctAnswers || [])].join(' ');
                    const match = allText.match(/\[\s*(\d+(?:\.\d+)?)\s*pts?\s*\]/i);
                    currentPoints = match ? parseFloat(match[1]) : (typeof q.points === 'number' && q.points > 0 ? q.points : 1);
                }

                const isUpload = q.type === 'Upload Image';

                const finalChoices = isUpload ? [] : (q.choices || []).map(stripPts).filter(c => c !== '');
                const finalCorrect = isUpload ? [] : (q.correctAnswers || []).map(stripPts).filter(c => c !== '');

                return {
                    ...q,
                    question: stripPts(q.question || ''),
                    hasError: false,
                    hasKeyError: false,
                    isAnswerKeyMode: false,
                    pendingQuestionImage: null,
                    pendingAnswerImage: null,
                    choices: finalChoices.length > 0 ? finalChoices : [''],
                    correctAnswers: finalCorrect,
                    choiceErrors: finalChoices.length > 0 ? finalChoices.map(() => false) : [false],
                    points: currentPoints
                };
            });
        }
        return [{
            id: Date.now().toString(), type: 'Multiple Choice', question: '', imageUrl: '',
            pendingQuestionImage: null, choices: [''], hasError: false, choiceErrors: [false],
            points: 1, correctAnswers: [], pendingAnswerImage: null, isAnswerKeyMode: false, hasKeyError: false
        }];
    });

    const [isPublishing, setIsPublishing] = useState(false);

    // --- 1. MATHLIVE UI FIXES ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mfe = customElements.get('math-field') as any;
            if (mfe) { mfe.fontsDirectory = 'https://unpkg.com/mathlive@0.109.0/dist/fonts/'; }
            document.body.style.setProperty('--keyboard-zindex', '10000');
        }
    }, []);

    useEffect(() => {
        if (showMathModal && mathFieldRef.current) {
            const handleInput = (ev: any) => setMathValue(ev.target.value);
            mathFieldRef.current.addEventListener('input', handleInput);
            setTimeout(() => mathFieldRef.current?.focus(), 100);
            return () => mathFieldRef.current?.removeEventListener('input', handleInput);
        }
    }, [showMathModal]);

    const renderMathPreview = (text: string) => {
        if (!text || !text.includes('$')) return null;
        const parts = text.split(/(\$.*?\$)/g);
        return (
            <div className="mt-1 mb-2 p-2 bg-blue-50/50 rounded border border-blue-100 text-[13px] text-[#222]">
                <span className="text-[9px] font-black text-blue-400 uppercase block mb-1">Preview:</span>
                {parts.map((part, i) => {
                    if (part.startsWith('$') && part.endsWith('$')) {
                        const latex = part.slice(1, -1);
                        return <img key={i} src={`https://math.now.sh?from=${encodeURIComponent(latex)}&color=black`} alt="math" className="inline-block align-middle max-h-[1.4em] mx-0.5" />;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    // --- 2. LOGIC HANDLERS ---

    const insertMathIntoTarget = () => {
        if (!activeMathTarget || !mathValue.trim()) { setShowMathModal(false); return; }
        const latexString = `$${mathValue}$`;
        setQuestions(questions.map(q => {
            if (q.id === activeMathTarget.qId) {
                if (activeMathTarget.choiceIndex !== undefined) {
                    const newChoices = [...q.choices];
                    newChoices[activeMathTarget.choiceIndex] += latexString;
                    return { ...q, choices: newChoices };
                }
                return { ...q, question: q.question + latexString };
            }
            return q;
        }));
        setShowMathModal(false); setMathValue(''); setActiveMathTarget(null);
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now().toString(), type: 'Multiple Choice', question: '', imageUrl: '',
            pendingQuestionImage: null, choices: [''], hasError: false, choiceErrors: [false],
            points: 1, correctAnswers: [], pendingAnswerImage: null, isAnswerKeyMode: false, hasKeyError: false
        }]);
    };

    const importFromWordBank = (bankQuestion: any) => {
        setQuestions([...questions, {
            id: Date.now().toString(),
            type: bankQuestion.type as QuestionType,
            question: bankQuestion.question,
            imageUrl: '',
            pendingQuestionImage: null,
            choices: [...bankQuestion.choices],
            hasError: false,
            choiceErrors: bankQuestion.choices.map(() => false),
            points: bankQuestion.points || 1,
            correctAnswers: [...bankQuestion.correctAnswers],
            pendingAnswerImage: null,
            isAnswerKeyMode: false,
            hasKeyError: false
        }]);
        setShowWordBank(false);
    };

    const removeQuestion = (id: string) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: keyof QuestionData, value: any) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                const updatedQ = { ...q, [field]: value, hasError: false };

                if (field === 'type') {
                    updatedQ.correctAnswers = [];
                    updatedQ.choiceErrors = [];

                    if (value === 'Upload Image' || value === 'Short Answer' || value === 'Paragraph') {
                        updatedQ.choices = [];
                    } else {
                        // Reset back to standard choices
                        updatedQ.choices = [''];
                        updatedQ.choiceErrors = [false];
                    }
                }
                return updatedQ;
            }
            return q;
        }));
    };

    const addChoice = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, choices: [...q.choices, ''], choiceErrors: [...q.choiceErrors, false] } : q));
    };

    const updateChoice = (qId: string, index: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const oldChoice = q.choices[index];
                const newChoices = [...q.choices];
                newChoices[index] = value;
                const newChoiceErrors = [...q.choiceErrors];
                newChoiceErrors[index] = false;
                let newCorrect = [...q.correctAnswers];
                if (newCorrect.includes(oldChoice) && oldChoice.trim() !== '') {
                    newCorrect = newCorrect.map(c => c === oldChoice ? value : c);
                }
                return { ...q, choices: newChoices, choiceErrors: newChoiceErrors, correctAnswers: newCorrect };
            }
            return q;
        }));
    };

    const removeChoice = (qId: string, index: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const choiceToRemove = q.choices[index];
                const newChoices = q.choices.filter((_, i) => i !== index);
                const newChoiceErrors = q.choiceErrors.filter((_, i) => i !== index);
                const newCorrect = q.correctAnswers.filter(c => c !== choiceToRemove);
                return { ...q, choices: newChoices, choiceErrors: newChoiceErrors, correctAnswers: newCorrect };
            }
            return q;
        }));
    };

    const toggleAnswerKeyMode = (id: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, isAnswerKeyMode: !q.isAnswerKeyMode, hasKeyError: false } : q));
    };

    const updatePoints = (id: string, points: number) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, points: points < 0 ? 0 : points } : q));
    };

    const toggleCorrectChoice = (qId: string, choiceIndex: number, type: QuestionType) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const choiceText = q.choices[choiceIndex];
                if (!choiceText.trim()) return q;
                let newCorrect = [...q.correctAnswers];
                if (type === 'Multiple Choice' || type === 'Dropdown') { newCorrect = [choiceText]; }
                else if (type === 'Checkboxes') {
                    if (newCorrect.includes(choiceText)) { newCorrect = newCorrect.filter(c => c !== choiceText); }
                    else { newCorrect.push(choiceText); }
                }
                return { ...q, correctAnswers: newCorrect, hasKeyError: false };
            }
            return q;
        }));
    };

    const updateSingleAnswer = (qId: string, answer: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, choices: [answer], correctAnswers: [answer], hasKeyError: false } : q));
    };

    const handleStageQuestionImage = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setQuestions(questions.map(q => q.id === qId ? { ...q, pendingQuestionImage: file, hasError: false } : q));
        e.target.value = '';
    };

    const removeQuestionImage = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, imageUrl: '', pendingQuestionImage: null } : q));
    };

    const handlePublishClick = async () => {
        let isValid = true;

        // --- 1. VALIDATION ONLY (Do NOT modify the strings with points yet) ---
        const validatedQuestions = questions.map(q => {
            let qError = false;
            let keyError = false;
            let cErrors = (q.choiceErrors ?? []).map(() => false);

            // Check if question text/image is empty
            if (!q.question.trim() && !q.imageUrl && !q.pendingQuestionImage) {
                qError = true;
                isValid = false;
            }

            if (['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.type)) {
                // Check for empty choices
                q.choices.forEach((choice, idx) => {
                    if (!choice.trim()) {
                        cErrors[idx] = true;
                        isValid = false;
                    }
                });

                // FIX: Check if an answer key was actually selected
                if (q.correctAnswers.length === 0) {
                    keyError = true;
                    isValid = false;
                }
            } else if (['Short Answer', 'Paragraph'].includes(q.type)) {
                // FIX: Check if text answer key is empty
                if (!q.correctAnswers[0] || !q.correctAnswers[0].trim()) {
                    keyError = true;
                    isValid = false;
                }
            }

            // Force the question into Answer Key Mode if there is a key error so the user can see it!
            const forceKeyMode = keyError ? true : q.isAnswerKeyMode;

            return {
                ...q,
                hasError: qError,
                hasKeyError: keyError,
                choiceErrors: cErrors,
                isAnswerKeyMode: forceKeyMode
            };
        });

        // If validation fails, update the UI to show errors and STOP.
        if (!isValid) {
            setQuestions(validatedQuestions);
            return;
        }

        // --- 2. FORMATTING & PUBLISHING ---
        setIsPublishing(true);
        try {
            // Clone the questions so we don't accidentally mutate the UI state
            let finalQuestions = [...validatedQuestions];

            for (let i = 0; i < finalQuestions.length; i++) {
                let q = { ...finalQuestions[i] }; // Deep clone the specific question

                // Upload pending Question Image
                if (q.pendingQuestionImage) {
                    const formData = new FormData();
                    formData.append('file', q.pendingQuestionImage);
                    formData.append('courseId', courseId);
                    const res = await uploadLessonMediaToTigris(formData);
                    if (res.success && res.publicUrl) q.imageUrl = res.publicUrl;
                }

                // FIX: Safely append the [pts] tags ONLY to the payload going to the database
                if (q.type === 'Upload Image') {
                    q.choices = [`${q.points}`];
                    q.correctAnswers = [`${q.points}`];
                } else if (q.type === 'Short Answer' || q.type === 'Paragraph') {
                    const stripPts = (s: string) => s.replace(/\s*\[\s*\d+(?:\.\d+)?\s*pts?\s*\]\s*/gi, '').trim();
                    const cleanAns = stripPts(q.correctAnswers[0] || '');

                    q.choices = [`[${q.points} pts] ${cleanAns}`];
                    q.correctAnswers = [`[${q.points} pts] ${cleanAns}`];
                } else {
                    const stripPts = (s: string) => s.replace(/\s*\[\s*\d+(?:\.\d+)?\s*pts?\s*\]\s*/gi, '').trim();

                    q.choices = q.choices.map((c: string) => {
                        const cleanC = stripPts(c);
                        const isCorrect = q.correctAnswers.some((ans: string) => stripPts(ans) === cleanC);
                        return isCorrect ? `[${q.points} pts] ${cleanC}` : cleanC;
                    });

                    q.correctAnswers = q.correctAnswers.map((c: string) => `[${q.points} pts] ${stripPts(c)}`);
                }

                finalQuestions[i] = q;
            }

            onPublish(finalQuestions, timeLimit);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const ErrorIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ED1F24" strokeWidth="2.5" className="shrink-0 mx-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    );

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-8 py-8 font-sans">

            <div className="flex items-center justify-between mb-8 w-full">
                <button onClick={onBack} disabled={isPublishing} className="flex items-center gap-x-2 text-[22px] font-black text-[#222] hover:text-[#0A7F93] transition-colors outline-none disabled:opacity-50">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    {isEditing ? 'Edit Assessment' : 'Create Assessment'}
                </button>
                <button onClick={handlePublishClick} disabled={isPublishing} className="bg-[#1A4C8B] text-white px-6 py-2.5 rounded-lg font-bold text-[14px] hover:bg-[#153a6b] transition-colors shadow-sm outline-none disabled:opacity-50">
                    {isPublishing ? 'Publishing...' : (isEditing ? 'Update Assessment Test' : 'Publish Assessment Test')}
                </button>
            </div>

            {/* --- TIME LIMIT SETTINGS --- */}
            <div className="flex items-center gap-x-4 bg-white p-4 rounded-xl shadow-sm border border-[#D1D8DD] mb-6">
                <span className="font-bold text-[#222] text-[15px]">Time Limit:</span>
                <input
                    aria-label='we'
                    type="number"
                    min="0"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                    className="w-20 p-2 text-center text-[15px] text-[#222] font-black bg-[#F4F6F8] border border-[#D1D8DD] rounded-lg outline-none focus:border-[#1E4B95]"
                />
                <span className="font-bold text-[#222] text-[15px]">minute(s)</span>
                <span className="text-[12px] text-gray-400 font-bold italic">(Set to 0 for unlimited time)</span>
            </div>
            <div className="flex flex-col gap-y-6">
                {questions.map((q) => {
                    if (q.isAnswerKeyMode) {
                        return (
                            <div key={`ans-${q.id}`} className="bg-white border-2 border-[#1E4B95] rounded-xl p-6 shadow-md relative animate-in fade-in duration-300">
                                <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-x-2 mb-1">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E4B95" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            <h3 className="text-[14px] font-extrabold text-[#1E4B95] uppercase tracking-wide">Answer Key</h3>
                                            {q.hasKeyError && <span className="text-[12px] font-bold text-[#ED1F24] ml-2 bg-red-50 px-2 py-0.5 rounded">Please set an answer key</span>}
                                        </div>
                                        <div className="text-[16px] font-medium text-[#222]">{q.question || "Untitled Question"}</div>
                                        {q.imageUrl && <img src={q.imageUrl} alt="Question" className="mt-3 max-h-[150px] object-contain rounded border border-gray-200" />}
                                    </div>
                                    <div className="flex items-center gap-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <input aria-label='num' type="number" min="0" value={q.points} onChange={(e) => updatePoints(q.id, parseInt(e.target.value) || 0)} className="w-14 p-1 text-center text-[16px] font-black bg-white border border-[#D1D8DD] rounded outline-none focus:border-[#1E4B95] text-[#222]" />
                                        <span className="text-[13px] font-bold text-[#666] mr-1">Points</span>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    {['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.type) && (
                                        <div className="flex flex-col gap-y-2">
                                            {q.choices.map((choice, cIndex) => {
                                                const isCorrect = q.correctAnswers.includes(choice) && choice.trim() !== '';
                                                return (
                                                    <div key={cIndex} onClick={() => toggleCorrectChoice(q.id, cIndex, q.type)} className={`flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all ${isCorrect ? 'border-[#1E4B95] bg-[#1E4B95]/5' : 'border-transparent hover:bg-gray-100'} ${!choice.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <div className="flex items-center gap-x-3 text-[#222]">
                                                            {q.type === 'Multiple Choice' && <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isCorrect ? 'border-[#1E4B95]' : 'border-gray-400'}`}>{isCorrect && <div className="w-2.5 h-2.5 rounded-full bg-[#1E4B95]" />}</div>}
                                                            {q.type === 'Checkboxes' && <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isCorrect ? 'border-[#1E4B95] bg-[#1E4B95]' : 'border-gray-400'}`}>{isCorrect && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}</div>}
                                                            <span className={`text-[15px] font-medium`}>{choice || `[Empty Choice]`}</span>
                                                        </div>
                                                        {isCorrect && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E4B95" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {q.type === 'Short Answer' && (
                                        <input type="text" placeholder="Correct Answer" value={q.correctAnswers[0] || ''} onChange={(e) => updateSingleAnswer(q.id, e.target.value)} className="w-full p-3 text-[15px] font-bold text-[#1E4B95] bg-white border-2 border-[#D1D8DD] rounded-lg outline-none focus:border-[#1E4B95]" />
                                    )}
                                    {q.type === 'Paragraph' && (
                                        <textarea placeholder="Expected answer or grading criteria..." value={q.correctAnswers[0] || ''} onChange={(e) => updateSingleAnswer(q.id, e.target.value)} className="w-full p-3 h-24 text-[15px] font-bold text-[#1E4B95] bg-white border-2 border-[#D1D8DD] rounded-lg outline-none focus:border-[#1E4B95] resize-none" />
                                    )}
                                    {q.type === 'Upload Image' && (
                                        <div className="text-[13px] text-gray-500 font-bold bg-gray-50 p-4 rounded border border-dashed border-gray-300">
                                            Answer must be an uploaded image. No key required. Points saved.
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-center border-t border-gray-100 pt-6">
                                    <button onClick={() => toggleAnswerKeyMode(q.id)} className="bg-[#1E4B95] text-white px-12 py-3 rounded-lg text-[14px] font-black uppercase hover:bg-[#153a6b] shadow-md transition-all">Done</button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={`edit-${q.id}`} className={`bg-[#F4F6F8] border-2 rounded-xl p-6 shadow-sm relative animate-in fade-in duration-300 ${q.hasKeyError ? 'border-[#ED1F24]/50' : 'border-[#D1D8DD]'}`}>
                            <div className="flex flex-col gap-y-3 mb-6">
                                <div className="flex-1 flex flex-col gap-y-1">
                                    {renderMathPreview(q.question)}
                                    <div className="flex items-start gap-x-2">
                                        <div className={`flex-1 flex items-center bg-white border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[#EFBD31] focus-within:border-[#EFBD31] ${q.hasError ? 'border-[#ED1F24] bg-red-50/30' : 'border-[#D1D8DD]'}`}>
                                            <input type="text" placeholder="Question Text (use $...$ for math)" value={q.question} onChange={(e) => updateQuestion(q.id, 'question', e.target.value)} className="w-full p-3 text-[15px] bg-transparent outline-none text-[#222]" />
                                            {q.hasError && <ErrorIcon />}
                                        </div>
                                        <button aria-label='dw' onClick={() => { setActiveMathTarget({ qId: q.id }); setShowMathModal(true); }} className="shrink-0 p-3 rounded-lg border border-[#D1D8DD] bg-white hover:bg-gray-50 text-[#0A7F93]">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /><path d="M8 7h6M11 4v6M8 14h6M8 17h6" /></svg>
                                        </button>
                                        <label className="shrink-0 p-3 rounded-lg cursor-pointer border bg-gray-50 hover:bg-gray-100 border-[#D1D8DD]">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                            <input aria-label='sw' type="file" accept=".jpg, .jpeg, .png" className="hidden" disabled={isPublishing} onChange={(e) => handleStageQuestionImage(q.id, e)} />
                                        </label>
                                    </div>
                                    {q.hasError && <span className="text-[12px] font-bold text-[#ED1F24] ml-1">Please enter a question or attach an image</span>}

                                    {/* QUESTION IMAGE PREVIEW RESTORED */}
                                    {(q.imageUrl || q.pendingQuestionImage) && (
                                        <div className="relative mt-3 inline-block">
                                            <img src={q.pendingQuestionImage ? URL.createObjectURL(q.pendingQuestionImage) : q.imageUrl} alt="Question" className="max-h-[150px] object-contain rounded border border-gray-200" />
                                            <button aria-label='dww' onClick={() => removeQuestionImage(q.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative w-full md:w-[220px]">
                                    <select aria-label='sw' value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value as QuestionType)} className="w-full p-3 text-[14px] font-bold text-[#222] bg-white border border-[#D1D8DD] rounded-lg outline-none appearance-none pr-10 focus:border-[#EFBD31]">
                                        {QUESTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            </div>

                            <div className="mb-6 ml-2">
                                {['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.type) && (
                                    <div className="flex flex-col gap-y-3">
                                        {q.choices.map((choice, cIndex) => (
                                            <div key={cIndex} className="flex flex-col gap-y-1">
                                                {renderMathPreview(choice)}
                                                <div className="flex items-center gap-x-2">
                                                    <div className={`flex-1 flex items-center bg-white border rounded-lg overflow-hidden focus-within:border-[#EFBD31] ${q.choiceErrors[cIndex] ? 'border-[#ED1F24] bg-red-50/30' : 'border-[#D1D8DD]'}`}>
                                                        <input type="text" placeholder={`Choice ${cIndex + 1}`} value={choice} onChange={(e) => updateChoice(q.id, cIndex, e.target.value)} className="w-full p-2.5 text-[14px] text-[#222] bg-transparent outline-none" />
                                                        {q.choiceErrors[cIndex] && <ErrorIcon />}
                                                    </div>
                                                    <button aria-label='wq' onClick={() => { setActiveMathTarget({ qId: q.id, choiceIndex: cIndex }); setShowMathModal(true); }} className="shrink-0 p-2.5 rounded-lg border border-[#D1D8DD] bg-white hover:bg-gray-50 text-[#0A7F93]">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /><path d="M8 7h6M11 4v6M8 14h6M8 17h6" /></svg>
                                                    </button>
                                                    {q.choices.length > 1 && (
                                                        <button aria-label='wqqq' onClick={() => removeChoice(q.id, cIndex)} className="text-[#0A7F93] hover:text-red-500 p-1 transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                                                    )}
                                                </div>
                                                {q.choiceErrors[cIndex] && <span className="text-[12px] font-bold text-[#ED1F24] ml-1">Please enter a choice</span>}
                                            </div>
                                        ))}
                                        <button onClick={() => addChoice(q.id)} className="w-full mt-2 py-2.5 bg-[#1A4C8B] text-white text-[13px] font-bold rounded-lg hover:bg-[#153a6b]">Add Choice</button>
                                    </div>
                                )}
                                {q.type === 'Short Answer' && (
                                    <input type="text" placeholder="Correct Answer" value={q.correctAnswers[0] || ''} onChange={(e) => updateSingleAnswer(q.id, e.target.value)} className="w-full p-3 text-[15px] font-bold text-[#1E4B95] bg-white border-2 border-[#D1D8DD] rounded-lg outline-none focus:border-[#1E4B95]" />
                                )}
                                {q.type === 'Paragraph' && (
                                    <textarea placeholder="Expected answer or grading criteria..." value={q.correctAnswers[0] || ''} onChange={(e) => updateSingleAnswer(q.id, e.target.value)} className="w-full p-3 h-24 text-[15px] font-bold text-[#1E4B95] bg-white border-2 border-[#D1D8DD] rounded-lg outline-none focus:border-[#1E4B95] resize-none" />
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-[#D1D8DD] pt-4 mt-2">
                                <button
                                    aria-label='delete-item'
                                    onClick={() => removeQuestion(q.id)}
                                    className="p-2 rounded-full bg-transparent hover:bg-[#0A7F93]/15 transition-all outline-none cursor-pointer flex items-center justify-center"
                                >
                                    <svg width="22" height="22" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                        <rect width="25" height="25" fill="url(#pattern0_2202_21448)" />
                                        <defs>
                                            <pattern id="pattern0_2202_21448" patternContentUnits="objectBoundingBox" width="1" height="1">
                                                <use xlinkHref="#image0_2202_21448" transform="scale(0.0078125)" />
                                            </pattern>
                                            <image id="image0_2202_21448" width="128" height="128" preserveAspectRatio="none" xlinkHref="data:image/png;base64,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" />
                                        </defs>
                                    </svg>
                                </button>
                                <div className="flex flex-col items-end gap-y-1">
                                    <div className="flex items-center">
                                        <button onClick={() => toggleAnswerKeyMode(q.id)} className={`font-bold text-[14px] hover:underline flex items-center gap-x-1.5 ${q.hasKeyError ? 'text-[#ED1F24]' : 'text-[#1A4C8B]'}`}>
                                            Answer Key
                                        </button>
                                        {q.hasKeyError && <ErrorIcon />}
                                    </div>
                                    {q.hasKeyError && <span className="text-[12px] font-bold text-[#ED1F24]">Please set an answer key</span>}
                                    {!q.hasKeyError && (q.correctAnswers.length > 0 || q.type === 'Upload Image') && <span className="text-[11px] font-bold text-[#1E4B95] bg-[#1E4B95]/10 px-2 py-1 rounded">Key Set ({q.points}pt)</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4 mt-6">
                <button onClick={addQuestion} disabled={isPublishing} className="flex-1 py-3.5 bg-[#1A4C8B] text-white text-[14px] font-bold rounded-xl hover:bg-[#153a6b] shadow-md transition-colors disabled:opacity-50 outline-none">
                    + Add Blank Question
                </button>
                <button onClick={() => setShowWordBank(true)} disabled={isPublishing} className="flex-1 py-3.5 bg-white border-2 border-[#1A4C8B] text-[#1A4C8B] text-[14px] font-black rounded-xl hover:bg-[#F4F6F8] shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-x-2 outline-none">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path><line x1="8" y1="7" x2="16" y2="7"></line><line x1="8" y1="11" x2="16" y2="11"></line><line x1="8" y1="15" x2="12" y2="15"></line></svg>
                    Browse Word Bank
                </button>
            </div>

            {showWordBank && (
                <WordBankModal
                    onClose={() => setShowWordBank(false)}
                    onSelectQuestion={importFromWordBank}
                />
            )}

            {showMathModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] flex flex-col animate-in zoom-in-95 overflow-hidden">
                        <div className="bg-[#1A4C8B] px-6 py-5 flex items-center justify-between">
                            <h2 className="text-white font-black text-[15px] uppercase tracking-wider">Insert Math Formula</h2>
                            <button aria-label='lo' onClick={() => setShowMathModal(false)} className="text-white hover:opacity-70 outline-none"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                        </div>
                        <div className="p-8 bg-white flex flex-col gap-y-6">
                            <p className="text-[14px] font-bold text-[#666]">Click the keyboard icon to open the math virtual keyboard.</p>
                            <div className="bg-white border-2 border-[#D1D8DD] rounded-xl p-2 focus-within:border-[#EBB637] transition-colors shadow-inner min-h-[70px] flex items-center cursor-text" onClick={() => mathFieldRef.current?.focus()}>
                                {/* @ts-ignore */}
                                <math-field
                                    ref={mathFieldRef}
                                    style={{
                                        width: '100%',
                                        fontSize: '28px',
                                        outline: 'none',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#000000'
                                    }}
                                >
                                    {mathValue}
                                    {/* @ts-ignore */}
                                </math-field>
                            </div>
                        </div>
                        <div className="px-8 py-6 border-t border-gray-100 flex justify-end items-center gap-x-8">
                            <button onClick={() => setShowMathModal(false)} className="text-[#666] font-bold text-[15px]">Cancel</button>
                            <button onClick={insertMathIntoTarget} className="bg-[#1A4C8B] text-white px-10 py-3 rounded-lg font-black text-[15px] shadow-md">Insert Formula</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}