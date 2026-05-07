'use client';

import React, { useState, useEffect } from 'react';
import { Gr8TextField } from '@/components/ui/Gr8TextField';
import { Gr8DateTimePicker } from '@/components/ui/Gr8DateTimePicker';
import { Gr8DllDatePicker } from '@/components/dll/Gr8DllDatePicker';
import { pickerToDate } from '@/lib/utils/utils';
import { checkAndLiftRestriction } from '@/app/service/moderation';

// --- ADD THIS HELPER COMPONENT ---
const Gr8MonthSelect = ({ label, value, onChange, hasError, errorMessage }: any) => {
    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    return (
        <div className="flex flex-col text-left">
            <label className="text-[12px] font-bold text-[#222] mb-1">{label}</label>
            <div className="relative">
                <select
                    aria-label='hii'
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full p-3 bg-transparent text-[#222] border rounded-lg text-[13px] font-medium outline-none appearance-none cursor-pointer transition-colors ${hasError ? 'border-[#ED1F24]' : 'border-[#D1D8DD] hover:border-[#1A4C8B] focus:border-[#1A4C8B]'
                        }`}
                >
                    <option value="" disabled hidden>Select Month</option>
                    {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
            {hasError && <span className="text-[11px] font-bold text-[#ED1F24] mt-1">{errorMessage}</span>}
        </div>
    );
};

export function AddContentModal({
    isEditingLesson, closeAddModal, addStep, setAddStep, selectedAddOption, setSelectedAddOption,
    handleProceedToDetails, handleAssessmentNextDetails, isAssessmentFormComplete, quarterNumber, setQuarterNumber,
    assessmentNumber, setAssessmentNumber, assessmentTitle, setAssessmentTitle, availableFrom, setAvailableFrom,
    availableUntil, setAvailableUntil, hasAssessmentDetailsError,
    weekNumber, setWeekNumber, lessonTitle, setLessonTitle, hasDetailsError, handleLessonNextDetails,
    handleDllNextDetails, dllSemesterNumber, setDllSemesterNumber, dllWeekNumber, setDllWeekNumber,
    dllAvailableFrom, setDllAvailableFrom, dllAvailableUntil, setDllAvailableUntil, hasDllDetailsError,
    dllFromError, dllUntilError,
    isRestricted,
    userId
}: any) {

    // --- 24 HOUR BAN STATE ---
    const [activelyRestricted, setActivelyRestricted] = useState(isRestricted);
    const [timeLeft, setTimeLeft] = useState({ h: 24, m: 0 });
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        async function verify() {
            if (isRestricted && userId) {
                setIsValidating(true);
                const result = await checkAndLiftRestriction(userId);

                if (!result.stillRestricted) {
                    setActivelyRestricted(false);
                } else {
                    setTimeLeft({
                        h: result.hoursRemaining ?? 24,
                        m: result.minutesRemaining ?? 0
                    });
                }
            } else {
                setActivelyRestricted(false);
            }

            setIsValidating(false);
        }
        verify();
    }, [isRestricted, userId]);

    const onNumberChange = (setter: (val: string) => void) => (val: string) => {
        setter(val.replace(/\D/g, ''));
    };

    const today = new Date();
    const selectedFromDate = pickerToDate(availableFrom);
    const untilMinDate = selectedFromDate || today;

    const options = [
        { id: 'lesson', label: 'Write a Lesson' },
        { id: 'assessment', label: 'Create Assessment Test' },
        { id: 'dll', label: 'Daily Lesson Log' },
        { id: 'blackboard', label: 'Virtual Blackboard' }
    ];

    if (isValidating) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="w-8 h-8 border-4 border-[#1A4C8B]/20 border-t-[#1A4C8B] rounded-full animate-spin"></div>
            </div>
        );
    }

    // --- HIJACK THE MODAL IF THE USER IS RESTRICTED ---
    if (activelyRestricted) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-[420px] relative animate-in zoom-in-95 duration-200 flex flex-col text-center">

                    {/* The specific 'X' close button from your image */}
                    <button aria-label="Close modal" onClick={closeAddModal} className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-800 transition-colors outline-none cursor-pointer">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <h2 className="text-[22px] font-black text-[#222] mb-4 mt-2">Account Restricted</h2>

                    <p className="text-[14px] text-[#666] font-medium leading-relaxed mb-6">
                        You have reached 3 warning strikes. You are currently restricted from posting new content.
                    </p>

                    <div className="bg-red-50 rounded-xl border border-red-100 p-4 mb-2">
                        <span className="text-[12px] font-extrabold text-[#ED1F24] uppercase tracking-wider block mb-1">
                            Restriction lifts automatically in:
                        </span>
                        <span className="text-[18px] font-black text-[#ED1F24]">
                            {/* Show both H and M */}
                            {timeLeft.h}h {timeLeft.m}m
                        </span>
                    </div>

                </div>
            </div>
        );
    }
    // ------------------------------------------------------------------

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
                            <Gr8MonthSelect label="Month" value={quarterNumber} onChange={setQuarterNumber} hasError={hasAssessmentDetailsError && !quarterNumber} errorMessage={hasAssessmentDetailsError && !quarterNumber ? "Please enter needed details" : ""} />
                            <Gr8TextField label="Assessment Number" value={assessmentNumber} onChange={onNumberChange(setAssessmentNumber)} hasError={hasAssessmentDetailsError && !assessmentNumber} errorMessage={hasAssessmentDetailsError && !assessmentNumber ? "Please enter needed details" : ""} showTopLabel />
                            <Gr8TextField label="Assessment Title" value={assessmentTitle} onChange={setAssessmentTitle} hasError={hasAssessmentDetailsError && !assessmentTitle} errorMessage={hasAssessmentDetailsError && !assessmentTitle ? "Please enter needed details" : ""} showTopLabel />

                            <div className="grid grid-cols-2 gap-x-3 mt-2">
                                <Gr8DateTimePicker label="Available From" value={availableFrom} onChange={setAvailableFrom} minDate={today} hasError={hasAssessmentDetailsError && !availableFrom} errorMessage={hasAssessmentDetailsError && !availableFrom ? "Please enter needed details" : ""} />
                                <Gr8DateTimePicker label="Available Until" value={availableUntil} onChange={setAvailableUntil} minDate={untilMinDate} hasError={hasAssessmentDetailsError && !availableUntil} errorMessage={hasAssessmentDetailsError && !availableUntil ? "Please enter needed details" : ""} />
                            </div>
                        </div>

                        <button onClick={handleAssessmentNextDetails} className="w-full py-3.5 text-[14px] font-black bg-[#1A4C8B] text-white rounded-lg transition-colors outline-none shadow-md hover:bg-[#153a6b]">
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
                            <Gr8TextField label="Week Number" value={weekNumber} onChange={onNumberChange(setWeekNumber)} hasError={hasDetailsError && !weekNumber} errorMessage="Please enter needed details" showTopLabel />
                            <Gr8TextField label="Lesson Title" value={lessonTitle} onChange={setLessonTitle} hasError={hasDetailsError && !lessonTitle} errorMessage="Please enter needed details" showTopLabel />
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
                        <p className="text-[12px] font-bold text-center text-[#222] mb-6">Please enter the needed details.</p>

                        <div className="flex flex-col gap-y-3 mb-8 text-left">
                            <Gr8MonthSelect label="Month" value={quarterNumber} onChange={setQuarterNumber} hasError={hasAssessmentDetailsError && !quarterNumber} errorMessage={hasAssessmentDetailsError && !quarterNumber ? "Please enter needed details" : ""} />
                            <Gr8TextField label="Week Number" value={dllWeekNumber} onChange={onNumberChange(setDllWeekNumber)} hasError={hasDllDetailsError && !dllWeekNumber} errorMessage="Please enter needed details" showTopLabel />

                            <div className="grid grid-cols-2 gap-x-3 mt-2">
                                <Gr8DllDatePicker
                                    label="Available From"
                                    value={dllAvailableFrom}
                                    onChange={setDllAvailableFrom}
                                    hasError={!!dllFromError}
                                    errorMessage={dllFromError}
                                />
                                <Gr8DllDatePicker
                                    label="Available Until"
                                    value={dllAvailableUntil}
                                    onChange={setDllAvailableUntil}
                                    hasError={!!dllUntilError}
                                    errorMessage={dllUntilError}
                                />
                            </div>
                        </div>

                        <button onClick={handleDllNextDetails} className="w-full py-3.5 bg-[#1A4C8B] text-white rounded-lg font-black uppercase shadow-md hover:bg-[#153a6b]">
                            Create Log
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}