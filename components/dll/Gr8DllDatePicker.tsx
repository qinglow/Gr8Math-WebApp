'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Uses your exact image paths!
import calendarIcon from '@/app/auth/photos/calendar.png';
import errorIcon from '@/app/auth/photos/error-icon.png';

interface Gr8DllDatePickerProps {
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  isActive?: boolean; 
  onFocus?: () => void; 
  onBlur?: () => void;
  hasError?: boolean; 
  errorMessage?: string;
}

export const Gr8DllDatePicker: React.FC<Gr8DllDatePickerProps> = ({
  label, value, onChange, isActive = false, onFocus, onBlur, hasError = false, errorMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'years'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  
  const yearRef = useRef<HTMLDivElement>(null);
  
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

  // Matches the exact style of your DLL form fields
  const borderClass = hasError ? 'border-[#ED1F24] bg-red-50/50' : (isActive ? 'border-[#EFBD31] ring-1 ring-[#EFBD31]' : 'border-[#D1D8DD] bg-[#F4F6F8] hover:border-[#1A4C8B]');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayIndex = firstDayOfMonth; 
  
  const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // FIX FOR DLL: Generate years ranging from 5 years ago to 10 years in the future!
  const years = Array.from({ length: 15 }, (_, i) => today.getFullYear() - 5 + i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSelectYear = (selectedYear: number) => {
    setCurrentDate(new Date(selectedYear, month, 1));
    setView('calendar');
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(year, month, day);
    setTempSelectedDate(selected);
  };

  const handleOk = () => {
    if (tempSelectedDate) {
      // Passes standard format to backend
      onChange(`${tempSelectedDate.getMonth() + 1}/${tempSelectedDate.getDate()}/${tempSelectedDate.getFullYear()}`);
      setIsOpen(false);
    }
  };

  // FORMATTER: Converts "3/16/2026" to "Mar. 16, 2026" for the UI display
  const formatDisplayDate = (dateString: string) => {
      if (!dateString) return label;
      const parsed = new Date(dateString);
      if (isNaN(parsed.getTime())) return label;
      return `${shortMonthNames[parsed.getMonth()]}. ${parsed.getDate()}, ${parsed.getFullYear()}`;
  };

  return (
    <div className="w-full flex flex-col mb-4">
      <div className="relative w-full">
        <div 
          onClick={() => { setIsOpen(true); setView('calendar'); if (onFocus) onFocus(); }}
          className={`w-full px-3 py-3 pr-10 text-[14px] font-semibold border rounded-lg outline-none transition-all cursor-pointer flex items-center ${borderClass} ${value ? 'text-[#222]' : 'text-[#A0A0A0]'}`}
        >
          {/* USES THE NEW FORMATTER HERE */}
          {value ? formatDisplayDate(value) : label}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-x-2">
          {!hasError && <Image src={calendarIcon} alt="Calendar" width={20} height={20} className="object-contain opacity-60" />}
          {hasError && <Image src={errorIcon} alt="Error" width={20} height={20} className="object-contain" />}
        </div>
      </div>

      {hasError && !value && <p className="text-[#ED1F24] text-[11px] font-bold mt-1 absolute -bottom-5 left-1 z-10">Please enter needed details</p>}

      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-[310px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="bg-[#1A4C8B] px-6 py-4 text-white">
              <div className="text-[12px] font-bold uppercase opacity-80 cursor-pointer hover:opacity-100 mb-1" onClick={() => setView('years')}>
                {year}
              </div>
              <div className="text-2xl font-semibold">
                {tempSelectedDate ? `${dayNames[tempSelectedDate.getDay()]}, ${shortMonthNames[tempSelectedDate.getMonth()]} ${tempSelectedDate.getDate()}` : 'Select Date'}
              </div>
            </div>

            <div className="p-4 min-h-[280px] flex flex-col">
              {view === 'calendar' ? (
                <>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-sm font-bold text-gray-800 cursor-pointer hover:text-[#1A4C8B]" onClick={() => setView('years')}>
                      {fullMonthNames[month]} {year} ▾
                    </span>
                    <div className="flex gap-x-4">
                      <button onClick={handlePrevMonth} type="button" className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-transparent border-none outline-none">‹</button>
                      {/* FIX FOR DLL: Removed disabled={isFuture} logic so future months can be clicked */}
                      <button onClick={handleNextMonth} type="button" className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer bg-transparent border-none outline-none">›</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <span key={i} className="text-[10px] font-bold text-gray-400">{day}</span>)}
                  </div>
                  <div className="grid grid-cols-7 text-center gap-y-1">
                    {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const isSelected = tempSelectedDate?.getDate() === day && tempSelectedDate?.getMonth() === month && tempSelectedDate?.getFullYear() === year;
                      
                      return (
                        <button 
                          key={day} 
                          type="button" 
                          onClick={() => handleSelectDay(day)} 
                          // FIX FOR DLL: Removed future block logic so teachers can select future days!
                          className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold transition-all border-none outline-none cursor-pointer
                            ${isSelected ? 'bg-[#ED1F24] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'}
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
                    <button key={y} onClick={() => handleSelectYear(y)} className={`py-2 text-sm rounded-md transition-colors outline-none cursor-pointer ${y === year ? 'bg-[#1A4C8B] text-white font-bold selected-year' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-x-6 px-6 py-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsOpen(false)} className="text-[#ED1F24] text-xs font-extrabold uppercase bg-transparent border-none cursor-pointer outline-none hover:opacity-70">Cancel</button>
              <button 
                type="button" 
                onClick={handleOk} 
                disabled={!tempSelectedDate}
                className="text-[#1A4C8B] text-xs font-extrabold uppercase bg-transparent border-none cursor-pointer outline-none hover:opacity-70 disabled:opacity-30"
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