// components/Gr8TimePicker.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

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
        if (value && value !== selected) {
          onSelect(value);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selected, onSelect]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center overflow-y-scroll h-full w-14 snap-y snap-mandatory no-scrollbar"
      style={{
        scrollbarWidth: 'none',      /* Firefox */
        msOverflowStyle: 'none',    /* IE and Edge */
      }}
    >
      {/* This CSS block ensures Webkit (Chrome/Safari) scrollbars disappear */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="h-[70px] shrink-0" /> {/* Top Spacer */}
      {items.map((item) => (
        <div 
          key={item} 
          data-value={item}
          className={`drum-item h-10 flex items-center justify-center shrink-0 snap-center text-xl font-bold transition-all duration-200 ${
            item === selected ? 'text-gray-900 scale-125' : 'text-gray-300 scale-90'
          }`}
        >
          {item}
        </div>
      ))}
      <div className="h-[70px] shrink-0" /> {/* Bottom Spacer */}
    </div>
  );
};

export const Gr8TimePicker = ({ label, value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('11');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleSave = () => {
    onChange(`${hour}:${minute} ${period}`);
    setIsOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#F4F6F8] border border-[#D1D8DD] rounded py-3 px-2 text-center text-[14px] font-bold text-[#222] cursor-pointer hover:border-[#1A4C8B] transition-colors"
      >
        {value || label}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-[300px] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#1A4C8B] p-5 text-white text-center">
              <p className="text-[10px] font-bold uppercase opacity-70 mb-1 tracking-widest">Select Time</p>
              <h3 className="text-3xl font-bold">{hour}:{minute} {period}</h3>
            </div>
            
            {/* Content Area */}
            <div className="relative p-6 flex justify-around items-center bg-[#F9FAFB] h-[180px] overflow-hidden">
              {/* Highlight Bar Background */}
              <div className="absolute top-1/2 left-0 w-full h-10 -translate-y-1/2 border-y border-gray-200 bg-gray-100/40 pointer-events-none" />

              <DrumColumn items={hours} selected={hour} onSelect={setHour} />
              <span className="text-2xl font-bold text-gray-400 mb-1">:</span>
              <DrumColumn items={minutes} selected={minute} onSelect={setMinute} />

              {/* AM/PM Toggle */}
              <div className="flex flex-col gap-y-2 z-10">
                {(['AM', 'PM'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`text-[11px] font-black px-3 py-1.5 rounded transition-all ${
                      period === p ? 'bg-[#1A4C8B] text-white shadow-md' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-x-6 p-4 bg-white border-t border-gray-100">
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-[#ED1F24] text-xs font-black uppercase hover:opacity-70 transition-opacity"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="text-[#1A4C8B] text-xs font-black uppercase hover:opacity-70 transition-opacity"
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