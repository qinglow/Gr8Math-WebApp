// components/Gr8TextField.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import eyeOpen from '../app/auth/photos/eye-open.png';
import eyeClosed from '../app/auth/photos/eye-closed.png';
import errorIcon from '../app/auth/photos/error-icon.png';
import lockIcon from '../app/auth/photos/lock.png'; 
import calendarIcon from '../app/auth/photos/calendar.png'; 

interface Gr8TextFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'date';
  value: string;
  onChange: (value: string) => void;
  isActive?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  hasError?: boolean;
  errorMessage?: string;
  isLocked?: boolean; 
  disabled?: boolean;
  isCalendar?: boolean;
  showTopLabel?: boolean;
}

export const Gr8TextField: React.FC<Gr8TextFieldProps> = ({
  label, type = 'text', value, onChange, isActive = false, onFocus, onBlur,
  hasError = false, errorMessage, isLocked = false, disabled = false, isCalendar = false, showTopLabel = false
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const currentType = type === 'password' && isPasswordVisible ? 'text' : type;

  // Default borders and text colors (Gray hover only applies here now)
  let borderClass = 'border-[#B0B8C1] hover:border-gray-400';
  let textClass = 'text-gray-800'; 

  // --- Dynamic Color Logic Updated to prevent hover overriding active states ---
  if (hasError) {
    // Stays red even on hover
    borderClass = 'border-[#ED1F24] hover:border-[#ED1F24] focus:ring-1 focus:ring-[#ED1F24]/20';
  } else if (isActive || isFocused) {
    // Stays yellow even on hover
    borderClass = 'border-[#EBB637] hover:border-[#EBB637] focus:ring-1 focus:ring-[#EBB637]/20'; 
  } else if (isLocked) {
    // Stays cyan
    borderClass = 'border-[#0A7F93] hover:border-[#0A7F93]';
    textClass = 'text-[#0A7F93]'; 
  }

  const showLock = isLocked;
  const showErrorIcon = hasError && !isLocked;
  const showPasswordToggle = type === 'password' && !isLocked;

  const rightSideIconCount = [showLock, showErrorIcon, showPasswordToggle].filter(Boolean).length;

  let inputPaddingRight = 'pr-4'; 
  if (rightSideIconCount === 2) {
    inputPaddingRight = 'pr-16'; 
  } else if (rightSideIconCount === 1) {
    inputPaddingRight = 'pr-10'; 
  } else if (isCalendar) {
    inputPaddingRight = 'pr-10'; 
  }

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <div className="w-full flex flex-col mb-4 group">
      {/* Top Label */}
      {showTopLabel && (
        <span className={`text-[12px] font-bold transition-colors mb-1.5 text-[#000000]`}>
          {label}
        </span>
      )}
      
      <div className="relative w-full">
        <input
          type={currentType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={isLocked || disabled} 
          placeholder={showTopLabel ? '' : label}
          // I removed the hardcoded hover:border-gray-400 from here so it doesn't break the yellow
          className={`w-full pl-4 py-2.5 text-[14px] bg-[#F4F6F8] border rounded outline-none transition-all duration-200 ${borderClass} ${textClass} placeholder-gray-400 ${inputPaddingRight} ${disabled ? 'opacity-50' : ''}`}
        />
        
        <div className={`absolute ${rightSideIconCount === 2 ? 'right-4' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center gap-x-2 pointer-events-auto`}>
          
          {showLock && (
            <Image src={lockIcon} alt="Locked" width={20} height={20} className="object-contain pointer-events-none" />
          )}
          
          {showErrorIcon && (
            <Image src={errorIcon} alt="Error" width={20} height={20} className="object-contain pointer-events-none" />
          )}

          {isCalendar && !showErrorIcon && !showLock && (
             <Image src={calendarIcon} alt="Calendar" width={20} height={20} className="object-contain opacity-60 pointer-events-none" />
          )}

          {showPasswordToggle && (
            <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="bg-transparent border-none cursor-pointer flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity p-0 relative">
              <Image src={eyeOpen} alt="Open" width={20} height={20} className={isPasswordVisible ? 'object-contain' : 'hidden'} />
              <Image src={eyeClosed} alt="Closed" width={20} height={20} className={!isPasswordVisible ? 'object-contain' : 'hidden'} />
            </button>
          )}

        </div>
      </div>

      {/* Error Message */}
      {hasError && errorMessage && (
        <p className="text-[#ED1F24] text-[11px] font-normal mt-1.5 mb-0 animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
};