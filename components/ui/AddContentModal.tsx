'use client';

import React from 'react';
import { Gr8TextField } from '@/components/ui/Gr8TextField';
import { Gr8DateTimePicker } from '@/components/ui/Gr8DateTimePicker';
import { pickerToDate } from '@/lib/utils/utils';

export function AddContentModal({
    isEditingLesson, closeAddModal, addStep, setAddStep, selectedAddOption, setSelectedAddOption,
    handleProceedToDetails, handleAssessmentNextDetails, isAssessmentFormComplete, quarterNumber, setQuarterNumber,
    assessmentNumber, setAssessmentNumber, assessmentTitle, setAssessmentTitle, availableFrom, setAvailableFrom,
    availableUntil, setAvailableUntil, hasAssessmentDetailsError,
    weekNumber, setWeekNumber, lessonTitle, setLessonTitle, hasDetailsError, handleLessonNextDetails
}: any) {
    
    // Strict Number Validation for input fields
    const onNumberChange = (setter: (val: string) => void) => (val: string) => {
        setter(val.replace(/\D/g, ''));
    };

    // --- CALCULATE CALENDAR CONSTRAINTS ---
    // 1. Current moment to disable all past dates
    const today = new Date();

    // 2. Parse the "Available From" string to a Date object using our robust utility
    const selectedFromDate = pickerToDate(availableFrom);

    // 3. For the "Until" field, the calendar should disable everything before the "From" date.
    // If no "From" date is picked yet, it defaults to today.
    const untilMinDate = selectedFromDate || today;

    const options = [
        { id: 'lesson', label: 'Write a Lesson' },
        { id: 'assessment', label: 'Create Assessment Test' },
        { id: 'dll', label: 'Daily Lesson Log' }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[420px] relative animate-in zoom-in-95 duration-200 flex flex-col">

                {/* STEP 1: SELECT TYPE */}
                {addStep === 'select' && (
                    <>
                        <button aria-label="Close modal" onClick={closeAddModal} className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors outline-none cursor-pointer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <h2 className="text-[20px] font-extrabold text-[#222] mb-6 text-center">Add Content</h2>

                        <div className="flex flex-col gap-y-3 mb-8">
                            {options.map((opt) => (
                                <label key={opt.id} className={`flex items-center gap-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white hover:border-[#1A4C8B] ${selectedAddOption === opt.id ? 'border-[#1A4C8B]' : 'border-[#D1D8DD]'}`} onClick={() => setSelectedAddOption(opt.id)}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddOption === opt.id ? 'border-[#1A4C8B]' : 'border-[#B0B8C1]'}`}>
                                        {selectedAddOption === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1A4C8B]" />}
                                    </div>
                                    <span className="font-bold text-[#222]">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        <button onClick={handleProceedToDetails} disabled={!selectedAddOption} className={`w-full py-3.5 text-[13px] font-black rounded-lg uppercase tracking-wide transition-all outline-none flex items-center justify-center gap-x-2 ${selectedAddOption ? 'bg-[#1A4C8B] text-white shadow-md hover:bg-[#153a6b]' : 'bg-[#E9E9E9] text-[#A0A0A0] cursor-not-allowed'}`}>Proceed</button>
                    </>
                )}

                {/* STEP 2A: ASSESSMENT DETAILS FORM */}
                {addStep === 'details' && selectedAddOption === 'assessment' && (
                    <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col">
                        <div className="flex items-center justify-center mb-1 relative">
                            <button aria-label='assessment' onClick={() => isEditingLesson ? closeAddModal() : setAddStep('select')} className="absolute left-0 p-1 -ml-1 text-gray-600 hover:text-gray-900 transition-colors outline-none cursor-pointer">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <h2 className="text-[18px] font-extrabold text-[#222] text-center">Assessment Test</h2>
                        </div>
                        <p className="text-[12px] font-bold text-center text-[#222] mb-6">Please enter the needed details.</p>

                        <div className="flex flex-col gap-y-3 mb-8">
                            <Gr8TextField label="Quarter Number" value={quarterNumber} onChange={onNumberChange(setQuarterNumber)} hasError={hasAssessmentDetailsError && !quarterNumber} errorMessage="Please enter the needed details." showTopLabel />
                            <Gr8TextField label="Assessment Number" value={assessmentNumber} onChange={onNumberChange(setAssessmentNumber)} hasError={hasAssessmentDetailsError && !assessmentNumber} errorMessage="Please enter the needed details." showTopLabel />
                            <Gr8TextField label="Assessment Title" value={assessmentTitle} onChange={setAssessmentTitle} hasError={hasAssessmentDetailsError && !assessmentTitle} errorMessage="Please enter the needed details." showTopLabel />

                            <div className="grid grid-cols-2 gap-x-3 mt-2">
                                <Gr8DateTimePicker 
                                    label="Available From" 
                                    value={availableFrom} 
                                    onChange={setAvailableFrom} 
                                    minDate={today} // Pass today to disable past dates
                                    hasError={hasAssessmentDetailsError && !availableFrom} 
                                />
                                <Gr8DateTimePicker 
                                    label="Available Until" 
                                    value={availableUntil} 
                                    onChange={setAvailableUntil} 
                                    minDate={untilMinDate} // Pass the start date to disable earlier dates
                                    hasError={hasAssessmentDetailsError && !availableUntil} 
                                />
                            </div>
                            {hasAssessmentDetailsError && (!availableFrom || !availableUntil) && (
                                <p className="text-[#ED1F24] text-[10px] font-bold mt-1">Please select the valid schedule.</p>
                            )}
                        </div>

                        <button
                            onClick={handleAssessmentNextDetails}
                            className="w-full py-3.5 text-[14px] font-black bg-[#1A4C8B] text-white rounded-lg transition-colors outline-none shadow-md hover:bg-[#153a6b]"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* STEP 2B: LESSON DETAILS FORM */}
                {addStep === 'details' && selectedAddOption === 'lesson' && (
                    <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col">
                        <div className="flex items-center justify-center mb-6 relative">
                            <button aria-label='lesson' onClick={() => isEditingLesson ? closeAddModal() : setAddStep('select')} className="absolute left-0 p-1 -ml-1 text-gray-600 hover:text-gray-900 transition-colors outline-none cursor-pointer">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <h2 className="text-[18px] font-extrabold text-[#222]">Write a Lesson</h2>
                        </div>

                        <div className="flex flex-col gap-y-1 mb-8">
                            <Gr8TextField label="Week Number" value={weekNumber} onChange={onNumberChange(setWeekNumber)} hasError={hasDetailsError && !weekNumber} errorMessage="Please enter the needed details." showTopLabel />
                            <Gr8TextField label="Lesson Title" value={lessonTitle} onChange={setLessonTitle} hasError={hasDetailsError && !lessonTitle} errorMessage="Please enter the needed details." showTopLabel />
                        </div>

                        <button onClick={handleLessonNextDetails} className="w-full py-3.5 text-[13px] font-black rounded-lg uppercase tracking-wide transition-all outline-none bg-[#1A4C8B] text-white shadow-md hover:bg-[#153a6b]">
                            Next
                        </button>
                    </div>
                )}

                {/* STEP 2C: DLL DETAILS FORM */}
                {addStep === 'details' && selectedAddOption === 'dll' && (
                    <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col text-center">
                        <div className="flex items-center justify-center mb-6 relative">
                            <button aria-label='dll' onClick={() => setAddStep('select')} className="absolute left-0 p-1 -ml-1 text-gray-600 hover:text-gray-900 transition-colors outline-none cursor-pointer">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <h2 className="text-[18px] font-extrabold text-[#222]">Daily Lesson Log</h2>
                        </div>
                        <p className="text-[14px] text-[#666] mb-8">Click below to generate a new DLL log entry.</p>
                        <button onClick={closeAddModal} className="w-full py-3.5 bg-[#1A4C8B] text-white rounded-lg font-black uppercase shadow-md hover:bg-[#153a6b]">
                            Create Log
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}