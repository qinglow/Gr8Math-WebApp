import React from 'react';
import Image from 'next/image';
import { ParticipantAssessmentCard } from '@/components/card/ParticipantAssessmentCard';
import { Gr8RankPill } from '@/components/card/Gr8RankPill';

import goldTrophy from '../../app/(teacher)/class-page/photos/gold-trophy.png';
import silverTrophy from '../../app/(teacher)/class-page/photos/silver-trophy.png';
import bronzeTrophy from '../../app/(teacher)/class-page/photos/bronze-trophy.png';
import blueBanner from '../../app/(teacher)/class-page/photos/blue-banner.png';
import redBanner from '../../app/(teacher)/class-page/photos/red-banner.png';
import yellowRect from '../../app/(teacher)/class-page/photos/horizontal-yellow-rectangle.png';

// --- MOCK DATA ---
const MOCK_PARTICIPANTS = [
    { id: '1', name: 'Dela Cruz, Juan', rank: 1 },
    { id: '2', name: 'Dela Cruz, Juan', rank: 2 },
    { id: '3', name: 'Dela Cruz, Juan', rank: 3 },
    { id: '4', name: 'Dela Cruz, Juan', rank: 4 },
    { id: '5', name: 'Dela Cruz, Juan', rank: 5 },
    { id: '6', name: 'Dela Cruz, Juan', rank: 6 },
    { id: '7', name: 'Dela Cruz, Juan', rank: 7 },
    { id: '8', name: 'Dela Cruz, Juan', rank: 8 },
    { id: '9', name: 'Dela Cruz, Juan', rank: 9 },
    { id: '10', name: 'Dela Cruz, Juan', rank: 10 },
];

const MOCK_REPORT_DATA = [
    { no: 1, score: 10, items: 10, percentage: '100%', title: 'Polynomial' },
    { no: 2, score: 10, items: 10, percentage: '100%', title: 'Algebra' },
];

const TOTAL_SCORE = MOCK_REPORT_DATA.reduce((acc, curr) => acc + curr.score, 0);
const TOTAL_ITEMS = MOCK_REPORT_DATA.reduce((acc, curr) => acc + curr.items, 0);

