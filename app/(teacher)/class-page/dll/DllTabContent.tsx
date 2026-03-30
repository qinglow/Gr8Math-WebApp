'use client';

import React from 'react';
import { DllCard } from '@/components/card/DllCard';

interface DllTabContentProps {
    dllRecords: any[];
    setViewingDll: (record: any) => void;
    setCurrentView: (view: 'feed' | 'editor' | 'viewer' | 'assessment-editor' | 'dll-editor' | 'dll-viewer') => void;
}

export function DllTabContent({ dllRecords, setViewingDll, setCurrentView }: DllTabContentProps) {
    return (
        <div className="animate-in fade-in duration-300 pb-12 w-full h-full flex flex-col">
            {dllRecords.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#F4EFED] rounded-[20px] border border-[#D1D8DD]">
                    <div className="text-[#888] font-bold text-center">
                        No new DLL records.
                    </div>
                </div>
            ) : (
                <>
                    <h2 className="text-[18px] font-black text-[#222] mb-6 uppercase tracking-wider px-2">
                        Daily Lesson Logs
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {dllRecords.map((record) => (
                            <DllCard 
                                key={record.id} 
                                startDate={record.from} 
                                endDate={record.to} 
                                onClick={() => { 
                                    setViewingDll(record); 
                                    setCurrentView('dll-viewer'); 
                                }} 
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}