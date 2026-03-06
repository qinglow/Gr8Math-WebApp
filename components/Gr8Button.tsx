// components/Gr8Button.tsx
'use client';

import React from 'react';

interface Gr8ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'solid' | 'link';
  type?: 'button' | 'submit';
}

export const Gr8Button: React.FC<Gr8ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'solid',
  type = 'button' 
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

  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full py-3 px-4 bg-[#1A4C8B] hover:bg-[#153a6b] text-white border-none rounded text-sm font-semibold cursor-pointer transition-colors"
    >
      {text}
    </button>
  );
};