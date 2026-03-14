// components/ClassCard.tsx
import React from 'react';

interface ClassCardProps {
  sectionName: string;
  timeRange: string;
  studentCount: number;
  onClick?: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ sectionName, timeRange, studentCount, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-[#E9E9E9] border border-[#B0B8C1] rounded-xl p-6 hover:border-[#1A4C8B] transition-all cursor-pointer group flex flex-col justify-end h-[180px]"
    >
        <h2 className="text-[42px] font-black text-[#222] leading-[0.9] mb-3 uppercase tracking-tighter break-words line-clamp-2">
            {sectionName}
        </h2>
        
        <div className="flex flex-col text-[11px] font-black text-[#444] uppercase">
            <p className="m-0 tracking-wide">{timeRange}</p>
            <p className="m-0 text-[#A0A0A0] font-bold">{studentCount} students</p>
        </div>
    </div>
  );
};