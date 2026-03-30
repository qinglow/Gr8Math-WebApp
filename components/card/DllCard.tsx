'use client';

import React from 'react';

interface DllCardProps {
    startDate: string;
    endDate: string;
    onClick?: () => void;
}

// --- HELPER FUNCTION: DLL Date Range Formatter ---
// We moved this here so the card formats itself automatically!
export const formatDllDateRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return '';
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    
    const d1 = new Date(startStr);
    const d2 = new Date(endStr);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';

    const m1 = months[d1.getMonth()];
    const m2 = months[d2.getMonth()];
    const y1 = d1.getFullYear();
    const y2 = d2.getFullYear();
    
    // Outputs "Mar. 16-20, 2026"
    if (m1 === m2 && y1 === y2) {
        return `${m1} ${d1.getDate()}-${d2.getDate()}, ${y1}`;
    } else if (y1 === y2) {
        return `${m1} ${d1.getDate()} - ${m2} ${d2.getDate()}, ${y1}`;
    } else {
        return `${m1} ${d1.getDate()}, ${y1} - ${m2} ${d2.getDate()}, ${y2}`;
    }
};

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