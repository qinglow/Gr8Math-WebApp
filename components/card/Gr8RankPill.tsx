'use client';

import React from 'react';

interface Gr8RankPillProps {
    rank: number;
    name: string;
    onClick: () => void;
    className?: string; // Allows us to pass custom widths
}

export const Gr8RankPill: React.FC<Gr8RankPillProps> = ({ rank, name, onClick, className = '' }) => {
    const rankSuffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
    
    return (
        <button 
            onClick={onClick} 
            className={`flex items-center justify-between bg-white border border-[#0A7F93] rounded-full px-3 py-2 md:py-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all outline-none mx-auto ${className}`}
        >
            <div className="flex items-center gap-x-3 md:gap-x-4 w-[85%]">
                {/* The teal rank badge */}
                <div className="bg-[#56C0B4] text-white font-black text-[11px] md:text-[12px] h-7 px-3 md:px-3.5 rounded-full flex items-center justify-center shrink-0">
                    {rank}{rankSuffix}
                </div>
                {/* The student name */}
                <span className="text-[#222] font-extrabold text-[13px] md:text-[15px] truncate">
                    {name}
                </span>
            </div>
            
            {/* The right chevron */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 shrink-0">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    );
};