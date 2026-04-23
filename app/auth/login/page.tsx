'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import myLogo from '../photos/logo.png';
import { Gr8TextField } from '../../../components/ui/Gr8TextField';
import { Gr8Button } from '../../../components/ui/Gr8Button';
import { Gr8Toast } from '@/components/ui/Gr8Toast';
import { login, verifyMfaAction, verifyBackupCodeAction, cancelLoginAction } from '../action';

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

  const [mfaStep, setMfaStep] = useState<'none' | 'setup' | 'verify' | 'show-backup'>('none');
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState('');

  // Backup code states
  const [isUsingBackup, setIsUsingBackup] = useState(false);
  const [backupInput, setBackupInput] = useState('');
  const [backupCodeStr, setBackupCodeStr] = useState<string>('');
  const [targetRedirectUrl, setTargetRedirectUrl] = useState('');

  const [activeField, setActiveField] = useState<'email' | 'password' | 'mfa' | 'backup' | null>(null);
  const [emptyError, setEmptyError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [processedMsg, setProcessedMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setMfaCode('');
    setMfaStep('none');
    setFactorId('');
    setQrCodeSvg('');
    setIsUsingBackup(false);
    setBackupInput('');
    setBackupCodeStr('');
    setEmptyError(false);
    setActiveField(null);
  };

  useEffect(() => {
    cancelLoginAction();
  }, []);

  useEffect(() => {
    const messageFromUrl = searchParams.get('msg');
    if (messageFromUrl && messageFromUrl !== processedMsg) {
      const decodedMsg = decodeURIComponent(messageFromUrl);
      setToastMsg(decodedMsg);
      setProcessedMsg(decodedMsg);
      router.replace('/auth/login', { scroll: false });
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, processedMsg]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmptyError(false);
    setToastMsg(null);

    // --- HANDLE BACKUP CODE SUBMISSION ---
    if (mfaStep === 'verify' && isUsingBackup) {
      if (!backupInput) {
        setEmptyError(true);
        return;
      }
      setLoading(true);
      const result = await verifyBackupCodeAction(backupInput);
      if (result?.error) {
        setToastMsg(result.error);
        setLoading(false);
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        setToastMsg("MFA Reset successfully. Please log in again to configure a new Authenticator.");
        resetForm();
        setLoading(false);
        setTimeout(() => setToastMsg(null), 4000);
      }
      return;
    }

    // --- HANDLE MFA AUTHENTICATOR SUBMISSION ---
    if (mfaStep === 'setup' || (mfaStep === 'verify' && !isUsingBackup)) {
      if (!mfaCode || mfaCode.length < 6) {
        setEmptyError(true);
        return;
      }
      setLoading(true);
      const isFirstSetup = mfaStep === 'setup';

      const result = await verifyMfaAction(factorId, mfaCode, isFirstSetup);

      if (result?.error) {
        setToastMsg(result.error);
        setLoading(false);
        setTimeout(() => setToastMsg(null), 3000);
      } else if (result?.backupCode) {
        // Setup success! Show the master backup code to the user
        setBackupCodeStr(result.backupCode);
        setTargetRedirectUrl(result.targetUrl);
        setMfaStep('show-backup');
        setLoading(false);
      }
      return;
    }

    // --- HANDLE NORMAL LOGIN SUBMISSION ---
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
      setToastMsg("Login Successful!");
      resetForm();
    }
  };

  const handleCancelMfa = async () => {
    resetForm();
    await cancelLoginAction();
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
                mfaStep === 'show-backup' ? "Save Recovery Code" :
                  "Welcome Back to Gr8 Math!"}
          </h2>

          {mfaStep === 'show-backup' ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
              <p className="text-[14px] leading-relaxed text-center text-[#444] mb-8 px-2">
                <strong className="text-[#222]">Important:</strong> Copy this Recovery Code and keep it in a safe place. If you lose access to your Authenticator app, you will need this to regain access to your account.
              </p>

              {/* THE CODE BOX */}
              <div className="bg-[#F2F6F9] rounded-2xl p-6 md:p-10 mb-10 flex flex-col items-center justify-center border border-[#E5E9F0] w-full">
                <span className="text-[#88909B] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
                  RECOVERY CODE
                </span>

                <div className="flex items-center justify-between w-full max-w-full gap-x-2">
                  <span className="text-[#111827] text-[18px] sm:text-[22px] md:text-[28px] lg:text-[32px] font-extrabold tracking-tight font-mono whitespace-nowrap flex-1 text-center">
                    {backupCodeStr}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodeStr);
                      setToastMsg("Recovery Code copied!");
                      setTimeout(() => setToastMsg(null), 3000);
                    }}
                    className="text-[#1E40AF] hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-2 shrink-0 flex items-center justify-center"
                    aria-label="Copy Code"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <Gr8Button
                text="Continue"
                type="button"
                variant="solid"
                onClick={() => router.push(targetRedirectUrl)}
              />
            </div>
          ) : (
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
                    1. Download <strong>Google Authenticator</strong> on your phone.<br />
                    2. Scan this QR Code to link your account.
                  </p>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-center items-center w-[200px] h-[200px]">
                    {qrCodeSvg.startsWith('<svg') ? (
                      <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                    ) : (
                      <img src={qrCodeSvg} alt="MFA QR Code" className="w-full h-full object-contain" />
                    )}
                  </div>
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

              {/* --- MFA VERIFY OR BACKUP UI --- */}
              {mfaStep === 'verify' && (
                <div className="mb-6 animate-in fade-in slide-in-from-right-4">
                  {!isUsingBackup ? (
                    <>
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
                      {/* --- CHANGED TO MATCH FORGOT PASSWORD STYLE --- */}
                      <div className="flex justify-end mb-8 mt-[-8px]">
                        <Gr8Button
                          text="Use Recovery Code"
                          variant="link"
                          onClick={() => setIsUsingBackup(true)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[14px] text-center text-[#666] font-medium mb-6">
                        Enter your Recovery Code to regain access to your account.
                      </p>
                      <Gr8TextField
                        label="XXXX-XXXX-XXXX"
                        type="text"
                        value={backupInput}
                        onChange={(val) => {
                          const raw = val.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 12);
                          const formatted = raw.match(/.{1,4}/g)?.join('-') || '';
                          setBackupInput(formatted);
                        }}
                        isActive={activeField === 'backup'}
                        onFocus={() => setActiveField('backup')}
                        onBlur={() => setActiveField(null)}
                        hasError={emptyError && !backupInput}
                        errorMessage="Please enter your Recovery Code."
                      />
                      {/* --- CHANGED TO MATCH FORGOT PASSWORD STYLE --- */}
                      <div className="flex justify-end mb-8 mt-[-8px]">
                        <Gr8Button
                          text="Back to Authenticator"
                          variant="link"
                          onClick={() => setIsUsingBackup(false)}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <Gr8Button
                text={mfaStep !== 'none' ? "Verify" : "Login"}
                type="submit"
                variant="solid"
                disabled={loading || (mfaStep === 'verify' && ((!isUsingBackup && mfaCode.length < 6) || (isUsingBackup && backupInput.length < 14)))}
              />

              {/* Back button for MFA */}
              {mfaStep !== 'none' && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCancelMfa}
                    className="text-[13px] font-bold text-[#666] hover:text-[#ED1F24] transition-colors outline-none cursor-pointer bg-transparent border-none"
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
          )}
        </div>

        <Gr8Toast message={toastMsg} isVisible={!!toastMsg} />
      </div>
    </div>
  );
}