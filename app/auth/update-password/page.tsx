// app/auth/update-password/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import logo from '../photos/logo.png';
import backArrowIcon from '../photos/back-arrow.png'; 

import { Gr8TextField } from '../../../components/Gr8TextField';
import { Gr8Button } from '../../../components/Gr8Button';

export default function UpdatePasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [activeField, setActiveField] = useState<'email' | 'code' | 'newPassword' | 'confirmPassword' | null>(null);
  
  const [step, setStep] = useState<'request' | 'verify' | 'new-password'>('request');

  // --- NEW: ERROR STATES ---
  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // --- MODIFIED BUTTON HANDLERS ---
  const handleGetCode = () => {
    setEmailError(false);
    if (!email) {
      setEmailError(true); // Trigger red error state
      return; 
    }
    setStep('verify');
    setActiveField('code'); 
  };

  const handleVerifyCode = () => {
    setCodeError(false);
    if (!code) {
      setCodeError(true); // Trigger red error state
      return;
    }
    setStep('new-password');
    setActiveField('newPassword');
  };

  const handleSavePassword = () => {
    setPasswordError(false);
    
    // Check if empty
    if (!newPassword || !confirmPassword) {
      setPasswordError(true);
      setPasswordErrorMessage("Please enter your new password credentials.");
      return;
    }
    
    // Check if they match
    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setPasswordErrorMessage("Passwords do not match. Please try again.");
      return;
    }
    
    alert("Password successfully updated! (Placeholder)");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      
      {/* LEFT PANEL (RED) */}
      <div className="w-full lg:w-1/2 bg-[#ED1F24] flex flex-col justify-center items-center text-white py-16 px-6 lg:p-12 shrink-0">
        <div className="flex flex-col items-center gap-y-4 lg:gap-y-6 animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-700 ease-out">
            <div className="w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] relative">
                <Image src={logo} alt="Gr8Math Logo" fill className="object-contain" priority />
            </div>
            <h1 className="text-[40px] lg:text-[56px] font-extrabold m-0 tracking-wide text-center">
              Gr8 Math
            </h1>
        </div>
      </div>

      {/* RIGHT PANEL (BEIGE) */}
      <div className="w-full lg:w-1/2 flex-1 bg-[#FDF8F2] flex justify-center items-center relative p-6 lg:p-16">
        
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out">
          
          {/* HEADER */}
          <div className="flex items-center mb-8 gap-x-4">
            <Link href="/auth/login" className="hover:opacity-70 transition-opacity flex items-center justify-center">
               <Image src={backArrowIcon} alt="Back to Login" width={20} height={20} className="object-contain" />
            </Link>
            <h2 className="text-[22px] font-bold text-[#222] m-0">
              Change Password
            </h2>
          </div>

          {/* =========================================
              STEP 1: REQUEST CODE
              ========================================= */}
          {step === 'request' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-[12px] font-semibold text-[#222] mb-4">
                A verification code will be sent to your email.
              </p>
              
              <div className="relative mb-2">
                <Gr8TextField
                  label="sample@email.com"
                  type="email"
                  value={email}
                  onChange={(val) => { setEmail(val); setEmailError(false); }} // Clears error when typing
                  isActive={activeField === 'email'} 
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  hasError={emailError}
                  errorMessage="Please enter a valid email address."
                />
                <button 
                  onClick={handleGetCode}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#222] bg-transparent border-none cursor-pointer hover:opacity-70"
                >
                  Get Code
                </button>
              </div>

              <Gr8TextField
                label="Code"
                type="text"
                value={code}
                onChange={setCode}
                isLocked={true} 
              />

              <div className="mt-6">
                <Gr8Button text="Verify" isLocked={true} /> 
              </div>
            </div>
          )}

          {/* =========================================
              STEP 2: ENTER CODE
              ========================================= */}
          {step === 'verify' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-[12px] font-semibold text-[#222] mb-4">
                A verification code will be sent to your email.
              </p>
              
              <div className="relative mb-2">
                <Gr8TextField
                  label="sample@email.com"
                  type="email"
                  value={email}
                  onChange={() => {}}
                  disabled={true} 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#888]">
                  Get Code
                </span>
              </div>

              <Gr8TextField
                label="Code"
                type="text"
                value={code}
                onChange={(val) => { setCode(val); setCodeError(false); }}
                isActive={activeField === 'code'}
                onFocus={() => setActiveField('code')}
                onBlur={() => setActiveField(null)}
                hasError={codeError}
                errorMessage="Please enter the verification code."
              />

              <div className="mt-6">
                <Gr8Button text="Verify" onClick={handleVerifyCode} variant="solid" />
              </div>
            </div>
          )}

          {/* =========================================
              STEP 3: NEW PASSWORD
              ========================================= */}
          {step === 'new-password' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-[11px] font-semibold text-[#222] mb-6 leading-relaxed">
                <p className="mb-1">Please create a new password. The password needs to follow the following requirements:</p>
                <ul className="list-none p-0 m-0">
                  <li>- Minimum of 8 and maximum of 16 characters</li>
                  <li>- At least one uppercase letter</li>
                  <li>- At least one number and one special character</li>
                </ul>
              </div>
              
              <Gr8TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(val) => { setNewPassword(val); setPasswordError(false); }}
                isActive={activeField === 'newPassword'}
                onFocus={() => setActiveField('newPassword')}
                onBlur={() => setActiveField(null)}
                hasError={passwordError}
                errorMessage={passwordErrorMessage}
              />

              <Gr8TextField
                label="Re-enter Password"
                type="password"
                value={confirmPassword}
                onChange={(val) => { setConfirmPassword(val); setPasswordError(false); }}
                isActive={activeField === 'confirmPassword'}
                onFocus={() => setActiveField('confirmPassword')}
                onBlur={() => setActiveField(null)}
                hasError={passwordError}
                errorMessage={passwordErrorMessage}
              />

              <div className="mt-6">
                <Gr8Button text="Verify" onClick={handleSavePassword} variant="solid" />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}