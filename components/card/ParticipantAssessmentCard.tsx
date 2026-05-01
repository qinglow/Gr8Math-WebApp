import React from 'react';
import Image from 'next/image';
import assessmentIcon from '@/app/(teacher)/class-page/photos/assessment.png';

interface ParticipantAssessmentCardProps {
    assessmentNumber: number;
    title: string;
    date?: string;
    score: number;
    totalPossiblePoints: number;
    onClick: () => void;
}

export const ParticipantAssessmentCard: React.FC<ParticipantAssessmentCardProps> = ({
    assessmentNumber,
    title,
    date = 'N/A',
    score,
    totalPossiblePoints,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between w-full bg-white border border-[#D1D8DD] border-l-4 border-l-[#0A7F93] rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all outline-none group"
        >
            {/* Left Section: Icon and Text Info */}
            <div className="flex items-center gap-x-4 md:gap-x-5 min-w-0 flex-1">
                <div className="bg-[#F4F6F8] p-3 rounded-full group-hover:bg-[#0A7F93]/10 transition-colors shrink-0">
                    <Image src={assessmentIcon} alt="Assessment" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
                </div>
                
                {/* Text Container: min-w-0 is required for children to truncate */}
                <div className="text-left min-w-0 flex-1">
                    <span className="block text-[15px] md:text-[16px] font-black text-[#222]">
                        Assessment {assessmentNumber}
                    </span>
                    
                    {/* One-line wrapper for Title and Date */}
                    <div className="flex items-center text-[12px] md:text-[13px] font-medium text-[#666] mt-0.5">
                        <span className="truncate">{title}</span>
                        <span className="shrink-0 whitespace-nowrap"> • {date}</span>
                    </div>
                </div>
            </div>

            {/* Right Section: Score and Arrow */}
            <div className="flex items-center gap-x-4 shrink-0 ml-4">
                <div className="text-right hidden sm:block">
                    <span className="block text-[16px] font-black text-[#1A4C8B]">
                        {score}/{totalPossiblePoints}
                    </span>
                    <span className="block text-[10px] font-bold text-[#76828E] tracking-[0.15em] uppercase mt-0.5">
                        SCORE
                    </span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform shrink-0">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </button>
    );
};