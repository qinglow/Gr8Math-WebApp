import React from 'react';
import Image from 'next/image';
import assessmentIcon from '@/app/(teacher)/class-page/photos/assessment.png';
import editIcon from '@/app/(teacher)/class-page/photos/edit.svg';
import trashIcon from '@/app/(teacher)/class-page/photos/trash.svg';

interface AssessmentCardProps {
  title: string;
  onEdit?: () => void; 
  onDelete?: () => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ title, onEdit, onDelete }) => {
  return (
    <div className="bg-[#E9E9E9] border border-[#D1D8DD] rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-[#1A4C8B] transition-colors group">
      <div className="flex items-center gap-x-5">
        <Image src={assessmentIcon} alt="Assessment" width={28} height={28} className="object-contain" />
        <span className="text-[18px] font-black text-[#222]">{title}</span>
      </div>
      
      {/* 3. Grouped Edit and Delete Buttons */}
      <div className="flex items-center gap-x-1">
        {onEdit && (
          <button
            aria-label="Edit assessment"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 hover:bg-[#D1D8DD]/50 rounded-full transition-colors cursor-pointer outline-none flex items-center justify-center"
          >
            <Image src={editIcon} alt="Edit" width={20} height={20} className="object-contain" />
          </button>
        )}

        {onDelete && (
          <button
            aria-label="Delete assessment"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-[#0A7F93] hover:bg-[#D1D8DD]/50 hover:text-[#ED1F24] rounded-full transition-colors cursor-pointer outline-none flex items-center justify-center"
          >
            <Image src={trashIcon} alt="Edit" width={20} height={20} className="object-contain" />
          </button>
        )}
      </div>
    </div>
  );
};