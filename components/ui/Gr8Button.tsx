// components/Gr8Button.tsx
'use client';

import React from 'react';

interface Gr8ButtonProps {
  // Change string to React.ReactNode to allow text OR components (like LoadingDots)
  text: React.ReactNode; 
  onClick?: () => void;
  variant?: 'solid' | 'link';
  type?: 'button' | 'submit';
  isLocked?: boolean; 
  disabled?: boolean;
}

export const Gr8Button: React.FC<Gr8ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'solid',
  type = 'button',
  isLocked = false,
  disabled = false, // Added default for the existing prop
}) => {
  // Use either the explicit disabled prop or the isLocked state
  const isBtnDisabled = disabled || isLocked;

  if (variant === 'link') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isBtnDisabled}
        className="bg-transparent border-none text-[#1A4C8B] text-[10px] font-semibold p-0 cursor-pointer hover:underline disabled:opacity-50 disabled:no-underline"
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
      // Disable click if locked or explicitly disabled
      onClick={isBtnDisabled ? undefined : onClick} 
      disabled={isBtnDisabled}
      className={`w-full py-3 px-4 text-white border-none rounded text-sm font-semibold transition-all ${btnBg} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {text}
    </button>
  );
};