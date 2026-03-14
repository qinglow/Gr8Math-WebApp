'use client';

import React from 'react';

interface Gr8ToastProps {
  message: string | null;
  isVisible: boolean;
  type?: 'error' | 'success'; 
}

export const Gr8Toast = ({ message, isVisible }: Gr8ToastProps) => {
  if (!isVisible || !message) return null;

  return (
    <div className="absolute bottom-12 bg-[#0A7F93] text-white px-6 py-3 rounded text-xs font-semibold shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
      {message}
    </div>
  );
};