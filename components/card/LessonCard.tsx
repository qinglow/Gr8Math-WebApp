import React from 'react';
import Image from 'next/image';
import editIcon from '@/app/(teacher)/class-page/photos/edit.svg';
import trashIcon from '@/app/(teacher)/class-page/photos/trash.svg';

interface LessonCardProps {
  week: string;
  title: string;
  description: string;
  onEdit?: () => void;
  onSeeMore?: () => void;
  onDelete?: () => void;
}

const cleanPreviewText = (text: string) => {
  if (!text) return '';

  let cleaned = text
    // 1. Destroy <script> and <style> tags AND their contents, even if truncated
    // [\s\S]*? matches everything including newlines. (?:<\/script>|$) handles truncation.
    .replace(/<script\b[^>]*>[\s\S]*?(?:<\/script>|$)/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?(?:<\/style>|$)/gi, '')
    
    // 2. Nuclear failsafe: Wipe the rich-text editor boilerplate if it still leaks
    .replace(/var\s+editor\s*=\s*document.*/gi, '')

    // 3. Now it's safe to strip the remaining standard HTML tags
    .replace(/<[^>]*>/g, ' ')

    // 4. Remove image URLs and cleanup formatting
    .replace(/https?:\/\/[^\s"'<]*tigris[^\s"']*/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

export const LessonCard: React.FC<LessonCardProps> = ({ week, title, description, onEdit, onSeeMore, onDelete }) => {

  const previewText = cleanPreviewText(description);

  return (
    <div className="bg-[#E9E9E9] rounded-xl border border-[#D1D8DD] p-6 shadow-sm hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#000000] uppercase tracking-wider">{week}</span>
          <h2 className="text-[24px] font-black text-[#222] mt-1 leading-none">{title}</h2>
        </div>

        <div className="flex items-center gap-x-1">
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

          {onDelete && (
            <button
              aria-label="Delete lesson"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-[#0A7F93] hover:bg-[#D1D8DD]/50 hover:text-[#ED1F24] rounded-full transition-colors cursor-pointer outline-none flex items-center justify-center"
            >
               <Image
              src={trashIcon}
              alt="Edit"
              width={20}
              height={20}
              className="object-contain"
            />
            </button>
          )}
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