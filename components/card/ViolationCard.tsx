// components/card/ViolationCard.tsx
import React from 'react';

export interface ViolationData {
    id: string | number;
    studentName: string;
    description: string;
    issue: string;
    offendingWord?: string;
}

interface ViolationCardProps {
    violation: ViolationData;
    onDetailsClick: (violation: ViolationData) => void;
}

export function ViolationCard({ violation, onDetailsClick }: ViolationCardProps) {
    return (
        <div className="bg-[#F4EBE6] border border-[#DCD3CC] rounded-xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <h3 className="text-[15px] font-bold text-[#222] mb-3">{violation.studentName}</h3>
            <p className="text-[13px] text-[#444] font-medium leading-relaxed mb-6 text-justify">
                {violation.description}
            </p>
            
            <div className="bg-[#E91D26BF] rounded-full px-5 py-3 flex justify-between items-center text-white shadow-sm">
                <span className="font-bold text-[13px] truncate pr-4">{violation.issue}</span>
                <button 
                    onClick={() => onDetailsClick(violation)}
                    className="font-black text-[13px] underline hover:opacity-80 transition-opacity outline-none shrink-0 cursor-pointer"
                >
                    Details
                </button>
            </div>
        </div>
    );
}