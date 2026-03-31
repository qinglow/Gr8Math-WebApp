'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import myLogo from '../photos/logo.png';
import { Gr8TextField } from '../../../components/ui/Gr8TextField';
import { Gr8Button } from '../../../components/ui/Gr8Button';
import { Gr8Toast } from '@/components/ui/Gr8Toast';
import { login, verifyMfaAction, cancelLoginAction } from '../action'; 

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDF8F2]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [mfaStep, setMfaStep] = useState<'none' | 'setup' | 'verify'>('none');
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState('');

  const [activeField, setActiveField] = useState<'email' | 'password' | 'mfa' | null>(null);
  const [emptyError, setEmptyError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [processedMsg, setProcessedMsg] = useState<string | null>(null);
  const [failedCode, setFailedCode] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setMfaCode('');
    setMfaStep('none');
    setFactorId('');
    setQrCodeSvg('');
    setEmptyError(false);
    setActiveField(null);
  };

  // --- NEW: THE CLEAN SLATE EFFECT ---
  // If the user reloads the page or hits the browser's back button,
  // this immediately fires and destroys any "half-logged-in" MFA sessions.
  useEffect(() => {
    cancelLoginAction();
  }, []);

  // Handle URL Toast Messages
  useEffect(() => {
    const messageFromUrl = searchParams.get('msg');
    
    if (messageFromUrl && messageFromUrl !== processedMsg) {
      const decodedMsg = decodeURIComponent(messageFromUrl);
      setToastMsg(decodedMsg);
      setProcessedMsg(decodedMsg); 

      router.replace('/auth/login', { scroll: false });

      const timer = setTimeout(() => {
        setToastMsg(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, processedMsg]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmptyError(false);
    setToastMsg(null);

    if (mfaStep !== 'none') {
      if (!mfaCode || mfaCode.length < 6) {
        setEmptyError(true);
        return;
      }
      setLoading(true);
      
      const result = await verifyMfaAction(factorId, mfaCode);
      
      if (result?.error) {
        setToastMsg(result.error);
        setLoading(false);
        setTimeout(() => setToastMsg(null), 3000);
      }
      return;
    }

    if (!email || !password) {
      setEmptyError(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const result = await login(formData);

    if (result?.error) {
      setToastMsg(result.error);
      setLoading(false);
      setTimeout(() => setToastMsg(null), 3000);
    } else if (result?.mfaRequired) {
      setFactorId(result.factorId!);
      if (result.mfaType === 'setup' && result.qrCode) {
        setQrCodeSvg(result.qrCode);
      }
      setMfaStep(result.mfaType as 'setup' | 'verify');
      setLoading(false);
    } else {
      resetForm();
    }
  };

  // --- Handle explicit UI Cancel button ---
  const handleCancelMfa = async () => {
    setMfaStep('none');
    setMfaCode('');
    setQrCodeSvg('');
    await cancelLoginAction(); // Securely signs out the partial session
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 bg-[#ED1F24] flex flex-col justify-center items-center text-white py-16 px-6 lg:p-12 shrink-0">
        <div className="flex flex-col items-center gap-y-4 lg:gap-y-6 animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-700 ease-out">
          <div className="w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] relative">
            <Image src={myLogo} alt="Gr8Math Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-[40px] lg:text-[56px] font-extrabold m-0 tracking-wide text-center">Gr8 Math</h1>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex-1 bg-[#FDF8F2] flex justify-center items-center relative p-6 lg:p-16">
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out">
          
          <h2 className="text-[22px] font-bold text-center mb-8 text-[#222]">
            {mfaStep === 'setup' ? "Secure Your Account" : 
             mfaStep === 'verify' ? "Two-Factor Authentication" : 
             "Welcome Back to Gr8 Math!"}
          </h2>

          <form onSubmit={handleLogin}>
            
            {/* --- NORMAL LOGIN UI --- */}
            {mfaStep === 'none' && (
              <>
                <Gr8TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  isActive={activeField === 'email'}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  hasError={emptyError && !email}
                  errorMessage="Please enter your account credentials."
                />

                <Gr8TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  isActive={activeField === 'password'}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  hasError={emptyError && !password}
                  errorMessage="Please enter your account credentials."
                />

                <div className="flex justify-end mb-8 mt-[-8px]">
                  <Link href="/auth/update-password/" onClick={resetForm}>
                    <Gr8Button text="Forgot Password?" variant="link" />
                  </Link>
                </div>
              </>
            )}

            {/* --- MFA SETUP UI (QR CODE) --- */}
            {mfaStep === 'setup' && (
              <div className="mb-6 animate-in fade-in slide-in-from-right-4 flex flex-col items-center">
                <p className="text-[14px] text-center text-[#666] font-medium mb-4">
                  1. Download <strong>Google Authenticator</strong> on your phone.<br/>
                  2. Scan this QR Code to link your account.
                </p>
               <div 
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-center items-center w-full max-w-[200px] aspect-square [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg.replace('data:image/svg+xml;utf-8,', '') }} 
                />
                <div className="w-full">
                  <Gr8TextField
                    label="3. Enter the 6-Digit Code"
                    type="text"
                    value={mfaCode}
                    onChange={(val) => setMfaCode(val.replace(/\D/g, '').slice(0, 6))}
                    isActive={activeField === 'mfa'}
                    onFocus={() => setActiveField('mfa')}
                    onBlur={() => setActiveField(null)}
                    hasError={emptyError && mfaCode.length < 6}
                    errorMessage="Please enter a valid 6-digit code."
                  />
                </div>
              </div>
            )}

            {/* --- MFA VERIFY UI (FUTURE LOGINS) --- */}
            {mfaStep === 'verify' && (
              <div className="mb-6 animate-in fade-in slide-in-from-right-4">
                <p className="text-[14px] text-center text-[#666] font-medium mb-6">
                  Open your Authenticator app and enter the 6-digit code to continue.
                </p>
                <Gr8TextField
                  label="6-Digit Authenticator Code"
                  type="text"
                  value={mfaCode}
                  onChange={(val) => setMfaCode(val.replace(/\D/g, '').slice(0, 6))}
                  isActive={activeField === 'mfa'}
                  onFocus={() => setActiveField('mfa')}
                  onBlur={() => setActiveField(null)}
                  hasError={emptyError && mfaCode.length < 6}
                  errorMessage="Please enter a valid 6-digit code."
                />
              </div>
            )}

            <Gr8Button
              text={mfaStep !== 'none' ? "Verify & Continue" : "Login"}
              type="submit"
              variant="solid"
              disabled={loading}
            />

            {/* Back button for MFA */}
            {mfaStep !== 'none' && (
              <div className="mt-4 flex justify-center">
                <button 
                  type="button" 
                  onClick={handleCancelMfa}
                  className="text-[13px] font-bold text-[#666] hover:text-[#ED1F24] transition-colors outline-none"
                >
                  Back to Login
                </button>
              </div>
            )}

            {mfaStep === 'none' && (
              <>
                <div className="flex items-center my-8">
                  <div className="flex-1 h-px bg-[#D9D9D9]" />
                  <span className="mx-3 text-[10px] text-[#666] font-bold">OR</span>
                  <div className="flex-1 h-px bg-[#D9D9D9]" />
                </div>

                <p className="text-[12px] font-semibold mb-3 text-[#444] text-center">Don't have an account?</p>
                <Link href="/auth/sign-up" className="w-full" onClick={resetForm}>
                  <Gr8Button text="Register" type="button" variant="solid" />
                </Link>
              </>
            )}
          </form>
        </div>

        <Gr8Toast message={toastMsg} isVisible={!!toastMsg} />
      </div>
    </div>
  );
}