'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ParticipantAssessmentCard } from '@/components/card/ParticipantAssessmentCard';
import { Gr8RankPill } from '@/components/card/Gr8RankPill';
import { useRouter } from 'next/navigation';

import goldTrophy from '../../app/(teacher)/class-page/photos/gold-trophy.png';
import silverTrophy from '../../app/(teacher)/class-page/photos/silver-trophy.png';
import bronzeTrophy from '../../app/(teacher)/class-page/photos/bronze-trophy.png';
import blueBanner from '../../app/(teacher)/class-page/photos/blue-banner.png';
import redBanner from '../../app/(teacher)/class-page/photos/red-banner.png';
import yellowRect from '../../app/(teacher)/class-page/photos/horizontal-yellow-rectangle.png';
import AssessmentViewPage from '@/app/(teacher)/class-page/assesssment-view/page';


export function ParticipantsTabContent({
    participantsList = [],
    selectedParticipant,
    setSelectedParticipant,
    showQuarterlyReport,
    setShowQuarterlyReport,
    selectedAssessmentResult,
    setSelectedAssessmentResult
}: any) {
    const router = useRouter();

    // --- NEW STATES FOR FILTER AND DOWNLOAD ---
    const [selectedMonthYear, setSelectedMonthYear] = useState('');
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [viewingAnswers, setViewingAnswers] = useState<any | null>(null);

    if (!participantsList || participantsList.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center py-20 bg-[#F4EFED] rounded-[20px] border border-[#D1D8DD]">
                <p className="text-[#888] font-bold">No students found in this class.</p>
            </div>
        );
    }

    const top1 = participantsList[0];
    const top2 = participantsList[1];
    const top3 = participantsList[2];

    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // --- DOWNLOAD LOGIC: PDF (Simple Table) ---
    const handleDownloadPDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default;

        // Target the HIDDEN simple table container instead of the UI container
        const element = document.getElementById('simple-pdf-container');
        if (!element) return;

        // Temporarily display it for the capture, then hide it again
        element.style.display = 'block';

        const safeName = selectedParticipant?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'student';
        const fileName = `Monthly_Report_${safeName}_${selectedMonthYear}.pdf`;

        const opt: any = {
            margin: 0.5,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } // Portrait works better for simple tables
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.display = 'none'; // Hide it again after saving
            setShowDownloadOptions(false);
        });
    };

    // --- DOWNLOAD LOGIC: EXCEL (CSV) ---
    const handleDownloadExcel = () => {
        let csvContent = "data:text/csv;charset=utf-8,";

        // Headers
        csvContent += "Assessment Test No.,Assessment Test Score,Percentage of Score,No. of Items\n";

        // Rows (Use the filtered monthlyData defined below)
        const monthlyData = getFilteredData();
        monthlyData.forEach((row: any) => {
            csvContent += `${row.no},="${row.score}/${row.totalPoints || row.items}",${row.percentage},${row.items}\n`;
        });

        // Footer Totals
        const totalScore = monthlyData.reduce((acc: number, curr: any) => acc + curr.score, 0);
        const sumTotalItems = monthlyData.reduce((acc: number, curr: any) => acc + curr.items, 0);
        csvContent += `Total Score,${totalScore},Total No. of Items,${sumTotalItems}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const safeName = selectedParticipant?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'student';
        link.setAttribute("download", `Monthly_Report_${safeName}_${selectedMonthYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadOptions(false);
    };

    // --- HELPER: GET FILTERED DATA ---
    const getFilteredData = () => {
        if (!selectedParticipant) return [];
        return (selectedParticipant.reportData || []).filter((item: any) => {
            if (!item.date_accomplished || item.date_accomplished === 'N/A') return false;
            const date = new Date(item.date_accomplished);
            const itemMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return itemMonthYear === selectedMonthYear;
        });
    };


    if (!selectedParticipant && !showQuarterlyReport) {
        return (
            <div className="bg-[#F4EFED] rounded-[20px] pb-8 shadow-sm flex-1 flex flex-col overflow-hidden relative min-h-[852px]">
                {/* --- Visual Background Decorators --- */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

                    {/* Top Left */}
                    <div className="absolute left-[20px] md:left-[40px] top-[27px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="105" height="105" viewBox="0 0 105 105" fill="none">
                            <rect y="55" width="50" height="50" fill="#1E4B95" fillOpacity="0.5" />
                            <rect x="55" y="55" width="50" height="50" fill="#1E4B95" fillOpacity="0.5" />
                            <rect width="50" height="50" fill="#EFBD31" fillOpacity="0.5" />
                        </svg>
                    </div>

                    {/* Top Right */}
                    <div className="absolute right-[20px] md:right-[40px] top-[27px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="105" height="105" viewBox="0 0 105 105" fill="none">
                            <rect width="50" height="50" fill="#1E4B95" fillOpacity="0.5" />
                            <rect x="55" width="50" height="50" fill="#0F8B8D" fillOpacity="0.5" />
                            <rect y="55" width="50" height="50" fill="#E91D26" fillOpacity="0.5" />
                        </svg>
                    </div>

                    {/* Middle Left */}
                    <div className="absolute left-0 top-[40%]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="126" height="160" viewBox="0 0 126 160" fill="none">
                            <rect x="76" y="110" width="50" height="50" fill="#1E4B95" fillOpacity="0.5" />
                            <rect x="21" y="110" width="50" height="50" fill="#1E4B95" fillOpacity="0.5" />
                            <rect x="21" y="55" width="50" height="50" fill="#D9D9D9" />
                            <rect x="21" width="50" height="50" fill="#0F8B8D" fillOpacity="0.5" />
                            <rect y="55" width="16" height="50" fill="#E91D26" fillOpacity="0.5" />
                            <rect x="21" y="55" width="50" height="50" fill="#0F8B8D" fillOpacity="0.5" />
                            <rect x="76" y="55" width="50" height="50" fill="#EFBD31" fillOpacity="0.5" />
                        </svg>
                    </div>

                    {/* Middle Right */}
                    <div className="absolute right-0 top-[40%]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="160" viewBox="0 0 140 160" fill="none">
                            <rect width="50" height="50" transform="matrix(-1 0 0 1 105 110)" fill="#E91D26" fillOpacity="0.5" />
                            <rect width="50" height="50" transform="matrix(-1 0 0 1 50 110)" fill="#E91D26" fillOpacity="0.5" />
                            <rect width="50" height="50" transform="matrix(-1 0 0 1 105 55)" fill="#D9D9D9" />
                            <rect width="50" height="50" transform="matrix(-1 0 0 1 105 0)" fill="#EFBD31" fillOpacity="0.5" />
                            <rect width="30" height="50" transform="matrix(-1 0 0 1 140 55)" fill="#EFBD31" fillOpacity="0.5" />
                            <rect width="50" height="50" transform="matrix(-1 0 0 1 105 55)" fill="#0F8B8D" fillOpacity="0.5" />
                            <rect width="50" height="50" transform="matrix(-1 0 0 1 50 55)" fill="#1E4B95" fillOpacity="0.5" />
                        </svg>
                    </div>

                    {/* Bottom Left */}
                    <div className="absolute left-[12%] bottom-[18%]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="105" height="105" viewBox="0 0 105 105" fill="none">
                            <rect width="50" height="50" fill="#E91D26" fillOpacity="0.5" />
                            <rect x="55" width="50" height="50" fill="#EFBD31" fillOpacity="0.5" />
                            <rect x="49" y="55" width="50" height="50" fill="#0F8B8D" fillOpacity="0.5" />
                        </svg>
                    </div>

                    {/* Bottom Right */}
                    <div className="absolute right-[22%] bottom-[12%]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="105" height="50" viewBox="0 0 105 50" fill="none">
                            <rect width="50" height="50" fill="#1E4B95" fillOpacity="0.5" />
                            <rect x="55" width="50" height="50" fill="#EFBD31" fillOpacity="0.5" />
                        </svg>
                    </div>
                </div>

                <div className="relative flex justify-center items-end mt-12 mb-12 px-2 md:px-4 min-h-[250px] z-10">
                    <div className="absolute inset-x-0 top-0 flex flex-col items-center pointer-events-none z-0 w-full h-full">
                        <div className="w-[95%] max-w-[650px] relative">
                            <Image src={yellowRect} alt="Yellow bar" className="w-full h-auto object-contain z-10 relative" priority />
                        </div>
                        <div className="flex w-[90%] max-w-[600px] justify-center -mt-2 z-0 relative h-full">
                            <div className="w-1/2 relative h-[200px]"><Image src={blueBanner} alt="Blue Banner" fill className="object-contain object-top" /></div>
                            <div className="w-1/2 relative h-[200px]"><Image src={redBanner} alt="Red Banner" fill className="object-contain object-top" /></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end z-10 w-full relative pt-10 max-w-[850px] mx-auto px-1 sm:px-4">
                        <div className="flex flex-col items-center pb-4 w-[32%] z-20">
                            {top2 && (
                                <>
                                    <Image src={silverTrophy} alt="2nd Place" className="w-20 md:w-36 h-auto drop-shadow-md" />
                                    <Gr8RankPill rank={2} name={top2.name} onClick={() => setSelectedParticipant(top2)} className="mt-4 w-full" />
                                </>
                            )}
                        </div>
                        <div className="flex flex-col items-center z-30 pb-12 w-[36%]">
                            {top1 && (
                                <>
                                    <Image src={goldTrophy} alt="1st Place" className="w-24 md:w-48 h-auto drop-shadow-xl" />
                                    <Gr8RankPill rank={1} name={top1.name} onClick={() => setSelectedParticipant(top1)} className="mt-4 w-full transform scale-105" />
                                </>
                            )}
                        </div>
                        <div className="flex flex-col items-center pb-2 w-[32%] z-20">
                            {top3 && (
                                <>
                                    <Image src={bronzeTrophy} alt="3rd Place" className="w-16 md:w-32 h-auto drop-shadow-md" />
                                    <Gr8RankPill rank={3} name={top3.name} onClick={() => setSelectedParticipant(top3)} className="mt-4 w-full" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-20 px-4 md:px-[15%] pb-12 overflow-y-auto max-w-6xl mx-auto w-full mt-8 relative z-10">
                    {participantsList.slice(3).map((p: any) => (
                        <div className="flex justify-center w-full" key={p.id}>
                            <Gr8RankPill rank={p.rank} name={p.name} onClick={() => setSelectedParticipant(p)} className="w-full max-w-[370px]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (selectedParticipant && !showQuarterlyReport) {
        let rankBgColor = 'bg-[#0F8B8D]'; // Default Cyan
        if (selectedParticipant.rank === 1) rankBgColor = 'bg-[#EFBD31]'; // Gold
        else if (selectedParticipant.rank === 2) rankBgColor = 'bg-[#A8B2BC]'; // Silver
        else if (selectedParticipant.rank === 3) rankBgColor = 'bg-[#CD7F32]'; // Bronze
        return (
            <div className="bg-[#F4EFED] rounded-[20px] p-6 md:p-10 shadow-sm flex-1 animate-in slide-in-from-right-8 duration-300 relative">
                <button onClick={() => { setSelectedParticipant(null); setSelectedAssessmentResult(null); }} className="flex items-center gap-x-2 text-[#0F8B8D] font-bold text-[14px] mb-6 outline-none hover:opacity-70 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back to Rankings
                </button>

                <div className="bg-white border-2 border-[#0F8B8D] rounded-[30px] p-6 mb-8 flex items-center gap-6 shadow-sm">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[linear-gradient(146deg,#1E4B95_27.21%,rgba(15,139,141,0.85)_56.49%)] text-white rounded-full flex items-center justify-center text-[24px] font-black shadow-inner">
                        {selectedParticipant.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-[24px] md:text-[32px] font-black text-[#101720]">{selectedParticipant.name}</h1>
                        <span className={`${rankBgColor} text-black text-[16px] font-bold px-4 py-1.5 rounded-full mt-2 inline-block`}>
                            Rank: {getOrdinal(selectedParticipant.rank)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-y-4">
                    {!selectedParticipant.reportData || selectedParticipant.reportData.length === 0 ? (
                        <div className="text-center py-10 font-bold text-gray-400 italic">No assessments taken yet.</div>
                    ) : (
                        selectedParticipant.reportData.map((report: any, idx: number) => (
                            <ParticipantAssessmentCard
                                key={`${report.no}-${idx}`}
                                assessmentNumber={report.no}
                                title={report.title}
                                date={report.date_accomplished}
                                score={report.score}
                                totalPossiblePoints={report.totalPoints || report.items}
                                onClick={() => setSelectedAssessmentResult(report)}
                            />
                        ))
                    )}
                </div>

                <div className="mt-auto pt-12 flex justify-end">
                    <button onClick={() => setShowQuarterlyReport(true)} className="bg-[#1E4B95] text-white px-8 py-3 rounded-lg font-bold text-[14px] hover:opacity-80 transition-all shadow-md">
                        Monthly Completion Report
                    </button>
                </div>

                {/* MODAL (Assessment Details) */}
                {selectedAssessmentResult && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col overflow-hidden animate-in zoom-in-95">
                            <div className="bg-[#1E4B95] flex justify-between items-center px-6 py-4">
                                <h3 className="text-white font-extrabold text-[16px]">Assessment Test Result</h3>
                                <button aria-label='dee' onClick={() => setSelectedAssessmentResult(null)} className="text-white hover:opacity-70 font-black">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-6 flex flex-col gap-y-4">
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Assessment Test Number:</span><span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.no}</span></div>
                                <div className="flex justify-between items-start border-b border-[#D1D8DD] pb-2 gap-x-4">
                                    <span className="text-[#222] font-bold text-[13px] shrink-0 mt-0.5">
                                        Assessment Test Title:
                                    </span>
                                    <div className="text-[#222] font-medium text-[13px] text-right flex-1 min-w-0 break-words whitespace-normal leading-snug">
                                        {selectedAssessmentResult.title}
                                    </div>
                                </div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2 mt-4"><span className="text-[#222] font-bold text-[13px]">Student's Assessment Test Score:</span><span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.score}</span></div>

                                {/* Modal remains strictly "Number of Items" */}
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Number of Items:</span><span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.items}</span></div>

                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Percentage of Score:</span><span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.percentage}</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2 mt-4"><span className="text-[#222] font-bold text-[13px]">Date Accomplished:</span><span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.date_accomplished || 'N/A'}</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2 mt-4"><span className="text-[#222] font-bold text-[13px]">Time Accomplished:</span><span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.time_accomplished || 'N/A'}</span></div>

                                <button
                                    onClick={() => {
                                        const aid = selectedAssessmentResult.assessment_id || selectedAssessmentResult.id;
                                        const sid = selectedParticipant.id;
                                        const title = encodeURIComponent(selectedAssessmentResult.title);

                                        router.push(`/class-page/assesssment-view?aid=${aid}&sid=${sid}&title=${title}`);
                                    }}
                                    className="w-full mt-4 bg-[#0F8B8D] text-white py-4 rounded-xl font-bold text-[14px] hover:brightness-95 transition-all shadow-md flex justify-center items-center gap-2"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    View Exact Answers
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (showQuarterlyReport && selectedParticipant) {
        const now = new Date();
        const START_MONTH = 6;
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 1. Determine the start year of the CURRENT Academic Year
        // If today is before June, we are still in last year's academic year.
        const acadStartYear = currentMonth >= START_MONTH ? currentYear : currentYear - 1;

        // 2. Generate months from June of the Academic Start Year up to Today
        const availableMonths: string[] = [];
        let iterYear = acadStartYear;
        let iterMonth = START_MONTH;

        while (iterYear < currentYear || (iterYear === currentYear && iterMonth <= currentMonth)) {
            availableMonths.push(`${iterYear}-${String(iterMonth).padStart(2, '0')}`);
            iterMonth++;
            if (iterMonth > 12) {
                iterMonth = 1;
                iterYear++;
            }
        }

        // Put the newest month at the top of the dropdown
        availableMonths.reverse();


        // 2. SET DEFAULT TO CURRENT MONTH
        if (!selectedMonthYear) {
            setSelectedMonthYear(availableMonths[0]);
        }

        // 3. FILTER THE DATA
        const monthlyData = getFilteredData();
        const totalScore = monthlyData.reduce((acc: number, curr: any) => acc + curr.score, 0);
        const sumTotalItems = monthlyData.reduce((acc: number, curr: any) => acc + curr.items, 0);

        // 4. GET THE READABLE LABEL FOR THE UI
        let currentMonthYearLabel = "";
        if (selectedMonthYear) {
            const [yy, mm] = selectedMonthYear.split('-');
            const d = new Date(parseInt(yy), parseInt(mm) - 1, 1);
            currentMonthYearLabel = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        }

        return (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-300 min-h-full bg-[#F4EFED] rounded-[20px] overflow-hidden shadow-sm border border-[#D1D8DD]">
                <div className="bg-[#1E4B95] text-white p-6 md:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-x-6">
                        <button aria-label='dwdd' onClick={() => setShowQuarterlyReport(false)} className="hover:opacity-70 transition-opacity outline-none">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <h2 className="text-[20px] md:text-[24px] font-black tracking-wide font-lexend">Monthly Completion Report</h2>
                    </div>

                    {/* --- MONTH PICKER DROPDOWN --- */}
                    {availableMonths.length > 0 && (
                        <select
                            aria-label='e'
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="bg-white/20 border border-white/40 text-white rounded-lg px-4 py-2 font-bold outline-none cursor-pointer"
                        >
                            {availableMonths.map(month => {
                                const [y, m] = month.split('-');
                                const d = new Date(parseInt(y), parseInt(m) - 1, 1);
                                return (
                                    <option key={month} value={month} className="text-black">
                                        {d.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </option>
                                );
                            })}
                        </select>
                    )}
                </div>

                <div className="p-8 md:p-12 flex-1 flex flex-col">
                    <div className="bg-[#F4EFED] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[22px] font-black text-[#101720] font-lexend">{currentMonthYearLabel}</h3>
                            <h3 className="text-[18px] font-bold text-[#1E4B95] font-lexend">{selectedParticipant.name}</h3>
                        </div>

                        <div className="rounded-xl border border-[#D1D8DD] overflow-hidden bg-white shadow-sm">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="bg-[#1E4B95] text-white text-[14px] font-bold font-lexend">
                                        <th className="py-5 px-4 border-r border-white/20">Assessment Test No.</th>
                                        <th className="py-5 px-4 border-r border-white/20">Assessment Test Score</th>
                                        <th className="py-5 px-4 border-r border-white/20">Percentage of Score</th>
                                        <th className="py-5 px-4">No. of Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-gray-400 font-bold italic">
                                                No assessments found for {currentMonthYearLabel}.
                                            </td>
                                        </tr>
                                    ) : (
                                        monthlyData.map((row: any, i: number) => (
                                            <tr key={`${row.no}-${i}`} className="border-b border-[#D1D8DD]">
                                                <td className="py-5 font-bold text-[#101720] text-[15px] border-r border-[#D1D8DD]">{row.no}</td>
                                                <td className="py-5 font-bold text-[#101720] text-[15px] border-r border-[#D1D8DD]">
                                                    {row.score}/{row.totalPoints || row.items}
                                                </td>
                                                <td className="py-5 font-bold text-[#101720] text-[15px] border-r border-[#D1D8DD]">{row.percentage}</td>
                                                <td className="py-5 font-bold text-[#101720] text-[15px]">{row.items}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-[#1E4B95] text-white text-[15px] font-bold font-lexend">
                                    <tr>
                                        <td className="py-5 border-r border-white/20 text-center tracking-wide">Total Score</td>
                                        <td className="py-5 border-r border-white/20">{totalScore}</td>
                                        <td className="py-5 border-r border-white/20 text-center tracking-wide">Total No. of Items</td>
                                        <td className="py-5">{sumTotalItems}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="mt-auto pt-10 flex justify-end">
                        {/* Changed this button to open the modal instead of instantly downloading */}
                        <button
                            onClick={() => setShowDownloadOptions(true)}
                            className="bg-[#1E4B95] text-white px-10 py-3 rounded-xl font-bold text-[16px] hover:opacity-80 transition-all shadow-md active:scale-95 font-lexend"
                        >
                            Generate a copy
                        </button>
                    </div>
                </div>

                {/* --- DOWNLOAD OPTIONS MODAL --- */}
                {showDownloadOptions && (
                    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] flex flex-col p-8 text-center animate-in zoom-in-95">
                            <h2 className="text-2xl font-black text-[#101720] mb-2">Export Report</h2>
                            <p className="text-gray-500 mb-8 font-medium">Choose a format to download the monthly report for {selectedParticipant.name}.</p>

                            <div className="flex flex-col gap-y-3">
                                <button onClick={handleDownloadPDF} className="w-full bg-[#ED1F24] text-white py-4 rounded-xl font-bold hover:bg-[#cc0000] shadow-md transition-colors outline-none flex justify-center items-center gap-x-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    Download PDF
                                </button>
                                <button onClick={handleDownloadExcel} className="w-full bg-[#107c41] text-white py-4 rounded-xl font-bold hover:bg-[#0a5c30] shadow-md transition-colors outline-none flex justify-center items-center gap-x-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                    Download Excel (CSV)
                                </button>
                                <button onClick={() => setShowDownloadOptions(false)} className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold mt-2 hover:bg-gray-200 transition-colors outline-none">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- HIDDEN SIMPLE PDF TABLE --- */}
                {/* This element is rendered completely off-screen and without the complex UI designs. */}
                <div className="hidden">
                    <div id="simple-pdf-container" className="p-10 bg-white text-black font-sans">
                        <div className="mb-8">
                            <h1 className="text-2xl m-0 mb-2.5 font-bold">Monthly Completion Report</h1>
                            <h2 className="text-lg m-0 text-[#555555]">Student: {selectedParticipant.name}</h2>
                            <h3 className="text-base mt-1.5 mb-0 text-[#555555]">Month: {currentMonthYearLabel}</h3>
                        </div>

                        <table className="w-full border-collapse text-center">
                            <thead>
                                <tr className="bg-[#f0f0f0]">
                                    <th className="border border-[#cccccc] p-3 font-bold">Assessment Test No.</th>
                                    <th className="border border-[#cccccc] p-3 font-bold">Assessment Test Score</th>
                                    <th className="border border-[#cccccc] p-3 font-bold">Percentage of Score</th>
                                    <th className="border border-[#cccccc] p-3 font-bold">No. of Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((row: any, i: number) => (
                                    <tr key={i}>
                                        <td className="border border-[#cccccc] p-2.5">{row.no}</td>
                                        <td className="border border-[#cccccc] p-2.5">{row.score}/{row.totalPoints || row.items}</td>
                                        <td className="border border-[#cccccc] p-2.5">{row.percentage}</td>
                                        <td className="border border-[#cccccc] p-2.5">{row.items}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-[#f0f0f0] font-bold">
                                    <td className="border border-[#cccccc] p-3">Total Score</td>
                                    <td className="border border-[#cccccc] p-3">{totalScore}</td>
                                    <td className="border border-[#cccccc] p-3">Total No. of Items</td>
                                    <td className="border border-[#cccccc] p-3">{sumTotalItems}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>
        );
    }


    return null;
}