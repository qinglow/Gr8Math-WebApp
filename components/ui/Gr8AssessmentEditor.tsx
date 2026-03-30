'use client';

import React, { useState } from 'react';
import { uploadLessonMediaToTigris } from '@/app/service/upload';

export type QuestionType = 'Multiple Choice' | 'Short Answer' | 'Paragraph' | 'Checkboxes' | 'Dropdown' | 'Upload Image';

export interface QuestionData {
    id: string;
    type: QuestionType;
    question: string;
    choices: string[];
    hasError: boolean;
    choiceErrors: boolean[];
    points: number;
    correctAnswers: string[];
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
    
    const [questions, setQuestions] = useState<QuestionData[]>(
        initialQuestions && initialQuestions.length > 0 
        ? initialQuestions.map(q => ({ ...q, hasKeyError: false }))
        : [
            { 
                id: Date.now().toString(), 
                type: 'Multiple Choice', 
                question: '', 
                choices: [''], 
                hasError: false, 
                choiceErrors: [false],
                points: 1,
                correctAnswers: [],
                isAnswerKeyMode: false,
                hasKeyError: false
            }
        ]
    );

    const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now().toString(),
            type: 'Multiple Choice',
            question: '',
            choices: [''],
            hasError: false,
            choiceErrors: [false],
            points: 1,
            correctAnswers: [],
            isAnswerKeyMode: false,
            hasKeyError: false
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
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, choices: [...q.choices, ''], choiceErrors: [...q.choiceErrors, false] };
            }
            return q;
        }));
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

    // Generic updater for single-answer types (Short Answer, Paragraph, Image)
    const updateSingleAnswer = (qId: string, answer: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { 
                    ...q, 
                    choices: [answer], 
                    correctAnswers: [answer], 
                    hasKeyError: false 
                };
            }
            return q;
        }));
    };

    const handleImageAnswerUpload = async (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [qId]: true })); 

        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId); 

        try {
            
            const result = await uploadLessonMediaToTigris(formData);

            if (result.success && result.publicUrl) {
                updateSingleAnswer(qId, result.publicUrl);
            } else {
                alert("Upload failed: " + result.error);
            }
        } catch (err) {
            console.error("Upload exception:", err);
            alert("An error occurred during upload.");
        } finally {
            setIsUploading(prev => ({ ...prev, [qId]: false }));
            e.target.value = ''; 
        }
    };

    const handlePublishClick = () => {
        let isValid = true;
        const validatedQuestions = questions.map(q => {
            let qError = false;
            let cErrors = [...q.choiceErrors];
            let keyError = false;

            if (!q.question.trim()) {
                qError = true;
                isValid = false;
            }

            let finalChoices = [...q.choices];
            let finalCorrectAnswers = [...q.correctAnswers];

            if (['Short Answer', 'Paragraph', 'Upload Image'].includes(q.type)) {
                if (q.correctAnswers.length > 0 && q.correctAnswers[0].trim() !== '') {
                    finalChoices = [q.correctAnswers[0].trim()];
                    finalCorrectAnswers = [q.correctAnswers[0].trim()];
                } else {
                    if (q.type === 'Short Answer') {
                        finalChoices = ['']; 
                        finalCorrectAnswers = [];
                    } else {
                        finalChoices = ['[Manual Grading]'];
                        finalCorrectAnswers = ['[Manual Grading]'];
                    }
                }
            }

            if (['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.type)) {
                finalChoices.forEach((c, i) => {
                    if (!c.trim()) {
                        cErrors[i] = true;
                        isValid = false;
                    }
                });
            }

            if (['Multiple Choice', 'Checkboxes', 'Dropdown', 'Short Answer'].includes(q.type)) {
                const validAnswers = finalCorrectAnswers.filter(ans => ans && ans.trim() !== '');
                if (validAnswers.length === 0) {
                    keyError = true; 
                    isValid = false; 
                }
            }

            return { 
                ...q, 
                choices: finalChoices, 
                correctAnswers: finalCorrectAnswers,
                hasError: qError, 
                choiceErrors: cErrors, 
                hasKeyError: keyError, 
                isAnswerKeyMode: false 
            };
        });

        setQuestions(validatedQuestions);

        if (isValid) {
            onPublish(validatedQuestions);
        } else {
            console.error("Publish blocked: Missing data or answer keys.");
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
                <button onClick={onBack} className="flex items-center gap-x-2 text-[22px] font-black text-[#222] hover:text-[#0A7F93] transition-colors outline-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    {isEditing ? 'Edit Assessment' : 'Create Assessment'} 
                </button>
                <button onClick={handlePublishClick} className="bg-[#1A4C8B] text-white px-6 py-2.5 rounded-lg font-bold text-[14px] hover:bg-[#153a6b] transition-colors shadow-sm outline-none">
                    {isEditing ? 'Update Assessment Test' : 'Publish Assessment Test'}
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
                                        <p className="text-[16px] font-medium text-[#222]">{q.question || "Untitled Question"}</p>
                                    </div>
                                    <div className="flex items-center gap-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <input 
                                            aria-label='num'
                                            type="number" 
                                            min="0" 
                                            value={q.points} 
                                            onChange={(e) => updatePoints(q.id, parseInt(e.target.value) || 0)}
                                            className="w-14 p-1 text-center text-[16px] font-black bg-white border border-[#D1D8DD] rounded outline-none focus:border-[#1E4B95] text-[#222]"
                                        />
                                        <span className="text-[13px] font-bold text-[#666] mr-1">Points</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    {['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.type) && (
                                        <div className="flex flex-col gap-y-2">
                                            <p className="text-[12px] font-bold text-[#666] mb-2 uppercase tracking-wide">Choose correct answer(s):</p>
                                            {q.choices.map((choice, cIndex) => {
                                                const isCorrect = q.correctAnswers.includes(choice) && choice.trim() !== '';
                                                return (
                                                    <div 
                                                        key={cIndex}
                                                        onClick={() => toggleCorrectChoice(q.id, cIndex, q.type)}
                                                        className={`flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all outline-none
                                                            ${isCorrect ? 'border-[#1E4B95] bg-[#1E4B95]/5' : 'border-transparent hover:bg-gray-100'}
                                                            ${!choice.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-x-3">
                                                            {q.type === 'Multiple Choice' && <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isCorrect ? 'border-[#1E4B95]' : 'border-gray-400'}`}>{isCorrect && <div className="w-2.5 h-2.5 rounded-full bg-[#1E4B95]" />}</div>}
                                                            {q.type === 'Checkboxes' && <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isCorrect ? 'border-[#1E4B95] bg-[#1E4B95]' : 'border-gray-400'}`}>{isCorrect && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}</div>}
                                                            {q.type === 'Dropdown' && <span className={`font-bold w-5 text-right shrink-0 ${isCorrect ? 'text-[#1E4B95]' : 'text-[#222]'}`}>{cIndex + 1}.</span>}
                                                            <span className={`text-[15px] font-medium ${isCorrect ? 'text-[#1E4B95] font-bold' : 'text-[#222]'}`}>{choice || `[Empty Choice]`}</span>
                                                        </div>
                                                        {isCorrect && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E4B95" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {q.type === 'Short Answer' && (
                                        <div className="flex flex-col gap-y-2">
                                            <p className="text-[12px] font-bold text-[#666] uppercase tracking-wide">Enter correct answer:</p>
                                            <input 
                                                type="text" 
                                                placeholder="Correct Answer" 
                                                value={q.correctAnswers[0] || ''}
                                                onChange={(e) => updateSingleAnswer(q.id, e.target.value)}
                                                className="w-full p-3 text-[15px] font-bold text-[#1E4B95] bg-white border-2 border-[#D1D8DD] rounded-lg outline-none transition-all focus:border-[#1E4B95]" 
                                            />
                                            <p className="text-[#A0A0A0] text-[11px] font-bold mt-1">Students must type this exactly (case-insensitive) to receive points.</p>
                                        </div>
                                    )}

                                    {q.type === 'Paragraph' && (
                                        <div className="flex flex-col gap-y-2">
                                            <p className="text-[12px] font-bold text-[#666] uppercase tracking-wide">Enter expected answer / rubric:</p>
                                            <textarea 
                                                placeholder="Correct Answer or grading criteria..." 
                                                value={q.correctAnswers[0] || ''}
                                                onChange={(e) => updateSingleAnswer(q.id, e.target.value)}
                                                className="w-full p-3 h-24 text-[15px] font-bold text-[#1E4B95] bg-white border-2 border-[#D1D8DD] rounded-lg outline-none transition-all focus:border-[#1E4B95] resize-none" 
                                            />
                                            <p className="text-[#A0A0A0] text-[11px] font-bold mt-1">This will be shown to you when manually grading the student's essay.</p>
                                        </div>
                                    )}

                                    {q.type === 'Upload Image' && (
                                        <div className="flex flex-col gap-y-3 p-6 bg-gray-50 rounded-lg border border-gray-200 items-center text-center">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                                            <p className="text-[13px] font-bold text-[#666]">Upload the expected image answer.</p>
                                            
                                            <label className={`text-white px-6 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer shadow-sm ${isUploading[q.id] ? 'bg-gray-400' : 'bg-[#1A4C8B] hover:bg-[#153a6b]'}`}>
                                                {isUploading[q.id] ? 'Uploading...' : 'Choose File'}
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    disabled={isUploading[q.id]}
                                                    onChange={(e) => handleImageAnswerUpload(q.id, e)} 
                                                />
                                            </label>

                                            {q.correctAnswers[0] && q.correctAnswers[0] !== '[Manual Grading]' && q.correctAnswers[0] !== '' && (
                                                <div className="mt-4 relative inline-block">
                                                    <img src={q.correctAnswers[0]} alt="Answer Key" className="max-w-[250px] max-h-[250px] object-contain rounded border border-gray-300 shadow-sm" />
                                                    <button 
                                                        onClick={() => updateSingleAnswer(q.id, '')} 
                                                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors"
                                                        title="Remove Image"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center border-t border-gray-100 pt-6">
                                    <button onClick={() => toggleAnswerKeyMode(q.id)} className="bg-[#1E4B95] text-white px-12 py-3 rounded-lg text-[14px] font-black uppercase tracking-wide hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 outline-none">
                                        Done
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    // --- NORMAL EDITING VIEW ---
                    return (
                        <div key={`edit-${q.id}`} className={`bg-[#F4F6F8] border-2 rounded-xl p-6 shadow-sm relative animate-in fade-in duration-300 transition-colors ${q.hasKeyError ? 'border-[#ED1F24]/50' : 'border-[#D1D8DD]'}`}>
                            
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Question" 
                                        value={q.question}
                                        onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                        className={`w-full p-3 text-[15px] bg-white border rounded-lg outline-none transition-all pr-10 focus:border-[#EFBD31] focus:ring-1 focus:ring-[#EFBD31] text-[#222]
                                            ${q.hasError ? 'border-[#ED1F24] bg-red-50/30' : 'border-[#D1D8DD]'}
                                        `}
                                    />
                                    {q.hasError && <ErrorIcon />}
                                    {q.hasError && <p className="text-[#ED1F24] text-[11px] font-bold mt-1 absolute -bottom-5 left-1">Please enter needed details.</p>}
                                </div>

                                <div className="relative w-full md:w-[220px]">
                                    <select 
                                        aria-label='sw'
                                        value={q.type}
                                        onChange={(e) => updateQuestion(q.id, 'type', e.target.value as QuestionType)}
                                        className="w-full p-3 text-[14px] font-bold text-[#222] bg-white border border-[#D1D8DD] rounded-lg outline-none cursor-pointer appearance-none pr-10 focus:border-[#EFBD31] focus:ring-1 focus:ring-[#EFBD31]"
                                    >
                                        {QUESTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><path d="M6 9l6 6 6-6"/></svg>
                                </div>
                            </div>

                            <div className="mb-6 ml-2">
                                {['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.type) && (
                                    <div className="flex flex-col gap-y-3">
                                        {q.choices.map((choice, cIndex) => (
                                            <div key={cIndex} className="flex items-center gap-x-4 relative">
                                                {q.type === 'Multiple Choice' && <div className="w-5 h-5 rounded-full border-2 border-gray-400 shrink-0" />}
                                                {q.type === 'Checkboxes' && <div className="w-5 h-5 rounded border-2 border-gray-400 shrink-0" />}
                                                {q.type === 'Dropdown' && <span className="font-bold text-[#222] w-5 text-right shrink-0">{cIndex + 1}.</span>}

                                                <div className="flex-1 relative">
                                                    <input 
                                                        type="text" 
                                                        placeholder={`Choice ${cIndex + 1}`}
                                                        value={choice}
                                                        onChange={(e) => updateChoice(q.id, cIndex, e.target.value)}
                                                        className={`w-full p-2.5 text-[14px] bg-white border rounded-lg outline-none transition-all pr-10 focus:border-[#EFBD31] focus:ring-1 focus:ring-[#EFBD31] text-[#222]
                                                            ${q.choiceErrors[cIndex] ? 'border-[#ED1F24] bg-red-50/30' : 'border-[#D1D8DD]'}
                                                        `}
                                                    />
                                                    {q.choiceErrors[cIndex] && <ErrorIcon />}
                                                    {q.choiceErrors[cIndex] && <p className="text-[#ED1F24] text-[10px] font-bold mt-1 absolute -bottom-4 left-1">Please enter needed details.</p>}
                                                </div>
                                                
                                                {q.choices.length > 1 && (
                                                    <button aria-label='dew' onClick={() => removeChoice(q.id, cIndex)} className="text-[#0A7F93] hover:text-red-500 transition-colors outline-none p-1">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={() => addChoice(q.id)} className="w-full mt-2 py-2.5 bg-[#1A4C8B] text-white text-[13px] font-bold rounded-lg hover:bg-[#153a6b] transition-colors outline-none">
                                            Add Choices
                                        </button>
                                    </div>
                                )}

                                {/* FULL PREVIEWS: Show the correct answer right inside the disabled box! */}
                                {q.type === 'Short Answer' && (
                                    <input 
                                        type="text" 
                                        disabled 
                                        placeholder="Short Answer text..." 
                                        value={q.correctAnswers[0] || ''}
                                        className="w-full p-3 text-[14px] font-bold text-gray-600 bg-transparent border-b-2 border-gray-300 outline-none cursor-not-allowed border-dashed" 
                                    />
                                )}

                                {q.type === 'Paragraph' && (
                                    <textarea 
                                        disabled 
                                        placeholder="Paragraph text..." 
                                        value={q.correctAnswers[0] || ''}
                                        className="w-full p-3 h-24 text-[14px] font-bold text-gray-600 bg-transparent border-2 border-gray-300 rounded-lg outline-none cursor-not-allowed resize-none border-dashed" 
                                    />
                                )}

                                {/* Preview the Tigris Image in the Normal View */}
                                {q.type === 'Upload Image' && (
                                    <div className="flex items-center gap-x-4">
                                        <button disabled className="bg-[#E9E9E9] text-gray-400 px-8 py-2.5 rounded-lg text-[13px] font-bold cursor-not-allowed border-2 border-dashed border-gray-300">
                                            Upload Image Field
                                        </button>
                                        {q.correctAnswers[0] && q.correctAnswers[0] !== '[Manual Grading]' && q.correctAnswers[0] !== '' && (
                                            <div className="flex flex-col items-start gap-y-1 ml-4">
                                                <span className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider">Answer Key Preview:</span>
                                                <img src={q.correctAnswers[0]} alt="Key Preview" className="h-16 max-w-[200px] object-contain rounded border border-gray-300 shadow-sm" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-[#D1D8DD] pt-4 mt-2">
                                <button onClick={() => removeQuestion(q.id)} className="text-[#0A7F93] hover:text-red-500 transition-colors outline-none" title="Delete Question">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                                
                                <div className="flex items-center gap-x-4">
                                    {q.hasKeyError && <span className="text-[#ED1F24] text-[11px] font-bold animate-pulse">Required: Set Answer Key!</span>}
                                    
                                    {q.correctAnswers.length > 0 && !q.hasKeyError && <span className="text-[11px] font-bold text-[#1E4B95] bg-[#1E4B95]/10 px-2 py-1 rounded">Key Set ({q.points}pt)</span>}
                                    
                                    <button 
                                        onClick={() => toggleAnswerKeyMode(q.id)} 
                                        className={`font-bold text-[14px] hover:underline outline-none flex items-center gap-x-1.5 ${q.hasKeyError ? 'text-[#ED1F24]' : 'text-[#1A4C8B]'}`}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        Answer Key
                                    </button>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

            <button onClick={addQuestion} className="w-full mt-6 py-3 bg-[#1A4C8B] text-white text-[14px] font-bold rounded-lg hover:bg-[#153a6b] transition-colors shadow-md outline-none">
                Add Question
            </button>
            
        </div>
    );
}