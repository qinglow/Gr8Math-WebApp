import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string; 
}

export function Gr8LoadingOverlay({ isLoading, message = "Loading" }: LoadingOverlayProps) {
  if (!isLoading) return null;
  const baseMessage = message.replace(/\.+$/, '');

  return (
    <div className="fixed inset-0 z-[110] bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-xl">
      
      <div className="w-12 h-12 border-4 border-[#E0E0E0] border-t-[#1A4C8B] rounded-full animate-spin mb-4"></div>
      
      <span className="text-[#1A4C8B] font-bold text-sm tracking-wide flex items-center">
        {baseMessage}
        <span className="loading-dots-wrapper ml-[2px]">
          <span className="loading-dots"></span>
        </span>
      </span>
      
    </div>
  );
}