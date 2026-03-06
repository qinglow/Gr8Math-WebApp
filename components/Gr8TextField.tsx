// components/Gr8TextField.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import eyeOpen from '../app/auth/photos/eye-open.png';
import eyeClosed from '../app/auth/photos/eye-closed.png';
import errorIcon from '../app/auth/photos/error-icon.png';

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
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const currentType = type === 'password' && isPasswordVisible ? 'text' : type;

  let borderClass = 'border-[#E0E0E0]';
  if (hasError) borderClass = 'border-[#ED1F24]';
  else if (isActive) borderClass = 'border-[#EBB637]';

  let inputPaddingRight = 'pr-4';
  if (type === 'password' && hasError) {
    inputPaddingRight = 'pr-14'; 
  } else if (type === 'password') {
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
        placeholder={label}
        className={`w-full pl-4 py-3 text-sm bg-[#F4F6F8] border rounded outline-none text-gray-800 transition-colors ${borderClass} ${inputPaddingRight}`}
      />
      
      <div className="absolute right-3 top-3 flex items-center gap-x-2">
        {hasError && (
          <Image
            src={errorIcon}
            alt="Error Warning"
            width={20}
            height={20}
            className="object-contain"
          />
        )}

        {type === 'password' && (
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