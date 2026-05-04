'use client';

import React, { useRef } from 'react';

interface Gr8DllViewerProps {
    record: any;
    onBack: () => void;
}

// --- HELPER COMPONENT: Strictly locked to #ECF1F4 ---
const ViewerTd = ({ content, hasRightBorder = true, colSpan = 1 }: { content?: string, hasRightBorder?: boolean, colSpan?: number }) => (
    <td
        colSpan={colSpan}
        className={`border-b ${hasRightBorder ? 'border-r' : ''} border-[#B0B8C1] align-top p-4 bg-[#ECF1F4] text-[#222] text-[13px] font-medium whitespace-pre-wrap leading-relaxed`}
    >
        {content || ''}
    </td>
);

const printStyles = `
  @media print {
    @page { size: landscape; margin: 10mm; }
    body { background-color: white !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
`;

export const Gr8DllViewer: React.FC<Gr8DllViewerProps> = ({ record, onBack }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        // Dynamically import html2pdf.js for client-side use
        const html2pdf = (await import('html2pdf.js')).default;

        // Target the hidden "simple" container
        const element = document.getElementById('simple-dll-pdf-container');
        if (!element) return;

        // Show it momentarily for the capture
        element.style.display = 'block';

        const fileName = `Daily_Lesson_Log_${record.id || 'Export'}.pdf`;

        const opt = {
            margin: 0.5,
            filename: fileName,
            image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' as 'landscape' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // Hide it again after the download triggers
            element.style.display = 'none';
        });
    };
    if (!record || !record.data) return null;

    const data = record.data;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

    type ProcKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
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

    type RefKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    const reflectionLabels: { key: RefKey, label: string }[] = [
        { key: 'A', label: 'A. No. of learners who earned 80% in the evaluation' },
        { key: 'B', label: 'B. No. of learners who require additional activities for remediation who scored below 80%' },
        { key: 'C', label: 'C. Did the remedial lessons work? No. of learners who have caught up with the lesson' },
        { key: 'D', label: 'D. No. of learners who continue to require remediation' },
        { key: 'E', label: 'E. Which of my teaching strategies worked well? Why did these work?' },
        { key: 'F', label: 'F. What difficulties did I encounter which my principal or supervisor can help me solve?' },
        { key: 'G', label: 'G. What innovation or localized materials did I use/discover which I wish to share with other teachers?' },
    ];

    const TableHeader = () => (
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

    return (
        <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500 relative">
            <style>{printStyles}</style>
            <div className="flex items-center gap-x-3 mb-8 print:hidden">
                <button aria-label='d' onClick={onBack} className="p-1 -ml-1 hover:bg-black/5 rounded transition-colors outline-none cursor-pointer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h1 className="text-[22px] font-black text-[#222]">Daily Lesson Log</h1>
            </div>

            <div className="bg-[#ECF1F4] border-x border-t border-[#B0B8C1] rounded-sm shadow-sm w-full overflow-x-auto relative z-10 mb-12">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <TableHeader />
                    <tbody>
                        {/* I. Objectives */}
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px]">I. Objectives</td>
                            <td colSpan={5} className="border-b border-[#B0B8C1] bg-[#ECF1F4]"></td>
                        </tr>
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-bold text-[#222] text-[13px] leading-snug">A. Content standards</td>
                            {days.map(day => <ViewerTd key={`std-${day}`} content={data.objectives?.contentStandards?.[day]} />)}
                        </tr>
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-bold text-[#222] text-[13px] leading-snug">B. Performance standards</td>
                            {days.map(day => <ViewerTd key={`perf-${day}`} content={data.objectives?.performanceStandards?.[day]} />)}
                        </tr>
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-bold text-[#222] text-[13px] leading-snug">C. <span className="ml-2">Learning</span><br />competencies<br />(Write the LC<br />code for each)</td>
                            {days.map(day => <ViewerTd key={`lc-${day}`} content={data.objectives?.learningCompetencies?.[day]} />)}
                        </tr>

                        {/* II. Content */}
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-black text-[#222] text-[13px] leading-snug text-center">II. Content</td>
                            {days.map(day => <ViewerTd key={`con-${day}`} content={data.resources?.content?.[day]} />)}
                        </tr>

                        {/* III. Learning Resources */}
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center">III. Learning<br />Resources</td>
                            <td colSpan={5} className="border-b border-[#B0B8C1] bg-[#ECF1F4]"></td>
                        </tr>
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">1. Teacher's<br />Guide pages</td>
                            {days.map(day => <ViewerTd key={`tg-${day}`} content={data.resources?.teacherGuide?.[day]} />)}
                        </tr>
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">2. Learner's<br />Materials' pages</td>
                            {days.map(day => <ViewerTd key={`lm-${day}`} content={data.resources?.learnerMaterials?.[day]} />)}
                        </tr>
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">3. Textbook pages</td>
                            {days.map(day => <ViewerTd key={`tb-${day}`} content={data.resources?.textbookPages?.[day]} />)}
                        </tr>
                        <tr>
                            <td className="px-2 py-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[11px] leading-tight text-center">4. Additional Materials<br />from Learning<br />Resource Portal</td>
                            {days.map(day => <ViewerTd key={`am-${day}`} content={data.resources?.additionalMaterials?.[day]} />)}
                        </tr>
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug text-center">5. Other References</td>
                            {days.map(day => <ViewerTd key={`or-${day}`} content={data.resources?.otherReferences?.[day]} />)}
                        </tr>

                        {/* IV. Procedures */}
                        <tr>
                            <td className="p-3 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center">IV. Procedures</td>
                            <td colSpan={5} className="border-b border-[#B0B8C1] bg-[#ECF1F4]"></td>
                        </tr>
                        {procedureLabels.map((proc) => (
                            <tr key={`row-${proc.key}`}>
                                <td className="p-3 border-b border-r border-[#B0B8C1] align-top font-bold text-[#222] text-[12px] leading-snug pr-4">{proc.label}</td>
                                {days.map(day => <ViewerTd key={`proc-${proc.key}-${day}`} content={data.procedures?.[proc.key]?.[day]} />)}
                            </tr>
                        ))}

                        {/* V. Remarks */}
                        <tr>
                            <td className="w-[30%] p-4 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center align-top">V. Remarks</td>
                            <ViewerTd content={data.remarks} hasRightBorder={false} colSpan={5} />
                        </tr>

                        {/* VI. Reflection */}
                        <tr>
                            <td className="w-[30%] p-4 border-b border-r border-[#B0B8C1] font-black text-[#222] text-[13px] text-center">VI. Reflection</td>
                            <td colSpan={5} className="border-b border-[#B0B8C1] bg-[#ECF1F4]"></td>
                        </tr>
                        {reflectionLabels.map(ref => (
                            <tr key={`reflection-${ref.key}`}>
                                <td className="w-[30%] p-4 border-b border-r border-[#B0B8C1] align-middle font-bold text-[#222] text-[12px] leading-snug pr-4">{ref.label}</td>
                                <ViewerTd content={data.reflection?.[ref.key]} hasRightBorder={false} colSpan={5} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mb-12 print:hidden">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-[#0A7F93] hover:bg-[#0A7F93]/5 rounded-md transition-all font-bold text-[14px] cursor-pointer"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                </button>
            </div>

            {/* --- HIDDEN SIMPLE PDF TABLE --- */}
            <div className="hidden">
                <div id="simple-dll-pdf-container" className="p-8 bg-white text-black font-sans">
                    <div className="mb-6 border-b-2 border-black pb-2">
                        <h1 className="text-2xl font-bold">DAILY LESSON LOG</h1>
                        <p className="text-sm">Generated on: {new Date().toLocaleDateString()}</p>
                    </div>

                    <table className="w-full border-collapse border border-black text-[10px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 w-[15%]"></th>
                                <th className="border border-black p-2">Monday</th>
                                <th className="border border-black p-2">Tuesday</th>
                                <th className="border border-black p-2">Wednesday</th>
                                <th className="border border-black p-2">Thursday</th>
                                <th className="border border-black p-2">Friday</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Objectives */}
                            <tr className="bg-gray-50"><td colSpan={6} className="border border-black p-1 font-bold">I. OBJECTIVES</td></tr>
                            <tr>
                                <td className="border border-black p-2 font-bold">Content Standards</td>
                                {days.map(day => <td key={day} className="border border-black p-2">{data.objectives?.contentStandards?.[day]}</td>)}
                            </tr>
                            <tr>
                                <td className="border border-black p-2 font-bold">Performance Standards</td>
                                {days.map(day => <td key={day} className="border border-black p-2">{data.objectives?.performanceStandards?.[day]}</td>)}
                            </tr>

                            {/* Content */}
                            <tr className="bg-gray-50"><td colSpan={6} className="border border-black p-1 font-bold">II. CONTENT</td></tr>
                            <tr>
                                <td className="border border-black p-2 font-bold">Subject Matter</td>
                                {days.map(day => <td key={day} className="border border-black p-2">{data.resources?.content?.[day]}</td>)}
                            </tr>

                            {/* Procedures */}
                            <tr className="bg-gray-50"><td colSpan={6} className="border border-black p-1 font-bold">IV. PROCEDURES</td></tr>
                            {procedureLabels.map((proc) => (
                                <tr key={proc.key}>
                                    <td className="border border-black p-2 font-bold text-[9px]">{proc.label}</td>
                                    {days.map(day => (
                                        <td key={day} className="border border-black p-2">{data.procedures?.[proc.key]?.[day]}</td>
                                    ))}
                                </tr>
                            ))}

                            {/* Remarks & Reflection */}
                            <tr className="bg-gray-50"><td colSpan={6} className="border border-black p-1 font-bold">V. REMARKS & VI. REFLECTION</td></tr>
                            <tr>
                                <td className="border border-black p-2 font-bold">Remarks</td>
                                <td colSpan={5} className="border border-black p-2">{data.remarks}</td>
                            </tr>
                            {reflectionLabels.map(ref => (
                                <tr key={ref.key}>
                                    <td className="border border-black p-2 font-bold text-[9px]">{ref.label}</td> {/* Shows full text */}
                                    <td colSpan={5} className="border border-black p-2">{data.reflection?.[ref.key]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};