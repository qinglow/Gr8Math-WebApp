'use client';

import React from 'react';
import Image from 'next/image';
import errorIcon from '@/app/auth/photos/error-icon.png';

interface Gr8SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  isActive?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  hasError?: boolean;
  errorMessage?: string;
}

export const Gr8Select: React.FC<Gr8SelectProps> = ({
  label, value, onChange, options, isActive = false, onFocus, onBlur, hasError = false, errorMessage
}) => {
  let borderClass = 'border-[#E0E0E0]';
  if (hasError) borderClass = 'border-[#ED1F24]';
  else if (isActive) borderClass = 'border-[#EBB637]';

  return (
    <div className="w-full flex flex-col mb-4">
      <div className="relative w-full">
        <select
          aria-label="Close modal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full pl-4 py-3 text-[14px] bg-[#F4F6F8] border rounded outline-none transition-colors appearance-none cursor-pointer ${borderClass} ${value ? 'text-gray-800' : 'text-gray-400'} ${hasError ? 'pr-16' : 'pr-10'}`}
        >
          <option value="" disabled hidden>{label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-gray-800 font-normal">{opt}</option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-x-2">
          {hasError && <Image src={errorIcon} alt="Error" width={20} height={20} className="object-contain" />}

          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 relative">
            <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {hasError && errorMessage && (
        <p className="text-[#ED1F24] text-[10px] font-normal mt-1 mb-0">
          {errorMessage}
        </p>
      )}
    </div>
  );
};