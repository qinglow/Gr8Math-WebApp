import React from 'react';
import Image from 'next/image';

// NOTE: I am using the absolute alias path so it can find the logo 
// no matter what folder this component is placed in!
import logoIcon from '@/app/(teacher)/class-page/photos/Logo.png'; 

export function Gr8MathHeader() {
    return (
        <header className="w-full bg-[#ED1F24] h-[60px] flex items-center px-6 relative shrink-0 shadow-md z-50 overflow-hidden">
            <div className="flex items-center gap-x-3 z-10">
                <Image src={logoIcon} alt="Gr8Math" width={36} height={36} className="object-contain" />
                <span className="text-white font-medium text-[16px] md:text-[18px] tracking-wide m-0">Gr8 Math Learning Management System</span>
            </div>
            
            <div className="absolute top-0 right-0 h-full w-[240px] z-0 opacity-95">
                <div className="absolute top-0 right-0 w-[120px] h-[20px] bg-[#1E4B95] shadow-[-3px_0_6px_rgba(0,0,0,0.15)]"></div>
                <div className="absolute top-0 right-[0px] w-[20px] h-[20px] bg-[#EFBD31]"></div>

                <div className="absolute top-[20px] right-0 w-[140px] h-[20px] bg-[#1E4B95] shadow-[-3px_0_6px_rgba(0,0,0,0.15)]"></div>
                <div className="absolute top-[20px] right-[60px] w-[20px] h-[20px] bg-[#EFBD31]"></div>

                <div className="absolute top-[40px] right-0 w-[160px] h-[20px] bg-[#1E4B95] shadow-[-3px_0_6px_rgba(0,0,0,0.15)]"></div>
                <div className="absolute top-[40px] right-[40px] w-[20px] h-[20px] bg-[#EFBD31]"></div>
                <div className="absolute top-[40px] right-[100px] w-[20px] h-[20px] bg-[#EFBD31]"></div>
            </div>
        </header>
    );
}