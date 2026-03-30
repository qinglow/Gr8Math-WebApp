import React from 'react';
import Image from 'next/image';
import assessmentIcon from '@/app/(teacher)/class-page/photos/assessment.png';

interface ParticipantAssessmentCardProps {
    assessmentNumber: number;
    title: string;
    date?: string;
    score: number;
    totalItems: number;
    onClick: () => void;
}

export const ParticipantAssessmentCard: React.FC<ParticipantAssessmentCardProps> = ({
    assessmentNumber,
    title,
    date = 'N/A', 
    score,
    totalItems,
    onClick
}) => {
    return (
        <button 
            onClick={onClick}
            className="flex items-center justify-between w-full bg-white border border-[#D1D8DD] border-l-4 border-l-[#0A7F93] rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all outline-none group"
        >
            <div className="flex items-center gap-x-4 md:gap-x-5">
                <div className="bg-[#F4F6F8] p-3 rounded-full group-hover:bg-[#0A7F93]/10 transition-colors shrink-0">
                    <Image src={assessmentIcon} alt="Assessment" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
                </div>
                <div className="text-left">
                    <span className="block text-[15px] md:text-[16px] font-black text-[#222]">Assessment {assessmentNumber}</span>
                    <span className="block text-[12px] md:text-[13px] font-medium text-[#666] mt-0.5">{title} • {date}</span>
                </div>
            </div>
            <div className="flex items-center gap-x-4">
                <div className="text-right hidden sm:block">
                    <span className="block text-[16px] font-black text-[#1A4C8B]">{score}/{totalItems}</span>
                    <span className="block text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider">Score</span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform shrink-0">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </button>
    );
};