'use client';

import React, { useState } from 'react';
import { DllCard } from '@/components/card/DllCard';
import { Gr8Toast } from '@/components/ui/Gr8Toast'; 

interface DllTabContentProps {
    dllRecords: any[];
    setViewingDll: (record: any) => void;
    setCurrentView: (view: 'feed' | 'editor' | 'viewer' | 'assessment-editor' | 'dll-editor' | 'dll-viewer') => void;
}

export function DllTabContent({ dllRecords, setViewingDll, setCurrentView }: DllTabContentProps) {
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleViewDll = (record: any) => {
        // Check for internet connection
        if (!navigator.onLine) {
            setToastMessage("No internet connection. Please check your network.");
            
            // Auto-hide the toast after 3 seconds
            setTimeout(() => {
                setToastMessage(null);
            }, 3000);
            return; // Stop them from opening the DLL
        }

        // Proceed if online
        setViewingDll(record);
        setCurrentView('dll-viewer');
    };

    return (
        <div className="animate-in fade-in duration-300 pb-12 w-full h-full flex flex-col relative">
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
                                onClick={() => handleViewDll(record)} 
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="fixed inset-x-0 bottom-12 flex justify-center pointer-events-none z-[1000] [&>div]:!static [&>div]:pointer-events-auto">
                <Gr8Toast 
                    isVisible={!!toastMessage} 
                    message={toastMessage} 
                />
            </div>
        </div>
    );
}