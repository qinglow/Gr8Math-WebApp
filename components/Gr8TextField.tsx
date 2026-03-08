// components/Gr8TextField.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import eyeOpen from '../app/auth/photos/eye-open.png';
import eyeClosed from '../app/auth/photos/eye-closed.png';
import errorIcon from '../app/auth/photos/error-icon.png';
import lockIcon from '../app/auth/photos/lock.png'; // 1. Import your lock icon!

interface Gr8TextFieldProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  isActive?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  hasError?: boolean;
  errorMessage?: string;
  isLocked?: boolean; // 2. New prop for the dark cyan state
  disabled?: boolean; // 3. New prop for standard greyed-out state
}

export const Gr8TextField: React.FC<Gr8TextFieldProps> = ({
  label,
  type,
  value,
  onChange,
  isActive = false,
  onFocus,
  onBlur,
  hasError = false,
  errorMessage,
  isLocked = false,
  disabled = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const currentType = type === 'password' && isPasswordVisible ? 'text' : type;

  // Color logic for borders and text
  let borderClass = 'border-[#E0E0E0]';
  let textClass = 'text-gray-800';
  let placeholderClass = 'placeholder-gray-400';

  if (hasError) {
    borderClass = 'border-[#ED1F24]';
  } else if (isActive) {
    borderClass = 'border-[#EBB637]'; // Yellow active state
  } else if (isLocked) {
    borderClass = 'border-[#0A7F93]'; // Dark Cyan locked state
    textClass = 'text-[#0A7F93]';
    placeholderClass = 'placeholder-[#0A7F93]';
  }

  // Padding logic to make room for icons
  let inputPaddingRight = 'pr-4';
  if (isLocked || hasError || type === 'password') {
    inputPaddingRight = 'pr-10'; 
  }

  return (
    <div className="relative mb-4 w-full">
      <input
        type={currentType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={isLocked || disabled} // Prevent typing if locked
        placeholder={label}
        className={`w-full pl-4 py-3 text-sm bg-[#F4F6F8] border rounded outline-none transition-colors ${borderClass} ${textClass} ${placeholderClass} ${inputPaddingRight} ${disabled ? 'opacity-50' : ''}`}
      />
      
      <div className="absolute right-3 top-3 flex items-center gap-x-2">
        
        {/* Render Lock Icon if locked */}
        {isLocked && (
          <Image
            src={lockIcon}
            alt="Locked"
            width={20}
            height={20}
            className="object-contain"
          />
        )}

        {/* Render Error Icon */}
        {hasError && !isLocked && (
          <Image
            src={errorIcon}
            alt="Error Warning"
            width={20}
            height={20}
            className="object-contain"
          />
        )}

        {/* Render Password Toggle */}
        {type === 'password' && !isLocked && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="bg-transparent border-none cursor-pointer flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity p-0"
          >
            <Image
              src={isPasswordVisible ? eyeOpen : eyeClosed}
              alt={isPasswordVisible ? 'Hide password' : 'Show password'}
              width={20}
              height={20}
              className="object-contain"
            />
          </button>
        )}
      </div>

      {hasError && errorMessage && (
        <p className="text-[#ED1F24] text-[10px] mt-1 mb-0">
          {errorMessage}
        </p>
      )}
    </div>
  );
};