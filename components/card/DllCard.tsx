'use client';

import React, { useEffect } from 'react';
import { formatDllDateRange } from '@/lib/utils/utils';

interface DllCardProps {
    startDate: string;
    endDate: string;
    onClick?: () => void;
}

export const DllCard: React.FC<DllCardProps> = ({ startDate, endDate, onClick }) => {
    
    return (
        <button 
            onClick={onClick}
            className="flex items-center justify-between p-5 md:px-6 md:py-5 bg-white hover:border-[#0A7F93] hover:shadow-md border border-[#D1D8DD] rounded-xl transition-all shadow-sm outline-none cursor-pointer group w-full text-left"
        >
            <span className="font-black text-[#222] text-[15px]">
                Daily Lesson Log ({formatDllDateRange(startDate, endDate)})
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform shrink-0 ml-4">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    );
};