export function ParticipantsTabContent({
    selectedParticipant,
    setSelectedParticipant,
    showQuarterlyReport,
    setShowQuarterlyReport,
    selectedAssessmentResult,
    setSelectedAssessmentResult
}: any) {

    if (!selectedParticipant && !showQuarterlyReport) {
        return (
            <div className="bg-[#F8F5EF] rounded-2xl pb-8 border border-[#D1D8DD] shadow-sm flex-1 flex flex-col overflow-hidden relative">
                {/* Decorative Background Blocks */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                    <div className="absolute top-10 left-10 opacity-[0.15] hidden md:block">
                        <div className="flex flex-col gap-1">
                            <div className="flex gap-1"><div className="w-8 h-8 bg-[#EFBD31]"></div><div className="w-8 h-8 bg-transparent"></div></div>
                            <div className="flex gap-1"><div className="w-8 h-8 bg-[#1A4C8B]"></div><div className="w-8 h-8 bg-[#1A4C8B]"></div></div>
                        </div>
                    </div>
                    {/* ... (Other decorative blocks omitted for brevity, but kept exact same styling) ... */}
                </div>

                {/* Layered Top 3 Container */}
                <div className="relative flex justify-center items-end mt-12 mb-12 px-2 md:px-4 min-h-[250px] z-10">
                    <div className="absolute inset-x-0 top-0 flex flex-col items-center pointer-events-none z-0 w-full h-full">
                        <div className="w-[95%] max-w-[650px] relative">
                            <Image src={yellowRect} alt="Yellow bar" className="w-full h-auto object-contain z-10 relative" quality={100} />
                        </div>
                        <div className="flex w-[90%] max-w-[600px] justify-center -mt-2 z-0 relative h-full">
                            <div className="w-1/2 relative h-[200px]"><Image src={blueBanner} alt="Blue Banner" fill className="object-contain object-top" quality={100} /></div>
                            <div className="w-1/2 relative h-[200px]"><Image src={redBanner} alt="Red Banner" fill className="object-contain object-top" quality={100} /></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end z-10 w-full relative pt-10 max-w-[850px] mx-auto px-1 sm:px-4">
                        {/* Rank 2 (Silver) */}
                        <div className="flex flex-col items-center pb-4 w-[32%] z-20">
                            <Image src={silverTrophy} alt="2nd Place" className="w-20 md:w-36 h-auto object-contain drop-shadow-md" quality={100} />
                            <div className="mt-2 md:mt-4 w-full px-0.5 sm:px-2 flex justify-center">
                                <Gr8RankPill rank={2} name={MOCK_PARTICIPANTS[1].name} onClick={() => setSelectedParticipant(MOCK_PARTICIPANTS[1])} className="w-full max-w-[180px]" />
                            </div>
                        </div>

                        {/* Rank 1 (Gold) */}
                        <div className="flex flex-col items-center z-30 pb-12 w-[36%]">
                            <Image src={goldTrophy} alt="1st Place" className="w-24 md:w-48 h-auto object-contain drop-shadow-xl" quality={100} />
                            <div className="mt-2 md:mt-4 w-full px-0.5 sm:px-2 flex justify-center">
                                <Gr8RankPill rank={1} name={MOCK_PARTICIPANTS[0].name} onClick={() => setSelectedParticipant(MOCK_PARTICIPANTS[0])} className="w-full max-w-[220px] shadow-md transform md:scale-105" />
                            </div>
                        </div>

                        {/* Rank 3 (Bronze) */}
                        <div className="flex flex-col items-center pb-2 w-[32%] z-20">
                            <Image src={bronzeTrophy} alt="3rd Place" className="w-16 md:w-32 h-auto object-contain drop-shadow-md" quality={100} />
                            <div className="mt-2 md:mt-4 w-full px-0.5 sm:px-2 flex justify-center">
                                <Gr8RankPill rank={3} name={MOCK_PARTICIPANTS[2].name} onClick={() => setSelectedParticipant(MOCK_PARTICIPANTS[2])} className="w-full max-w-[180px]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6 px-4 md:px-12 pb-12 overflow-y-auto max-w-5xl mx-auto w-full mt-8 relative z-10">
                    {MOCK_PARTICIPANTS.slice(3).map((p) => (
                        <Gr8RankPill key={p.id} rank={p.rank} name={p.name} onClick={() => setSelectedParticipant(p)} className="w-full max-w-[400px]" />
                    ))}
                </div>
            </div>
        );
    }

    if (selectedParticipant) {
        return (
            <div className="bg-[#F8F5EF] rounded-2xl p-6 md:p-10 border border-[#D1D8DD] shadow-sm flex-1 flex flex-col relative animate-in slide-in-from-right-8 duration-300">
                <button onClick={() => setSelectedParticipant(null)} className="flex items-center gap-x-2 text-[#0A7F93] font-bold text-[14px] hover:text-[#1A4C8B] transition-colors mb-6 outline-none w-fit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back to Rankings
                </button>

                <div className="bg-white border border-[#D1D8DD] rounded-xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1A4C8B] to-[#0A7F93] text-white rounded-full flex items-center justify-center text-[24px] md:text-[32px] font-black shadow-inner shrink-0">
                        {selectedParticipant.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-[24px] md:text-[32px] font-black text-[#222] leading-tight">
                            {selectedParticipant.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="bg-[#EFBD31] text-[#222] text-[12px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
                                Rank: {selectedParticipant.rank}{selectedParticipant.rank === 1 ? 'st' : selectedParticipant.rank === 2 ? 'nd' : selectedParticipant.rank === 3 ? 'rd' : 'th'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-y-4">
                    {MOCK_REPORT_DATA.map((report) => (
                        <ParticipantAssessmentCard
                            key={report.no}
                            assessmentNumber={report.no}
                            title={report.title}
                            score={report.score}
                            totalItems={report.items}
                            onClick={() => setSelectedAssessmentResult({ num: report.no, title: report.title })}
                        />
                    ))}
                </div>

                <div className="mt-auto pt-12 flex justify-end">
                    <button
                        onClick={() => setShowQuarterlyReport(true)}
                        className="bg-[#1A4C8B] text-white px-6 md:px-8 py-3 rounded-lg font-bold text-[13px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 outline-none"
                    >
                        Quarterly Completion Report
                    </button>
                </div>

                {selectedAssessmentResult && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 rounded-2xl animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="bg-[#1A4C8B] flex justify-between items-center px-6 py-4">
                                <h3 className="text-white font-extrabold text-[16px]">Assessment Test Result</h3>
                                <button aria-label='assessment' onClick={() => setSelectedAssessmentResult(null)} className="text-white hover:text-gray-300 transition-colors outline-none">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-6 flex flex-col gap-y-4">
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Assessment Test Number:</span><span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.num}</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Assessment Test Title:</span><span className="text-[#222] font-medium text-[13px]">{selectedAssessmentResult.title}</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2 mt-4"><span className="text-[#222] font-bold text-[13px]">Student's Assessment Test Score:</span><span className="text-[#222] font-extrabold text-[13px]">10</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Number of Items:</span><span className="text-[#222] font-extrabold text-[13px]">10</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Percentage of Score:</span><span className="text-[#222] font-extrabold text-[13px]">100%</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2 mt-4"><span className="text-[#222] font-bold text-[13px]">Date Accomplished:</span><span className="text-[#222] font-extrabold text-[13px]">Jan. 1, 2026</span></div>
                                <div className="flex justify-between border-b border-[#D1D8DD] pb-2"><span className="text-[#222] font-bold text-[13px]">Time Accomplished:</span><span className="text-[#222] font-extrabold text-[13px]">11:00 AM</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (showQuarterlyReport) {
        return (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-300">
                <div className="bg-[#1A4C8B] text-white rounded-t-2xl p-5 md:px-8 flex items-center gap-x-3 shadow-sm z-10">
                    <button aria-label='quarterly' onClick={() => setShowQuarterlyReport(false)} className="p-1 hover:bg-white/10 rounded transition-colors outline-none cursor-pointer">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <h2 className="text-[18px] md:text-[20px] font-bold tracking-wide">Quarterly Completion Report</h2>
                </div>
                <div className="p-6 md:p-10 bg-[#F8F5EF] rounded-b-2xl border-x border-b border-[#D1D8DD] shadow-sm flex-1 flex flex-col">
                    <h3 className="text-[20px] md:text-[24px] font-black text-[#222] mb-8 w-fit">Quarter 1</h3>
                    <div className="overflow-x-auto rounded-xl border border-[#1A4C8B] shadow-sm bg-white">
                        <table className="w-full text-center border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-[#1A4C8B] text-white text-[13px] font-medium tracking-wide">
                                    <th className="p-4 md:p-5 border-r border-[#153a6b]/50">Assessment Test No.</th>
                                    <th className="p-4 md:p-5 border-r border-[#153a6b]/50">Assessment Test Score</th>
                                    <th className="p-4 md:p-5 border-r border-[#153a6b]/50">Percentage of Score</th>
                                    <th className="p-4 md:p-5">No. of Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_REPORT_DATA.map((row, i) => (
                                    <tr key={i} className="even:bg-[#F4F6F8] hover:bg-[#E2E7E9]/50 transition-colors border-b border-[#D1D8DD] group">
                                        <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px] border-r border-[#D1D8DD] group-hover:border-[#C0C8CF] transition-colors">{row.no}</td>
                                        <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px] border-r border-[#D1D8DD] group-hover:border-[#C0C8CF] transition-colors">{row.score}</td>
                                        <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px] border-r border-[#D1D8DD] group-hover:border-[#C0C8CF] transition-colors">{row.percentage}</td>
                                        <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px]">{row.items}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-[#1A4C8B] text-white text-[14px] font-bold">
                                    <td className="p-4 md:p-5 border-r border-[#153a6b]/50 text-left pl-6 md:pl-10 tracking-wide">Total Score</td>
                                    <td className="p-4 md:p-5 border-r border-[#153a6b]/50">{TOTAL_SCORE}</td>
                                    <td className="p-4 md:p-5 border-r border-[#153a6b]/50 text-right pr-6 md:pr-10 tracking-wide">Total No. of Items</td>
                                    <td className="p-4 md:p-5">{TOTAL_ITEMS}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="mt-10 flex justify-end">
                        <button className="bg-[#1A4C8B] text-white px-8 md:px-10 py-3 rounded-lg font-bold text-[13px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 outline-none tracking-wide">
                            Generate a copy
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return null;
}