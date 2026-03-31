'use client';

import React, { useState, useEffect, useRef } from 'react';
import { uploadLessonMediaToTigris } from '@/app/service/upload';
import 'mathlive';

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
    onPublish: (questions: QuestionData[]) => void;
    initialQuestions?: QuestionData[];
    isEditing?: boolean;
    courseId: string; 
}

const QUESTION_TYPES: QuestionType[] = [
    'Multiple Choice', 'Checkboxes', 'Dropdown', 'Short Answer', 'Paragraph', 'Upload Image'
];

export function Gr8AssessmentEditor({ onBack, onPublish, initialQuestions, isEditing, courseId }: Gr8AssessmentEditorProps) {

    // --- MATH REFS & STATE ---
    const mathFieldRef = useRef<any>(null);
    const [showMathModal, setShowMathModal] = useState(false);
    const [mathValue, setMathValue] = useState('');
    // Tracks exactly which field we are adding math to (Question or a specific Choice index)
    const [activeMathTarget, setActiveMathTarget] = useState<{ qId: string, choiceIndex?: number } | null>(null);
    
    // --- ASSESSMENT STATE ---
    const [questions, setQuestions] = useState<QuestionData[]>(
        initialQuestions && initialQuestions.length > 0 
        ? initialQuestions.map(q => ({ ...q, hasKeyError: false, pendingQuestionImage: null, pendingAnswerImage: null }))
        : [
            { 
                id: Date.now().toString(), 
                type: 'Multiple Choice', 
                question: '', 
                imageUrl: '',
                pendingQuestionImage: null,
                choices: [''], 
                hasError: false, 
                choiceErrors: [false],
                points: 1,
                correctAnswers: [],
                pendingAnswerImage: null,
                isAnswerKeyMode: false,
                hasKeyError: false
            }
        ]
    );

    const [isPublishing, setIsPublishing] = useState(false);

    // --- 1. MATHLIVE UI FIXES ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mfe = customElements.get('math-field') as any;
            if (mfe) {
                mfe.fontsDirectory = 'https://unpkg.com/mathlive@0.109.0/dist/fonts/';
            }
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

    // --- HELPER: RENDER PREVIEW (Turn LaTeX into visual math) ---
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
        if (!activeMathTarget || !mathValue.trim()) {
            setShowMathModal(false);
            return;
        }

        const latexString = `$${mathValue}$`;

        setQuestions(questions.map(q => {
            if (q.id === activeMathTarget.qId) {
                // If it's a choice
                if (activeMathTarget.choiceIndex !== undefined) {
                    const newChoices = [...q.choices];
                    newChoices[activeMathTarget.choiceIndex] += latexString;
                    return { ...q, choices: newChoices };
                } 
                // If it's the question text
                return { ...q, question: q.question + latexString };
            }
            return q;
        }));

        setShowMathModal(false);
        setMathValue('');
        setActiveMathTarget(null);
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now().toString(), type: 'Multiple Choice', question: '', imageUrl: '',
            pendingQuestionImage: null, choices: [''], hasError: false, choiceErrors: [false],
            points: 1, correctAnswers: [], pendingAnswerImage: null, isAnswerKeyMode: false, hasKeyError: false
        }]);
    };

    const removeQuestion = (id: string) => {
        if (questions.length === 1) return; 
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: keyof QuestionData, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value, hasError: false } : q));
    };

    const addChoice = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, choices: [...q.choices, ''], choiceErrors: [...q.choiceErrors, false] } : q));
    };

    const updateChoice = (qId: string, index: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newChoices = [...q.choices];
                newChoices[index] = value;
                const newChoiceErrors = [...q.choiceErrors];
                newChoiceErrors[index] = false;
                return { ...q, choices: newChoices, choiceErrors: newChoiceErrors };
            }
            return q;
        }));
    };

    const removeChoice = (qId: string, index: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newChoices = q.choices.filter((_, i) => i !== index);
                const newChoiceErrors = q.choiceErrors.filter((_, i) => i !== index);
                return { ...q, choices: newChoices, choiceErrors: newChoiceErrors };
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
                if (type === 'Multiple Choice' || type === 'Dropdown') {
                    newCorrect = [choiceText];
                } else if (type === 'Checkboxes') {
                    if (newCorrect.includes(choiceText)) {
                        newCorrect = newCorrect.filter(c => c !== choiceText);
                    } else {
                        newCorrect.push(choiceText);
                    }
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
        const tempUrl = URL.createObjectURL(file);
        setQuestions(questions.map(q => q.id === qId ? { ...q, imageUrl: tempUrl, pendingQuestionImage: file } : q));
        e.target.value = ''; 
    };

    const handleStageAnswerImage = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const tempUrl = URL.createObjectURL(file);
        setQuestions(questions.map(q => q.id === qId ? { ...q, choices: [tempUrl], correctAnswers: [tempUrl], pendingAnswerImage: file, hasKeyError: false } : q));
        e.target.value = '';
    };

    const removeQuestionImage = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, imageUrl: '', pendingQuestionImage: null } : q));
    };
    
    const removeAnswerImage = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, choices: [''], correctAnswers: [''], pendingAnswerImage: null } : q));
    };

    const handlePublishClick = async () => {
        let isValid = true;
        setIsPublishing(true);
        try {
            for (let i = 0; i < questions.length; i++) {
                let q = questions[i];
                if (q.pendingQuestionImage) {
                    const formData = new FormData();
                    formData.append('file', q.pendingQuestionImage);
                    formData.append('courseId', courseId);
                    const res = await uploadLessonMediaToTigris(formData);
                    if (res.success && res.publicUrl) q.imageUrl = res.publicUrl;
                }
                if (q.type === 'Upload Image' && q.pendingAnswerImage) {
                    const formData = new FormData();
                    formData.append('file', q.pendingAnswerImage);
                    formData.append('courseId', courseId);
                    const res = await uploadLessonMediaToTigris(formData);
                    if (res.success && res.publicUrl) { q.choices = [res.publicUrl]; q.correctAnswers = [res.publicUrl]; }
                }
            }
            onPublish(questions);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const ErrorIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ED1F24" strokeWidth="2" className="absolute right-3 top-1/2 -translate-y-1/2">
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

            <div className="flex flex-col gap-y-6">
                {questions.map((q, qIndex) => {
                    if (q.isAnswerKeyMode) {
                        return (
                            <div key={`ans-${q.id}`} className="bg-white border-2 border-[#1E4B95] rounded-xl p-6 shadow-md relative animate-in fade-in duration-300">
                                <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-x-2 mb-1">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E4B95" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            <h3 className="text-[14px] font-extrabold text-[#1E4B95] uppercase tracking-wide">Answer Key</h3>
                                        </div>
                                       <div className="text-[16px] font-medium text-[#222]">{q.question || "Untitled Question"}</div>
                                        {q.imageUrl && (
                                            <img src={q.imageUrl} alt="Question" className="mt-3 max-h-[150px] object-contain rounded border border-gray-200 shadow-sm" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <input aria-label='num' type="number" min="0" value={q.points} onChange={(e) => updatePoints(q.id, parseInt(e.target.value) || 0)} className="w-14 p-1 text-center text-[16px] font-black bg-white border border-[#D1D8DD] rounded outline-none focus:border-[#1E4B95] text-[#222]"/>
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
                                </div>
                                <div className="flex justify-center border-t border-gray-100 pt-6">
                                    <button onClick={() => toggleAnswerKeyMode(q.id)} className="bg-[#1E4B95] text-white px-12 py-3 rounded-lg text-[14px] font-black uppercase hover:bg-[#153a6b] shadow-md transition-all">Done</button>
                                </div>
                            </div>
                        );
                    }

                    // --- NORMAL EDITING VIEW ---
                    return (
                        <div key={`edit-${q.id}`} className={`bg-[#F4F6F8] border-2 rounded-xl p-6 shadow-sm relative animate-in fade-in duration-300 ${q.hasKeyError ? 'border-[#ED1F24]/50' : 'border-[#D1D8DD]'}`}>
                            <div className="flex flex-col gap-y-3 mb-6">
                              <div className="flex-1 relative">
                                    {/* VISUAL MATH PREVIEW FOR QUESTION */}
                                    {renderMathPreview(q.question)}

                                    <div className="flex items-start gap-x-2">
                                        <div className="flex-1 relative">
                                            <input type="text" placeholder="Question Text (use $...$ for math)" value={q.question} onChange={(e) => updateQuestion(q.id, 'question', e.target.value)} className={`w-full p-3 text-[15px] bg-white border rounded-lg outline-none focus:border-[#EFBD31] focus:ring-1 focus:ring-[#EFBD31] text-[#222] ${q.hasError ? 'border-[#ED1F24] bg-red-50/30' : 'border-[#D1D8DD]'}`} />
                                            {q.hasError && <ErrorIcon />}
                                        </div>
                                        
                                        {/* QUESTION MATH BUTTON */}
                                        <button onClick={() => { setActiveMathTarget({ qId: q.id }); setShowMathModal(true); }} className="shrink-0 p-3 rounded-lg border border-[#D1D8DD] bg-gray-50 hover:bg-gray-100 text-[#0A7F93]" title="Insert Math Symbols">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 7h6M11 4v6M8 14h6M8 17h6" /></svg>
                                        </button>

                                        <label className={`shrink-0 p-3 rounded-lg cursor-pointer border bg-gray-50 hover:bg-gray-100 border-[#D1D8DD]`} title="Attach Image">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                            <input aria-label='de' type="file" accept="image/*" className="hidden" disabled={isPublishing} onChange={(e) => handleStageQuestionImage(q.id, e)} />
                                        </label>
                                    </div>

                                    {q.imageUrl && (
                                        <div className="mt-3 relative inline-block">
                                            <img src={q.imageUrl} alt="Preview" className="max-h-[150px] object-contain rounded-lg border border-gray-300 shadow-sm" />
                                            <button onClick={() => removeQuestionImage(q.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">×</button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative w-full md:w-[220px]">
                                    <select aria-label='sw' value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value as QuestionType)} className="w-full p-3 text-[14px] font-bold text-[#222] bg-white border border-[#D1D8DD] rounded-lg outline-none appearance-none pr-10 focus:border-[#EFBD31]">
                                        {QUESTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><path d="M6 9l6 6 6-6"/></svg>
                                </div>
                            </div>

                            <div className="mb-6 ml-2">
                                {['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.type) && (
                                    <div className="flex flex-col gap-y-3">
                                        {q.choices.map((choice, cIndex) => (
                                            <div key={cIndex} className="flex flex-col mb-1">
                                                {/* VISUAL MATH PREVIEW FOR CHOICE */}
                                                {renderMathPreview(choice)}
                                                <div className="flex items-center gap-x-4 relative">
                                                    <div className="flex-1 relative flex items-center gap-x-2">
                                                        <input type="text" placeholder={`Choice ${cIndex + 1}`} value={choice} onChange={(e) => updateChoice(q.id, cIndex, e.target.value)} className={`w-full p-2.5 text-[14px] text-[#222] bg-white border rounded-lg outline-none pr-10 ${q.choiceErrors[cIndex] ? 'border-[#ED1F24] bg-red-50/30' : 'border-[#D1D8DD]'}`} />
                                                        
                                                        {/* CHOICE MATH BUTTON */}
                                                        <button onClick={() => { setActiveMathTarget({ qId: q.id, choiceIndex: cIndex }); setShowMathModal(true); }} className="shrink-0 p-2.5 rounded-lg border border-[#D1D8DD] bg-white hover:bg-gray-50 text-[#0A7F93]" title="Math for Choice">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 7h6M11 4v6M8 14h6M8 17h6" /></svg>
                                                        </button>
                                                        {q.choiceErrors[cIndex] && <ErrorIcon />}
                                                    </div>
                                                    {q.choices.length > 1 && (
                                                        <button aria-label='edqs' onClick={() => removeChoice(q.id, cIndex)} className="text-[#0A7F93] hover:text-red-500 p-1 transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addChoice(q.id)} className="w-full mt-2 py-2.5 bg-[#1A4C8B] text-white text-[13px] font-bold rounded-lg hover:bg-[#153a6b] transition-colors">Add Choice</button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between border-t border-[#D1D8DD] pt-4 mt-2">
                                <button aria-label='w' onClick={() => removeQuestion(q.id)} className="text-[#0A7F93] hover:text-red-500 transition-colors"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                                <button onClick={() => toggleAnswerKeyMode(q.id)} className={`font-bold text-[14px] hover:underline flex items-center gap-x-1.5 text-[#1A4C8B]`}>Answer Key</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button onClick={addQuestion} disabled={isPublishing} className="w-full mt-6 py-3 bg-[#1A4C8B] text-white text-[14px] font-bold rounded-lg hover:bg-[#153a6b] shadow-md transition-colors disabled:opacity-50">Add Question</button>

            {showMathModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] flex flex-col animate-in zoom-in-95 overflow-hidden">
                        
                        <div className="bg-[#1A4C8B] px-6 py-5 flex items-center justify-between">
                            <h2 className="text-white font-black text-[15px] uppercase tracking-wider">Insert Math Formula</h2>
                            <button aria-label='sw' onClick={() => setShowMathModal(false)} className="text-white hover:opacity-70 transition-opacity outline-none">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-8 bg-white flex flex-col gap-y-6">
                            <p className="text-[14px] font-bold text-[#666]">Click the keyboard icon inside the box to open the math virtual keyboard.</p>
                            <div className="bg-white border-2 border-[#D1D8DD] rounded-xl px-4 py-3 min-h-[85px] flex items-center shadow-sm hover:border-[#1A4C8B] transition-colors cursor-text" onClick={() => mathFieldRef.current?.focus()}>
                                {/* @ts-ignore */}
                                <math-field 
                                    ref={mathFieldRef} 
                                    style={{ width: '100%', fontSize: '28px', outline: 'none', border: 'none', backgroundColor: 'transparent', color: '#000' }}
                                >
                                    {mathValue}
                                {/* @ts-ignore */}
                                </math-field>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-gray-100 flex justify-end items-center gap-x-8 bg-gray-50/30">
                            <button onClick={() => setShowMathModal(false)} className="text-[#666] font-bold text-[15px] hover:text-black transition-colors">Cancel</button>
                            <button onClick={insertMathIntoTarget} className="bg-[#1A4C8B] text-white px-10 py-3 rounded-lg font-black text-[15px] shadow-md hover:bg-[#153a6b] active:scale-95 transition-all">Insert Formula</button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}