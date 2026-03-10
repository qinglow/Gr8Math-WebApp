// components/Gr8DatePicker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import calendarIcon from '../app/auth/photos/calendar.png';
import errorIcon from '../app/auth/photos/error-icon.png';

interface Gr8DatePickerProps {
  label: string; value: string; onChange: (value: string) => void;
  isActive?: boolean; onFocus?: () => void; onBlur?: () => void;
  hasError?: boolean; errorMessage?: string;
}

export const Gr8DatePicker: React.FC<Gr8DatePickerProps> = ({
  label, value, onChange, isActive = false, onFocus, onBlur, hasError = false, errorMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
        setTempSelectedDate(parsed);
      }
    }
  }, [value]);

  const borderClass = hasError ? 'border-[#ED1F24]' : (isActive ? 'border-[#EBB637]' : 'border-[#E0E0E0]');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSelectDay = (day: number) => setTempSelectedDate(new Date(year, month, day));

  const handleOk = () => {
    if (tempSelectedDate) {
      onChange(`${tempSelectedDate.getMonth() + 1}/${tempSelectedDate.getDate()}/${tempSelectedDate.getFullYear()}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full flex flex-col mb-4">
      <div className="relative w-full">
        <div 
          onClick={() => { setIsOpen(true); if (onFocus) onFocus(); }}
          className={`w-full pl-4 py-3 pr-10 text-[14px] bg-[#F4F6F8] border rounded outline-none transition-colors cursor-pointer flex items-center ${borderClass} ${value ? 'text-gray-800' : 'text-gray-400'}`}
        >
          {value || label}
        </div>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-x-2">
          {!hasError && <Image src={calendarIcon} alt="Calendar" width={20} height={20} className="object-contain opacity-60" />}
          {hasError && <Image src={errorIcon} alt="Error" width={20} height={20} className="object-contain" />}
        </div>
      </div>

      {hasError && errorMessage && (
        <p className="text-[#ED1F24] text-[10px] font-normal mt-1 mb-0">
          {errorMessage}
        </p>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-2xl w-[310px] overflow-hidden flex flex-col">
            <div className="bg-[#1A4C8B] px-6 py-4 text-white flex flex-col justify-between h-[100px]">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">Select Date</span>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-semibold">
                  {tempSelectedDate ? `${dayNames[tempSelectedDate.getDay()]}, ${monthNames[tempSelectedDate.getMonth()].slice(0,3)} ${tempSelectedDate.getDate()}` : 'Select Date'}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 mb-1"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-sm font-bold text-gray-800 cursor-pointer">{monthNames[month]} {year} ▾</span>
                <div className="flex gap-x-4">
                  <button onClick={handlePrevMonth} type="button" className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-transparent border-none">‹</button>
                  <button onClick={handleNextMonth} type="button" className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-transparent border-none">›</button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <span key={i} className="text-xs font-bold text-gray-400">{day}</span>)}
              </div>
              <div className="grid grid-cols-7 text-center gap-y-1">
                {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = tempSelectedDate?.getDate() === day && tempSelectedDate?.getMonth() === month && tempSelectedDate?.getFullYear() === year;
                  return (
                    <button key={day} type="button" onClick={() => handleSelectDay(day)} className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-semibold cursor-pointer border-none transition-all ${isSelected ? 'bg-[#5C2CE8] text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}>{day}</button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-x-6 px-6 py-4">
              <button type="button" onClick={() => setIsOpen(false)} className="text-[#ED1F24] text-xs font-extrabold uppercase bg-transparent border-none cursor-pointer hover:opacity-70">Cancel</button>
              <button type="button" onClick={handleOk} className="text-[#ED1F24] text-xs font-extrabold uppercase bg-transparent border-none cursor-pointer hover:opacity-70">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};