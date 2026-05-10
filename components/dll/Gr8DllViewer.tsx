'use client';

import React, { useRef } from 'react';
import schoolLogo from '@/app/(teacher)/class-page/photos/benigno.png';
import depedLogo from '@/app/(teacher)/class-page/photos/Seal_of_the_Department_of_Education_of_the_Philippines.png';

interface Gr8DllViewerProps {
    record: any;
    onBack: () => void;
    userName?: string;
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

const formatToDisplayDate = (raw?: string) => {
    if (!raw) return '';

    // 1) Try parsing the whole string directly
    let date = new Date(raw);
    if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    // 2) If that fails, extract the date part: either "Month DD, YYYY" or "YYYY-MM-DD"
    //    This handles strings like "May 18, 2026 08:00am" or "2026-05-18 08:00:00"
    const dateOnlyMatch = raw.match(/^[A-Z][a-z]+\s\d{1,2},?\s\d{4}/)   // May 18, 2026
        || raw.match(/^\d{4}-\d{2}-\d{2}/);               // 2026-05-18

    if (dateOnlyMatch) {
        date = new Date(dateOnlyMatch[0]);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
    }

    // 3) Ultimate fallback – just return the raw string (unlikely to be reached)
    return raw;
};

const printStyles = `
  @media print {
    @page { size: landscape; margin: 10mm; }
    body { background-color: white !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    tr { page-break-inside: avoid !important; } /* Prevents rows from cutting in half */
  }
`;

export const Gr8DllViewer: React.FC<Gr8DllViewerProps> = ({ record, onBack, userName }) => {
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
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' as 'landscape' },
            pagebreak: { avoid: 'tr' } // Prevents rows from being cut in half
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
                <div id="simple-dll-pdf-container" className="p-4 bg-white text-black font-sans w-full">

                    {/* Header Grid Table */}
                    <table className="w-full border-collapse border border-black text-[10px]" style={{ tableLayout: 'fixed' }}>
                        <tbody>
                            <tr>
                                <td rowSpan={3} className="border border-black p-2 w-[25%] text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        <img src={depedLogo.src} alt="DepEd Logo" className="w-9 h-9 object-contain" />
                                        <img src={schoolLogo.src} alt="School Logo" className="w-9 h-9 object-contain" />
                                        <div className="text-left font-bold text-[10px] leading-tight">
                                            <p>MATATAG K TO 10 CURRICULUM</p>
                                            <p>DAILY LESSON LOG</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-black p-1 bg-[#e5e7eb] font-bold text-right pr-2 w-[15%]">School:</td>
                                <td className="border border-black p-1 pl-2 w-[25%]">Benigno &quot;Ninoy&quot; S. Aquino High School</td>
                                <td className="border border-black p-1 bg-[#e5e7eb] font-bold text-right pr-2 w-[15%]">Grade Level:</td>
                                <td className="border border-black p-1 pl-2 w-[20%]">8</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 bg-[#e5e7eb] font-bold text-right pr-2">Teacher:</td>
                                <td className="border border-black p-1 pl-2 capitalize">
                                    {userName && userName !== 'Teacher' ? userName : ''}
                                </td>
                                <td className="border border-black p-1 bg-[#e5e7eb] font-bold text-right pr-2">Learning Area:</td>
                                <td className="border border-black p-1 pl-2">Mathematics</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 bg-[#e5e7eb] font-bold text-right pr-2">Teaching Dates:</td>
                                <td colSpan={3} className="border border-black p-1 pl-2" style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>
                                    {record.from && record.to
                                        ? `${formatToDisplayDate(record.from)} - ${formatToDisplayDate(record.to)}`
                                        : ''}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Main Content Table */}
                    <table className="w-full border-collapse border border-black text-[9px]">
                        <tbody>
                            {/* Days Row Header */}
                            <tr className="bg-[#e5e7eb] font-bold text-center">
                                <td className="border border-black p-2 text-left w-[20%]"></td>
                                <td className="border border-black p-2 w-[16%]">Monday</td>
                                <td className="border border-black p-2 w-[16%]">Tuesday</td>
                                <td className="border border-black p-2 w-[16%]">Wednesday</td>
                                <td className="border border-black p-2 w-[16%]">Thursday</td>
                                <td className="border border-black p-2 w-[16%]">Friday</td>
                            </tr>

                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] font-bold">I. OBJECTIVES</td>
                                <td colSpan={5} className="border border-black p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb]">A. Content Standards</td>
                                {days.map(day => <td key={`cs-${day}`} className="border border-black p-2 align-top">{data.objectives?.contentStandards?.[day]}</td>)}
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb]">B. Performance Standards</td>
                                {days.map(day => <td key={`ps-${day}`} className="border border-black p-2 align-top">{data.objectives?.performanceStandards?.[day]}</td>)}
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb]">C. Learning Competencies/ Objectives<br />Write the LC Code for each.</td>
                                {days.map(day => <td key={`lc-${day}`} className="border border-black p-2 align-top">{data.objectives?.learningCompetencies?.[day]}</td>)}
                            </tr>

