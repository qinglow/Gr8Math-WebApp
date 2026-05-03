'use client';

import React, { useState, useEffect } from 'react';

export function NetworkToast() {
    const [isOffline, setIsOffline] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Initial check when component mounts
        if (typeof window !== 'undefined') {
            setIsOffline(!navigator.onLine);
        }

        const handleOnline = () => {
            setIsOffline(false);
            setDismissed(false); // Reset dismissal so it can show again next time
        };
        
        const handleOffline = () => {
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Don't render anything if online or if the user clicked 'X'
    if (!isOffline || dismissed) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Styled based on your mobile design: light warm bg, grey icon, dark blue text */}
            <div className="bg-[#F5F3EFE6] backdrop-blur-md border border-[#DCD3CC] shadow-lg rounded-xl p-4 flex items-center gap-4 max-w-[360px]">
                
                {/* Grey Offline Wi-Fi Icon */}
                <div className="shrink-0 text-[#666]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                        <line x1="12" y1="20" x2="12.01" y2="20"></line>
                    </svg>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                    <p className="text-[14px] font-extrabold text-[#222] m-0 leading-tight">No Internet Connection</p>
                    <p className="text-[12px] font-medium text-[#666] m-0 mt-0.5">Please check your network settings.</p>
                </div>

                {/* Dark Blue Refresh Button */}
                <button
                    onClick={() => window.location.reload()}
                    className="text-[13px] font-black text-[#1A4C8B] hover:underline cursor-pointer outline-none bg-transparent border-none shrink-0"
                >
                    Refresh
                </button>

                {/* Close Button */}
                <button
                    onClick={() => setDismissed(true)}
                    className="text-[#A0A0A0] hover:text-[#ED1F24] transition-colors cursor-pointer outline-none bg-transparent border-none p-1 shrink-0 ml-1"
                    aria-label="Close"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}