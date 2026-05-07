'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';
import { Gr8DllDatePicker } from './Gr8DllDatePicker';

interface Gr8DllEditorProps {
    onBack: () => void;
    onSaveComplete: (data: any) => void;
}

// --- HELPER COMPONENT: Auto-resizing Textarea ---
const AutoResizeTextarea = ({ value, onChange, placeholder, minHeight = '120px' }: { value: string, onChange: (val: string) => void, placeholder: string, minHeight?: string }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
                onChange(e.target.value);
                adjustHeight();
            }}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full h-full p-3 bg-transparent text-[#222] text-[13px] font-medium resize-none outline-none overflow-hidden placeholder:text-[#A0A0A0] block leading-relaxed"
        />
    );
};

// --- HELPER COMPONENT: The Tesla-Style Toggle ---
const DailyWeeklyToggle = ({ isWeekly, onChange }: { isWeekly: boolean, onChange: (val: boolean) => void }) => {
    return (
        <div className="mt-4 flex bg-[#EAEAEA] rounded-full p-1 relative w-[140px] shadow-inner">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${isWeekly ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`} />
            <button onClick={() => onChange(false)} className={`flex-1 relative z-10 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors outline-none ${!isWeekly ? 'text-[#222]' : 'text-[#888]'}`}>DAILY</button>
            <button onClick={() => onChange(true)} className={`flex-1 relative z-10 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors outline-none ${isWeekly ? 'text-[#222]' : 'text-[#888]'}`}>WEEKLY</button>
        </div>
    );
};

export const Gr8DllEditor: React.FC<Gr8DllEditorProps> = ({ onBack, onSaveComplete }) => {
    // --- MULTI-STEP FLOW STATE ---
    const [currentPart, setCurrentPart] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // --- SEPARATE TOGGLE STATES FOR CS & PS ---
    const [isCsWeekly, setIsCsWeekly] = useState(false);
    const [isPsWeekly, setIsPsWeekly] = useState(false);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
    type DayKey = typeof days[number];
    const emptyWeek = { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' };

    // --- PART 1 STATE: Objectives ---
    const [contentStandards, setContentStandards] = useState<Record<DayKey, string>>({ ...emptyWeek });
    const [performanceStandards, setPerformanceStandards] = useState<Record<DayKey, string>>({ ...emptyWeek });
    const [learningCompetencies, setLearningCompetencies] = useState<Record<DayKey, string>>({ ...emptyWeek });

    // --- PART 2 STATE: Content & Learning Resources ---
    const [content, setContent] = useState<Record<DayKey, string>>({ ...emptyWeek });
    const [teacherGuide, setTeacherGuide] = useState<Record<DayKey, string>>({ ...emptyWeek });
    const [learnerMaterials, setLearnerMaterials] = useState<Record<DayKey, string>>({ ...emptyWeek });
    const [textbookPages, setTextbookPages] = useState<Record<DayKey, string>>({ ...emptyWeek });
    const [additionalMaterials, setAdditionalMaterials] = useState<Record<DayKey, string>>({ ...emptyWeek });
    const [otherReferences, setOtherReferences] = useState<Record<DayKey, string>>({ ...emptyWeek });

    // --- PART 3 STATE: Procedures ---
    type ProcKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
    const [procedures, setProcedures] = useState<Record<ProcKey, Record<DayKey, string>>>({
        A: { ...emptyWeek }, B: { ...emptyWeek }, C: { ...emptyWeek }, D: { ...emptyWeek }, E: { ...emptyWeek },
        F: { ...emptyWeek }, G: { ...emptyWeek }, H: { ...emptyWeek }, I: { ...emptyWeek }, J: { ...emptyWeek }
    });

    const procedureLabels: { key: ProcKey, label: React.ReactNode }[] = [
        { key: 'A', label: <>A. Reviewing previous lessons or presenting the new lesson</> },
        { key: 'B', label: <>B. Establishing a purpose for the lesson</> },
        { key: 'C', label: <>C. Presenting examples/Instances of the new lesson</> },
        { key: 'D', label: <>D. Discussing new concepts and practicing new skills #1</> },
        { key: 'E', label: <>E. Discussing new concepts and practicing new skills #2</> },
        { key: 'F', label: <>F. Developing mastery</> },
        { key: 'G', label: <>G. Finding practical applications of concepts and skills in daily living</> },
        { key: 'H', label: <>H. Making generalizations and abstractions</> },
        { key: 'I', label: <>I. Evaluating learning</> },
        { key: 'J', label: <>J. Additional activities for application or remediation</> },
    ];

    // --- PART 4 STATE: Remarks & Reflection ---
    const [remarks, setRemarks] = useState('');
    type RefKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    const [reflection, setReflection] = useState<Record<RefKey, string>>({ A: '', B: '', C: '', D: '', E: '', F: '', G: '' });

    const reflectionLabels: { key: RefKey, label: string }[] = [
        { key: 'A', label: 'A. No. of learners who earned 80% in the evaluation' },
        { key: 'B', label: 'B. No. of learners who require additional activities for remediation who scored below 80%' },
        { key: 'C', label: 'C. Did the remedial lessons work? No. of learners who have caught up with the lesson' },
        { key: 'D', label: 'D. No. of learners who continue to require remediation' },
        { key: 'E', label: 'E. Which of my teaching strategies worked well? Why did these work?' },
        { key: 'F', label: 'F. What difficulties did I encounter which my principal or supervisor can help me solve?' },
        { key: 'G', label: 'G. What innovation or localized materials did I use/discover which I wish to share with other teachers?' },
    ];

    const hasUnsavedChanges = () => {
        const p1p2Changed = days.some(day =>
            contentStandards[day].trim() !== '' || performanceStandards[day].trim() !== '' || learningCompetencies[day].trim() !== '' ||
            content[day].trim() !== '' || teacherGuide[day].trim() !== '' || learnerMaterials[day].trim() !== '' ||
            textbookPages[day].trim() !== '' || additionalMaterials[day].trim() !== '' || otherReferences[day].trim() !== ''
        );
        const p3Changed = Object.values(procedures).some(week => days.some(day => week[day].trim() !== ''));
        const p4Changed = remarks.trim() !== '' || Object.values(reflection).some(val => val.trim() !== '');

        return p1p2Changed || p3Changed || p4Changed;
    };

    const handleBackClick = () => {
        if (currentPart > 1) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            setCurrentPart(currentPart - 1);
        } else if (hasUnsavedChanges()) {
            setIsDiscardModalOpen(true);
        } else {
            onBack();
        }
    };

    const handleNextPart = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setCurrentPart(currentPart + 1);
        }, 800);
    };

    const executeSave = () => {
        setIsReviewModalOpen(false);
        setIsLoading(true); // 1. Immediately show the loading overlay to block the editor

        // 2. Use a tiny, unnoticeable delay (300ms) to ensure the loading screen renders 
        // before the parent component takes over and transitions to the preview card.
        setTimeout(() => {
            onSaveComplete({
                toggles: { isCsWeekly, isPsWeekly },
                objectives: { contentStandards, performanceStandards, learningCompetencies },
                resources: { content, teacherGuide, learnerMaterials, textbookPages, additionalMaterials, otherReferences },
                procedures,
                remarks,
                reflection
            });
        }, 300);
    };

    const tableHeader = (
        <thead>
            <tr>
                <th className="w-[16.66%] p-3 border-b border-r border-[#B0B8C1]"></th>
                <th className="w-[16.66%] p-3 border-b border-r border-[#B0B8C1] text-center font-black text-[#222] text-[16px]">Monday</th>
                <th className="w-[16.66%] p-3 border-b border-r border-[#B0B8C1] text-center font-black text-[#222] text-[16px]">Tuesday</th>
                <th className="w-[16.66%] p-3 border-b border-r border-[#B0B8C1] text-center font-black text-[#222] text-[16px]">Wednesday</th>
                <th className="w-[16.66%] p-3 border-b border-r border-[#B0B8C1] text-center font-black text-[#222] text-[16px]">Thursday</th>
                <th className="w-[16.66%] p-3 border-b border-[#B0B8C1] text-center font-black text-[#222] text-[16px]">Friday</th>
            </tr>
        </thead>
    );

    const part1Rows = (
        <>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-top">
                    <div className="font-black text-[#222] text-[13px]">I. Objectives</div>
                </td>
                <td colSpan={5} className="border-b border-[#B0B8C1]"></td>
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-top">
                    <div className="font-bold text-[#222] text-[13px] leading-snug">
                        A. Content standards
                    </div>
                    {/* TOGGLE FOR CONTENT STANDARDS */}
                    <DailyWeeklyToggle isWeekly={isCsWeekly} onChange={setIsCsWeekly} />
                </td>
                {/* CONDITIONAL RENDER: 1 Col (Weekly) vs 5 Cols (Daily) */}
                {isCsWeekly ? (
                    <td colSpan={5} className="border-b border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea
                            value={contentStandards.monday}
                            onChange={(val) => setContentStandards(prev => ({ ...prev, monday: val }))}
                            placeholder="Type weekly content standard here..."
                        />
                    </td>
                ) : (
                    days.map(day => (
                        <td key={`content-std-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                            <AutoResizeTextarea value={contentStandards[day]} onChange={(val) => setContentStandards(prev => ({ ...prev, [day]: val }))} placeholder="" />
                        </td>
                    ))
                )}
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-top">
                    <div className="font-bold text-[#222] text-[13px] leading-snug">
                        B. Performance standards
                    </div>
                    {/* TOGGLE FOR PERFORMANCE STANDARDS */}
                    <DailyWeeklyToggle isWeekly={isPsWeekly} onChange={setIsPsWeekly} />
                </td>
                {/* CONDITIONAL RENDER: 1 Col (Weekly) vs 5 Cols (Daily) */}
                {isPsWeekly ? (
                    <td colSpan={5} className="border-b border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea
                            value={performanceStandards.monday}
                            onChange={(val) => setPerformanceStandards(prev => ({ ...prev, monday: val }))}
                            placeholder="Type weekly performance standard here..."
                        />
                    </td>
                ) : (
                    days.map(day => (
                        <td key={`perf-std-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                            <AutoResizeTextarea value={performanceStandards[day]} onChange={(val) => setPerformanceStandards(prev => ({ ...prev, [day]: val }))} placeholder="" />
                        </td>
                    ))
                )}
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-bold text-[#222] text-[13px] leading-snug">
                    C. <span className="ml-2">Learning</span><br />competencies<br />(Write the LC<br />code for each)
                </td>
                {days.map(day => (
                    <td key={`lc-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea value={learningCompetencies[day]} onChange={(val) => setLearningCompetencies(prev => ({ ...prev, [day]: val }))} placeholder="" />
                    </td>
                ))}
            </tr>
        </>
    );

    const part2Rows = (
        <>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-black text-[#222] text-[13px] leading-snug text-center">
                    II. Content
                </td>
                {days.map(day => (
                    <td key={`content-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea value={content[day]} onChange={(val) => setContent(prev => ({ ...prev, [day]: val }))} placeholder="" />
                    </td>
                ))}
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center">III. Learning<br />Resources</td>
                <td colSpan={5} className="border-b border-[#B0B8C1]"></td>
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">
                    1. Teacher's<br />Guide pages
                </td>
                {days.map(day => (
                    <td key={`tg-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea minHeight="60px" value={teacherGuide[day]} onChange={(val) => setTeacherGuide(prev => ({ ...prev, [day]: val }))} placeholder="Reference" />
                    </td>
                ))}
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">
                    2. Learner's<br />Materials' pages
                </td>
                {days.map(day => (
                    <td key={`lm-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea minHeight="60px" value={learnerMaterials[day]} onChange={(val) => setLearnerMaterials(prev => ({ ...prev, [day]: val }))} placeholder="Reference" />
                    </td>
                ))}
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">
                    3. Textbook pages
                </td>
                {days.map(day => (
                    <td key={`tb-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea minHeight="60px" value={textbookPages[day]} onChange={(val) => setTextbookPages(prev => ({ ...prev, [day]: val }))} placeholder="Reference" />
                    </td>
                ))}
            </tr>
            <tr>
                <td className="px-2 py-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[11px] leading-tight text-center">
                    4. Additional Materials<br />from Learning<br />Resource Portal
                </td>
                {days.map(day => (
                    <td key={`am-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea minHeight="60px" value={additionalMaterials[day]} onChange={(val) => setAdditionalMaterials(prev => ({ ...prev, [day]: val }))} placeholder="Reference" />
                    </td>
                ))}
            </tr>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">
                    5. Other References
                </td>
                {days.map(day => (
                    <td key={`or-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea minHeight="60px" value={otherReferences[day]} onChange={(val) => setOtherReferences(prev => ({ ...prev, [day]: val }))} placeholder="Reference" />
                    </td>
                ))}
            </tr>
        </>
    );

    const part3Rows = (
        <>
            <tr>
                <td className="p-3 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center">IV. Procedures</td>
                <td colSpan={5} className="border-b border-[#B0B8C1]"></td>
            </tr>
            {procedureLabels.map((proc) => (
                <tr key={`row-${proc.key}`}>
                    <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-bold text-[#222] text-[12px] leading-snug pr-4">
                        {proc.label}
                    </td>
                    {days.map(day => (
                        <td key={`proc-${proc.key}-${day}`} className="border-b border-r border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                            <AutoResizeTextarea
                                minHeight="140px"
                                value={procedures[proc.key][day]}
                                onChange={(val) => setProcedures(prev => ({
                                    ...prev,
                                    [proc.key]: { ...prev[proc.key], [day]: val }
                                }))}
                                placeholder=""
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );

    const part4RowsUnified = (
        <>
            <tr>
                <td className="p-4 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center align-top">
                    V. Remarks
                </td>
                <td colSpan={5} className="border-b border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                    <AutoResizeTextarea value={remarks} onChange={setRemarks} placeholder="" minHeight="180px" />
                </td>
            </tr>
            <tr>
                <td className="p-4 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center">
                    VI. Reflection
                </td>
                <td colSpan={5} className="border-b border-[#B0B8C1]"></td>
            </tr>
            {reflectionLabels.map(ref => (
                <tr key={`reflection-${ref.key}`}>
                    <td className="p-4 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug pr-4">
                        {ref.label}
                    </td>
                    <td colSpan={5} className="border-b border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                        <AutoResizeTextarea value={reflection[ref.key]} onChange={(val) => setReflection(prev => ({ ...prev, [ref.key]: val }))} placeholder="Reflection" minHeight="60px" />
                    </td>
                </tr>
            ))}
        </>
    );

    return (
        <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500 relative">

            <Gr8LoadingOverlay isLoading={isLoading} message="Loading..." />

            <div className="flex items-center gap-x-3 mb-8">
                <button aria-label='o' onClick={handleBackClick} className="p-1 -ml-1 hover:bg-black/5 rounded transition-colors outline-none cursor-pointer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h1 className="text-[22px] font-black text-[#222]">Daily Lesson Log</h1>
            </div>

            {/* PART 1 */}
            {currentPart === 1 && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-[#ECF1F4] border-x border-t border-[#B0B8C1] rounded-sm shadow-sm w-full overflow-x-auto relative z-10">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            {tableHeader}
                            <tbody>{part1Rows}</tbody>
                        </table>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button onClick={handleNextPart} className="bg-[#1A4C8B] text-white px-16 py-3 rounded-lg font-black text-[14px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg outline-none tracking-wide">Next</button>
                    </div>
                </div>
            )}

            {/* PART 2 */}
            {currentPart === 2 && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-[#ECF1F4] border-x border-t border-[#B0B8C1] rounded-sm shadow-sm w-full overflow-x-auto relative z-10">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            {tableHeader}
                            <tbody>{part2Rows}</tbody>
                        </table>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button onClick={handleNextPart} className="bg-[#1A4C8B] text-white px-16 py-3 rounded-lg font-black text-[14px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg outline-none tracking-wide">Next</button>
                    </div>
                </div>
            )}

            {/* PART 3 */}
            {currentPart === 3 && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-[#ECF1F4] border-x border-t border-[#B0B8C1] rounded-sm shadow-sm w-full overflow-x-auto relative z-10 mb-8">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            {tableHeader}
                            <tbody>{part3Rows}</tbody>
                        </table>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button onClick={handleNextPart} className="bg-[#1A4C8B] text-white px-16 py-3 rounded-lg font-black text-[14px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg outline-none tracking-wide">Next</button>
                    </div>
                </div>
            )}

            {/* PART 4 */}
            {currentPart === 4 && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-[#ECF1F4] border-x border-t border-[#B0B8C1] rounded-sm shadow-sm w-full overflow-hidden relative z-10 mb-8">
                        <table className="w-full text-left border-collapse">
                            <tbody>
                                <tr>
                                    <td className="w-[30%] p-4 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center align-top">
                                        V. Remarks
                                    </td>
                                    <td colSpan={5} className="border-b border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                                        <AutoResizeTextarea value={remarks} onChange={setRemarks} placeholder="" minHeight="180px" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-[30%] p-4 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center">
                                        VI. Reflection
                                    </td>
                                    <td colSpan={5} className="border-b border-[#B0B8C1]"></td>
                                </tr>
                                {reflectionLabels.map(ref => (
                                    <tr key={`reflection-${ref.key}`}>
                                        <td className="w-[30%] p-4 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug pr-4">
                                            {ref.label}
                                        </td>
                                        <td colSpan={5} className="border-b border-[#B0B8C1] align-top p-0 focus-within:bg-[#FFFDF5] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EFBD31] focus-within:relative z-10 transition-colors">
                                            <AutoResizeTextarea value={reflection[ref.key]} onChange={(val) => setReflection(prev => ({ ...prev, [ref.key]: val }))} placeholder="Reflection" minHeight="60px" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            type="button" // <-- ADD THIS
                            onClick={() => setIsReviewModalOpen(true)}
                            className="bg-[#1A4C8B] text-white px-20 py-3 rounded-lg font-black text-[14px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg outline-none tracking-wide"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            {/* PART 5: FULL REVIEW */}
            {currentPart === 5 && (
                <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="bg-[#ECF1F4] border-x border-t border-[#B0B8C1] rounded-sm shadow-sm w-full overflow-x-auto relative z-10 mb-8">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            {tableHeader}
                            <tbody>
                                {part1Rows}
                                {part2Rows}
                                {part3Rows}
                                {part4RowsUnified}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                        <button
                            type="button"
                            onClick={executeSave}
                            className="bg-[#1A4C8B] text-white px-20 py-3 rounded-lg font-black text-[14px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg outline-none tracking-wide"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-[#F4F6F8] rounded-md shadow-2xl p-8 w-full max-w-[380px] text-center animate-in zoom-in-95 duration-200">
                        <h2 className="text-[16px] font-black text-[#222] leading-snug mb-8">
                            Do you want to review the daily lesson log?
                        </h2>
                        <div className="flex justify-center gap-x-12">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsReviewModalOpen(false);
                                    setCurrentPart(5);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-[#ED1F24] font-black text-[14px] hover:opacity-70 transition-opacity outline-none"
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={executeSave}
                                className="text-[#ED1F24] font-black text-[14px] hover:opacity-70 transition-opacity outline-none"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDiscardModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-[#F4F6F8] rounded-md shadow-2xl p-8 w-full max-w-[380px] text-center animate-in zoom-in-95 duration-200">
                        <h2 className="text-[20px] font-black text-[#222] mb-3">Discard Changes?</h2>
                        <p className="text-[14px] text-[#666] font-medium leading-relaxed mb-8">
                            You have unsaved content. If you go back, your changes will be lost.
                        </p>
                        <div className="flex justify-center gap-x-12">
                            <button onClick={() => { setIsDiscardModalOpen(false); onBack(); }} className="text-[#ED1F24] font-black text-[14px] hover:opacity-70 transition-opacity outline-none">
                                Yes
                            </button>
                            <button onClick={() => setIsDiscardModalOpen(false)} className="text-[#ED1F24] font-black text-[14px] hover:opacity-70 transition-opacity outline-none">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};