                            {/* Content Section */}
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] font-bold">II. CONTENT</td>
                                {days.map(day => <td key={`co-${day}`} className="border border-black p-2 font-bold text-center align-top">{data.resources?.content?.[day]}</td>)}
                            </tr>

                            {/* Learning Resources */}
                            <tr className="bg-[#e5e7eb] font-bold">
                                <td colSpan={6} className="border border-black p-2">III. LEARNING RESOURCES</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] pl-4">A. References</td>
                                <td colSpan={5} className="border border-black p-2"></td>
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] pl-6">1. Teacher's Guide pages</td>
                                {days.map(day => <td key={`tg-${day}`} className="border border-black p-2 align-top">{data.resources?.teacherGuide?.[day]}</td>)}
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] pl-6">2. Learner's Material pages</td>
                                {days.map(day => <td key={`lm-${day}`} className="border border-black p-2 align-top">{data.resources?.learnerMaterials?.[day]}</td>)}
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] pl-6">3. Textbook pages</td>
                                {days.map(day => <td key={`tb-${day}`} className="border border-black p-2 align-top">{data.resources?.textbookPages?.[day]}</td>)}
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] pl-6">4. Additional Materials from Learning Resource LR portal</td>
                                {days.map(day => <td key={`am-${day}`} className="border border-black p-2 align-top">{data.resources?.additionalMaterials?.[day]}</td>)}
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb] pl-4">B. Other Learning Resources</td>
                                {days.map(day => <td key={`or-${day}`} className="border border-black p-2 align-top">{data.resources?.otherReferences?.[day]}</td>)}
                            </tr>

                            {/* Procedures */}
                            <tr className="bg-[#e5e7eb] font-bold">
                                <td colSpan={6} className="border border-black p-2">IV. PROCEDURES</td>
                            </tr>
                            {procedureLabels.map((proc) => (
                                <tr key={`proc-row-${proc.key}`}>
                                    <td className="border border-black p-2 bg-[#e5e7eb]">{proc.label}</td>
                                    {days.map(day => (
                                        <td key={`proc-${proc.key}-${day}`} className="border border-black p-2 align-top whitespace-pre-wrap">{data.procedures?.[proc.key]?.[day]}</td>
                                    ))}
                                </tr>
                            ))}

                            {/* Remarks & Reflection */}
                            <tr className="bg-[#e5e7eb] font-bold">
                                <td colSpan={6} className="border border-black p-2">V. REMARKS</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-2 bg-[#e5e7eb]">Remarks</td>
                                <td colSpan={5} className="border border-black p-2 align-top">{data.remarks}</td>
                            </tr>

                            <tr className="bg-[#e5e7eb] font-bold">
                                <td colSpan={6} className="border border-black p-2">VI. REFLECTION</td>
                            </tr>
                            {reflectionLabels.map(ref => (
                                <tr key={`ref-${ref.key}`}>
                                    <td className="border border-black p-2 bg-[#e5e7eb]">{ref.label}</td>
                                    <td colSpan={5} className="border border-black p-2 align-top">{data.reflection?.[ref.key]}</td>
                                </tr>
                            ))}

                            {/* SIGNATURES SECTION */}
                            <tr className="bg-[#e5e7eb] font-bold">
                                <td colSpan={6} className="border border-black p-2">SIGNATURES</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="border border-black p-2 align-top h-24 relative">
                                    <div className="w-full h-full flex flex-col justify-between items-center pt-2">
                                        <span className="text-[9px]">Prepared by:</span>
                                        <div className="w-[80%] text-center">
                                            <div className="border-b border-black w-full pb-1 capitalize font-bold text-[10px] min-h-[16px]">
                                                {userName && userName !== 'Teacher' ? userName : ''}
                                            </div>
                                            <span className="text-[9px]">Teacher</span>
                                        </div>
                                    </div>
                                </td>
                                <td colSpan={3} className="border border-black p-2 align-top h-24 relative">
                                    <div className="w-full h-full flex flex-col justify-between items-center pt-2">
                                        <span className="text-[9px]">Checked by:</span>
                                        <div className="w-[80%] text-center">
                                            <div className="border-b border-black w-full pb-1 uppercase font-bold text-[10px] min-h-[16px]"></div>
                                            <span className="text-[9px]">School Head</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};