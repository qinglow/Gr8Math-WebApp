// components/Gr8Button.tsx
'use client';

import React from 'react';

interface Gr8ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'solid' | 'link';
  type?: 'button' | 'submit';
  isLocked?: boolean; // New prop!
}

export const Gr8Button: React.FC<Gr8ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'solid',
  type = 'button',
  isLocked = false,
}) => {
  if (variant === 'link') {
    return (
      <button
        type={type}
        onClick={onClick}
        className="bg-transparent border-none text-[#1A4C8B] text-[10px] font-semibold p-0 cursor-pointer hover:underline"
      >
        {text}
      </button>
    );
  }

  // Dynamic background based on lock state
  const btnBg = isLocked 
    ? 'bg-[#0A7F93] cursor-not-allowed opacity-90' // Dark Cyan
    : 'bg-[#1A4C8B] hover:bg-[#153a6b] cursor-pointer'; // Dark Blue

  return (
    <button
      type={type}
      onClick={isLocked ? undefined : onClick} // Disable click if locked
      className={`w-full py-3 px-4 text-white border-none rounded text-sm font-semibold transition-colors ${btnBg}`}
    >
      {text}
    </button>
  );
};