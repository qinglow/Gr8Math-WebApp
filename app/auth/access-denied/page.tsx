import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gr8Button } from '@/components/ui/Gr8Button';
import appLogo from '@/app/auth/photos/logo.png'

import myLogo from '@/app/auth/photos/logo.png';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F2] flex flex-col justify-center items-center p-6">

      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100 text-center animate-in zoom-in-95 duration-700">

        {/* LOGO & WARNING ICON */}
        <div className="flex justify-center mb-6 relative">
          <div className="w-[120px] h-[120px] relative">
            <Image src={myLogo} alt="Gr8Math Logo" fill className="object-contain" priority />
          </div>
          {/* A little red badge to show it's a locked area */}
          <div className="absolute -bottom-2 -right-2 bg-[#ED1F24] text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        {/* HEADINGS */}
        <h1 className="text-[28px] font-extrabold text-[#222] mb-3 uppercase tracking-tight">
          Hold Up, Student!
        </h1>

        {/* EXPLANATION */}
        <p className="text-[15px] font-medium text-[#666] mb-8 leading-relaxed">
          This web portal is strictly for <span className="font-bold text-[#1A4C8B]">Teachers</span> to manage their classes. To access Gr8Math, please open the mobile app on your Android device!
        </p>

        {/* ACTIONS */}
        <div className="flex flex-col gap-y-4">
          <div className="bg-[#F4F6F8] rounded-xl p-4 border border-[#D1D8DD] flex items-center justify-center gap-x-3 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <span className="text-[14px] font-bold text-[#222]">Open Gr8Math on your phone</span>
          </div>


          {/* 2. Existing "OR" DIVIDER (unchanged) */}
          <div className="flex items-center my-2">
            <div className="flex-1 h-px bg-[#D9D9D9]" />
            <span className="mx-3 text-[10px] text-[#666] font-bold">OR</span>
            <div className="flex-1 h-px bg-[#D9D9D9]" />
          </div>

          {/* 3. NEW UNIFIED DOWNLOAD BOX (Clickable Button) */}
          <Link
            href="https://gr8-math.vercel.app"
            target="_blank"
            className="w-full"
          >
            {/* This is the visual "box" described: blue background, bold border */}
            <div className="bg-[#F0F7FF] rounded-2xl p-6 border-2 border-[#BCDDFE] hover:border-[#1A4C8B] hover:shadow-lg transition-all cursor-pointer shadow-sm flex items-center gap-x-5 text-left active:scale-[0.98]">

              {/* THE ICON STACK (Left Side) */}
              <div className="flex items-center gap-x-2 shrink-0 relative">

                {/* Your Actual App Logo (Small circular graphic) */}
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1.5 shadow-md relative overflow-hidden">
                  <Image src={appLogo} alt="Gr8Math App Logo" fill className="object-contain p-1" />
                </div>
              </div>

              {/* THE TEXT STACK (Right Side) */}
              <div className="flex flex-col flex-1 gap-y-1">
                <span className="text-[16px] font-bold text-[#1A4C8B] leading-tight">
                  Download the Gr8Math App
                </span>
              </div>

              {/* A subtle arrow on the far right indicating action */}
              <div className="text-[#1A4C8B] opacity-40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/auth/login" className="w-full">
            <Gr8Button text="Back to Login" type="button" variant="solid" />
          </Link>
        </div>

      </div>
    </div>
  );
}