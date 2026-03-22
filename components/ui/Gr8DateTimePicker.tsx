'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DrumProps {
  items: string[];
  selected: string;
  onSelect: (val: string) => void;
}

const DrumColumn = ({ items, selected, onSelect }: DrumProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const center = containerRect.top + containerRect.height / 2;
      let closestElement: HTMLElement | null = null;
      let minDistance = Infinity;

      const children = container.querySelectorAll('.drum-item');
      children.forEach((child) => {
        const rect = child.getBoundingClientRect();
        const childCenter = rect.top + rect.height / 2;
        const distance = Math.abs(center - childCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestElement = child as HTMLElement;
        }
      });

      if (closestElement) {
        const value = (closestElement as HTMLElement).dataset.value;
        if (value && value !== selected) onSelect(value);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selected, onSelect]);

  return (
    <div ref={containerRef} className="flex flex-col items-center overflow-y-scroll h-full w-14 snap-y snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style jsx>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <div className="h-[70px] shrink-0" />
      {items.map((item) => (
        <div key={item} data-value={item} className={`drum-item h-10 flex items-center justify-center shrink-0 snap-center text-xl font-bold transition-all duration-200 ${item === selected ? 'text-gray-900 scale-125' : 'text-gray-300 scale-90'}`}>
          {item}
        </div>
      ))}
      <div className="h-[70px] shrink-0" />
    </div>
  );
};

export const Gr8DateTimePicker = ({ label, value, onChange, hasError }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'date' | 'time'>('date');
  
  // Date States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'years'>('calendar');
  const yearRef = useRef<HTMLDivElement>(null);
  
  // Time States
  const [hour, setHour] = useState('11');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
  const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay();
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i); // 10 years into the future

  useEffect(() => {
    if (view === 'years' && yearRef.current) {
      const selectedYearBtn = yearRef.current.querySelector('.selected-year');
      selectedYearBtn?.scrollIntoView({ block: 'center' });
    }
  }, [view]);

  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const handleDateOk = () => {
    if (tempSelectedDate) setStep('time');
  };

  const handleTimeOk = () => {
    if (!tempSelectedDate) return;
    
    // Formatting to exactly: "March 17, 2026 11:00am"
    const formattedDate = `${fullMonthNames[tempSelectedDate.getMonth()]} ${tempSelectedDate.getDate()}, ${tempSelectedDate.getFullYear()}`;
    const formattedTime = `${hour}:${minute}${period.toLowerCase()}`;
    
    onChange(`${formattedDate} ${formattedTime}`);
    setIsOpen(false);
    setTimeout(() => setStep('date'), 300); // Reset for next open
  };

  return (
    <div className="flex-1 flex flex-col">
      <div 
        onClick={() => setIsOpen(true)}
        // FIX: Added dynamic color classes based on whether 'value' exists
        className={`w-full bg-white border rounded-lg p-3 text-[14px] font-semibold cursor-pointer transition-colors flex items-center justify-between
          ${hasError && !value ? 'border-red-500' : 'border-[#D1D8DD] hover:border-[#0A7F93]'}
          ${value ? 'text-[#222]' : 'text-[#A0A0A0]'} 
        `}
      >
        {value || label}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-[310px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* STEP 1: DATE PICKER */}
            {step === 'date' && (
              <>
                <div className="bg-[#1A4C8B] px-6 py-4 text-white">
                  <div className="text-[12px] font-bold uppercase opacity-80 cursor-pointer hover:opacity-100 mb-1" onClick={() => setView('years')}>{year}</div>
                  <div className="text-2xl font-semibold">
                    {tempSelectedDate ? `${dayNames[tempSelectedDate.getDay()]}, ${monthNames[tempSelectedDate.getMonth()]} ${tempSelectedDate.getDate()}` : 'Select Date'}
                  </div>
                </div>

                <div className="p-4 min-h-[280px] flex flex-col">
                  {view === 'calendar' ? (
                    <>
                      <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-sm font-bold text-[#222] cursor-pointer hover:text-[#1A4C8B]" onClick={() => setView('years')}>{fullMonthNames[month]} {year} ▾</span>
                        <div className="flex gap-x-4">
                          <button onClick={handlePrevMonth} className="text-gray-500 hover:text-black font-bold text-lg outline-none">‹</button>
                          <button onClick={handleNextMonth} className="text-gray-500 hover:text-black font-bold text-lg outline-none">›</button>
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
                            <button key={day} onClick={() => setTempSelectedDate(new Date(year, month, day))} className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold transition-all border-none cursor-pointer outline-none ${isSelected ? 'bg-[#ED1F24] text-white' : 'bg-transparent text-[#222] hover:bg-gray-100'}`}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div ref={yearRef} className="h-[240px] overflow-y-auto grid grid-cols-3 gap-2 py-2">
                      {years.map((y) => (
                        <button key={y} onClick={() => {setCurrentDate(new Date(y, month, 1)); setView('calendar');}} className={`py-2 text-sm rounded-md transition-colors outline-none ${y === year ? 'bg-[#1A4C8B] text-white font-bold selected-year' : 'hover:bg-gray-100 text-[#222]'}`}>
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-x-6 px-6 py-4 border-t border-gray-100">
                  <button onClick={() => setIsOpen(false)} className="text-[#ED1F24] text-xs font-extrabold uppercase outline-none">Cancel</button>
                  <button onClick={handleDateOk} disabled={!tempSelectedDate} className="text-[#1A4C8B] text-xs font-extrabold uppercase outline-none disabled:opacity-30">Next</button>
                </div>
              </>
            )}

            {/* STEP 2: TIME PICKER */}
            {step === 'time' && (
              <>
                <div className="bg-[#1A4C8B] p-5 text-white text-center">
                  <p className="text-[10px] font-bold uppercase opacity-70 mb-1 tracking-widest">Select Time</p>
                  <h3 className="text-3xl font-bold">{hour}:{minute} {period}</h3>
                </div>
                
                <div className="relative p-6 flex justify-around items-center bg-[#F9FAFB] h-[220px] overflow-hidden">
                  <div className="absolute top-1/2 left-0 w-full h-10 -translate-y-1/2 border-y border-gray-200 bg-gray-100/40 pointer-events-none" />
                  <DrumColumn items={hours} selected={hour} onSelect={setHour} />
                  <span className="text-2xl font-bold text-gray-400 mb-1">:</span>
                  <DrumColumn items={minutes} selected={minute} onSelect={setMinute} />
                  <div className="flex flex-col gap-y-2 z-10">
                    {(['AM', 'PM'] as const).map((p) => (
                      <button key={p} onClick={() => setPeriod(p)} className={`text-[11px] font-black px-3 py-1.5 rounded transition-all outline-none ${period === p ? 'bg-[#1A4C8B] text-white shadow-md' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-x-6 p-4 bg-white border-t border-gray-100">
                  <button onClick={() => setStep('date')} className="text-[#ED1F24] text-xs font-black uppercase outline-none mr-auto">Back</button>
                  <button onClick={() => setIsOpen(false)} className="text-[#ED1F24] text-xs font-black uppercase outline-none">Cancel</button>
                  <button onClick={handleTimeOk} className="text-[#1A4C8B] text-xs font-black uppercase outline-none">OK</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};