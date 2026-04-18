import React from 'react';
import Image from 'next/image';
import editIcon from '@/app/(teacher)/class-page/photos/edit.png';

interface LessonCardProps {
  week: string;
  title: string;
  description: string;
  onEdit?: () => void;
  onSeeMore?: () => void;
}

const cleanPreviewText = (text: string) => {
  if (!text) return '';

  let cleaned = text
    // 1. Remove &nbsp; and replace it with a standard space
    .replace(/&nbsp;/g, ' ')
    // 2. Remove any raw URLs that contain the word "tigris"
    .replace(/https?:\/\/[^\s"'<]*tigris[^\s"']*/gi, '')
    // 3. Strip out all HTML tags (like <img src="...">) just in case
    .replace(/<[^>]*>/g, ' ')
    // 4. Collapse multiple empty spaces, tabs, or newlines into a single space
    .replace(/\s+/g, ' ')
    // 5. Trim leading and trailing whitespace so the first real word snaps to the front
    .trim();

  return cleaned;
};

export const LessonCard: React.FC<LessonCardProps> = ({ week, title, description, onEdit, onSeeMore }) => {
  
  const previewText = cleanPreviewText(description);

  return (
    <div className="bg-[#E9E9E9] rounded-xl border border-[#D1D8DD] p-6 shadow-sm hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#000000] uppercase tracking-wider">{week}</span>
          <h2 className="text-[24px] font-black text-[#222] mt-1 leading-none">{title}</h2>
        </div>

        <div className="flex flex-col items-end gap-y-2">
          <button
            aria-label="Edit lesson"
            onClick={onEdit}
            className="p-2 hover:bg-[#D1D8DD]/50 rounded-full transition-colors cursor-pointer outline-none flex items-center justify-center"
          >
            <Image
              src={editIcon}
              alt="Edit"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      <p className="text-[13px] text-[#444] font-medium leading-relaxed mb-4 pr-12 line-clamp-2">
        {previewText}
      </p>

      <div className="flex justify-end mt-4">
        <button onClick={onSeeMore} className="text-[11px] font-extrabold text-[#A0A0A0] hover:text-[#1A4C8B] uppercase tracking-wider transition-colors">
          See More
        </button>
      </div>
    </div>
  );
};