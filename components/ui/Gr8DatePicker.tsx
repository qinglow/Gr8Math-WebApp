'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import calendarIcon from '@/app/auth/photos/calendar.png';
import errorIcon from '@/app/auth/photos/error-icon.png';

interface Gr8DatePickerProps {
  label: string; value: string; onChange: (value: string) => void;
  isActive?: boolean; onFocus?: () => void; onBlur?: () => void;
  hasError?: boolean; errorMessage?: string;
}

export const Gr8DatePicker: React.FC<Gr8DatePickerProps> = ({
  label, value, onChange, isActive = false, onFocus, onBlur, hasError = false, errorMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'years'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  
  const yearRef = useRef<HTMLDivElement>(null);
  
  // Create a normalized "Today" (midnight) for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
        setTempSelectedDate(parsed);
      }
    }
  }, [value]);

  useEffect(() => {
    if (view === 'years' && yearRef.current) {
      const selectedYearBtn = yearRef.current.querySelector('.selected-year');
      selectedYearBtn?.scrollIntoView({ block: 'center' });
    }
  }, [view]);

  const borderClass = hasError ? 'border-[#ED1F24]' : (isActive ? 'border-[#EBB637]' : 'border-[#E0E0E0]');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayIndex = firstDayOfMonth; 
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate years only up to the current year
  const years = Array.from({ length: 101 }, (_, i) => today.getFullYear() - i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1);
    // Only allow navigating forward if the next month isn't entirely in the future
    if (nextMonth <= today) {
      setCurrentDate(nextMonth);
    }
  };

  const handleSelectYear = (selectedYear: number) => {
    setCurrentDate(new Date(selectedYear, month, 1));
    setView('calendar');
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(year, month, day);
    // BLOCK: Don't allow clicking if date >= today
    if (selected < today) {
      setTempSelectedDate(selected);
    }
  };

  const handleOk = () => {
    if (tempSelectedDate && tempSelectedDate < today) {
      onChange(`${tempSelectedDate.getMonth() + 1}/${tempSelectedDate.getDate()}/${tempSelectedDate.getFullYear()}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col mb-4">
      <div className="relative w-full">
        <div 
          onClick={() => { setIsOpen(true); setView('calendar'); if (onFocus) onFocus(); }}
          className={`w-full pl-4 py-3 pr-10 text-[14px] bg-[#F4F6F8] border rounded outline-none transition-colors cursor-pointer flex items-center ${borderClass} ${value ? 'text-gray-800' : 'text-gray-400'}`}
        >
          {value || label}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-x-2">
          {!hasError && <Image src={calendarIcon} alt="Calendar" width={20} height={20} className="object-contain opacity-60" />}
          {hasError && <Image src={errorIcon} alt="Error" width={20} height={20} className="object-contain" />}
        </div>
      </div>

      {hasError && errorMessage && <p className="text-[#ED1F24] text-[10px] mt-1">{errorMessage}</p>}

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-[310px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="bg-[#1A4C8B] px-6 py-4 text-white">
              <div className="text-[12px] font-bold uppercase opacity-80 cursor-pointer hover:opacity-100 mb-1" onClick={() => setView('years')}>
                {year}
              </div>
              <div className="text-2xl font-semibold">
                {tempSelectedDate ? `${dayNames[tempSelectedDate.getDay()]}, ${monthNames[tempSelectedDate.getMonth()].slice(0,3)} ${tempSelectedDate.getDate()}` : 'Select Date'}
              </div>
            </div>

            <div className="p-4 min-h-[280px] flex flex-col">
              {view === 'calendar' ? (
                <>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-sm font-bold text-gray-800 cursor-pointer hover:text-[#1A4C8B]" onClick={() => setView('years')}>
                      {monthNames[month]} {year} ▾
                    </span>
                    <div className="flex gap-x-4">
                      <button onClick={handlePrevMonth} type="button" className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-transparent border-none">‹</button>
                      <button 
                        onClick={handleNextMonth} 
                        disabled={new Date(year, month + 1, 1) > today}
                        type="button" 
                        className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-transparent border-none disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <span key={i} className="text-[10px] font-bold text-gray-400">{day}</span>)}
                  </div>
                  <div className="grid grid-cols-7 text-center gap-y-1">
                    {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const checkDate = new Date(year, month, day);
                      const isFuture = checkDate >= today;
                      const isSelected = tempSelectedDate?.getDate() === day && tempSelectedDate?.getMonth() === month && tempSelectedDate?.getFullYear() === year;
                      
                      return (
                        <button 
                          key={day} 
                          type="button" 
                          onClick={() => handleSelectDay(day)} 
                          disabled={isFuture}
                          className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold transition-all border-none
                            ${isSelected ? 'bg-[#ED1F24] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'}
                            ${isFuture ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer'}
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div ref={yearRef} className="h-[240px] overflow-y-auto grid grid-cols-3 gap-2 py-2">
                  {years.map((y) => (
                    <button key={y} onClick={() => handleSelectYear(y)} className={`py-2 text-sm rounded-md transition-colors ${y === year ? 'bg-[#1A4C8B] text-white font-bold selected-year' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-x-6 px-6 py-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsOpen(false)} className="text-[#ED1F24] text-xs font-extrabold uppercase bg-transparent border-none cursor-pointer">Cancel</button>
              <button 
                type="button" 
                onClick={handleOk} 
                disabled={!tempSelectedDate || tempSelectedDate >= today}
                className="text-[#ED1F24] text-xs font-extrabold uppercase bg-transparent border-none cursor-pointer disabled:opacity-30"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};