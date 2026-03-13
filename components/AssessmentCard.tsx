// components/AssessmentCard.tsx
import React from 'react';
import Image from 'next/image';
import assessmentIcon from '../app/class-page/photos/assessment.png';

interface AssessmentCardProps {
  title: string;
  onClick?: () => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ title, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-[#E9E9E9] border border-[#D1D8DD] rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-[#1A4C8B] cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-x-5">
        <Image src={assessmentIcon} alt="Assessment" width={28} height={28} className="object-contain" />
        <span className="text-[18px] font-black text-[#222]">{title}</span>
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform group-hover:stroke-[#1A4C8B]">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
};