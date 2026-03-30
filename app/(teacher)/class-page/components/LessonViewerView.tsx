'use client';
import React from 'react';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';

export function LessonViewerView({ viewingLesson, onBack }: any) {
    return (
        <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative overflow-y-auto">
            <Gr8MathHeader />
            <div className="p-4 md:p-8 lg:p-12 pb-4 md:pb-6 flex flex-col w-full max-w-6xl mx-auto">
                <button aria-label='m' onClick={onBack} className="flex items-center gap-x-2 group cursor-pointer outline-none w-fit mb-6 md:mb-8">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div>
                    <span className="text-[12px] font-extrabold text-black uppercase">Week {viewingLesson.week_number}</span>
                    <h1 className="text-[24px] md:text-[32px] font-black text-[#222] mt-1">{viewingLesson.title || viewingLesson.lesson_title}</h1>
                </div>
            </div>
            <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-1 w-full bg-white border border-[#D1D8DD] rounded-xl p-6 md:p-12 shadow-sm min-h-[50vh]">
                    <div 
                        className="text-[14px] md:text-[16px] text-black font-medium leading-loose whitespace-pre-wrap 
                        [&_p]:mb-4 [&_h1]:text-4xl [&_h1]:font-black [&_ul]:list-disc [&_ul]:ml-8 [&_ol]:list-decimal [&_ol]:ml-8"
                        dangerouslySetInnerHTML={{ __html: viewingLesson.lesson_content || '' }} 
                    />
                </div>
            </div>
        </div>
    );
}