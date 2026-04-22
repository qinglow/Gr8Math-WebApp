'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import logo from '../photos/logo.png';
import backArrowIcon from '../photos/back-arrow.png';

import { Gr8TextField } from '../../../components/ui/Gr8TextField';
import { Gr8Button } from '../../../components/ui/Gr8Button';
import { Gr8Toast } from '@/components/ui/Gr8Toast';
import { sendResetCode, verifyResetCode, verifyRecoveryMfa, updatePassword } from '../action';
import { counter } from '@/app/hooks/counter';
import { PasswordDetailsForm } from '@/components/form/PasswordForm';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');

  const [activeField, setActiveField] = useState<'email' | 'code' | 'mfaCode' | 'newPassword' | 'confirmPassword' | null>(null);
  const [step, setStep] = useState<'request' | 'verify' | 'verify-mfa' | 'new-password'>('request');

  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  
  const [failedCode, setFailedCode] = useState('');
  const { timeLeft, startCountdown } = counter(0);

  const isValidPassword = (pass: string) => {
    const pattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/;
    return pattern.test(pass);
  };

  const handleCancel = () => {
    setEmail('');
    setCode('');
    setMfaCode('');
    setNewPassword('');
    setConfirmPassword('');
    setEmailError(false);
    setCodeError(false);
    setPasswordError(false);
    setToastError(null);
    setLoading(false);
    setFailedCode('');
    setStep('request');
    startCountdown(0);
    router.push('/auth/login');
  };

  const handleGetCode = async () => {
    setEmailError(false);
    setToastError(null);

    if (!email) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('email', email);

    const result = await sendResetCode(formData);
    setLoading(false);

    if (result?.error) {
      setToastError(result.error);
      setTimeout(() => setToastError(null), 3000);
    } else {
      startCountdown(180);
      setStep('verify');
      setActiveField('code');
    }
  };

  const handleVerifyCode = async () => {
    setCodeError(false);
    setToastError(null);

    if (!code) {
      setCodeError(true);
      return;
    }

    if (timeLeft === 0) {
      setCodeError(true);
      setToastError("Expired code. Please request a new one.");
      setTimeout(() => setToastError(null), 3000);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);

    const result = await verifyResetCode(formData);
    setLoading(false);

    if (result?.error) {
      setCodeError(true);
      setFailedCode(code); 
      setToastError("Invalid code.");
      setTimeout(() => setToastError(null), 3000);
    } else {
      // Moves to MFA if they are a Teacher, otherwise skips straight to password
      if (result?.mfaRequired) {
        setFactorId(result.factorId!);
        setStep('verify-mfa');
        setActiveField('mfaCode');
      } else {
        setStep('new-password');
        setActiveField('newPassword');
      }
    }
  };

  const handleVerifyMfaCode = async () => {
    setToastError(null);

    if (!mfaCode || mfaCode.length < 6) {
      setToastError("Please enter your 6-digit Authenticator code.");
      setTimeout(() => setToastError(null), 3000);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('factorId', factorId);
    formData.append('code', mfaCode);

    const result = await verifyRecoveryMfa(formData);
    setLoading(false);

    if (result?.error) {
      setToastError(result.error);
      setTimeout(() => setToastError(null), 3000);
    } else {
      setStep('new-password');
      setActiveField('newPassword');
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(false);
    setToastError(null);

    if (!newPassword || !confirmPassword) {
      setPasswordError(true);
      setPasswordErrorMessage("Please enter your new password credentials.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setPasswordErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must have 1 Upper, 1 Lower, 1 Number, and 1 Special Char");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('password', newPassword);

    const result = await updatePassword(formData);
    setLoading(false);

    if (result?.error) {
      setPasswordError(true);
      setPasswordErrorMessage(result.error);
      setToastError(result.error);
      setTimeout(() => setToastError(null), 3000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="w-full lg:w-1/2 bg-[#ED1F24] flex flex-col justify-center items-center text-white py-16 px-6 lg:p-12 shrink-0">
        <div className="flex flex-col items-center gap-y-4 lg:gap-y-6 animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-700 ease-out">
          <div className="w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] relative">
            <Image src={logo} alt="Gr8Math Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-[40px] lg:text-[56px] font-extrabold m-0 tracking-wide text-center">Gr8 Math</h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex-1 bg-[#FDF8F2] flex justify-center items-center relative p-6 lg:p-16">
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out">
          <div className="flex items-center mb-8 gap-x-4">
            <button type="button" aria-label="Close Modal" onClick={handleCancel} className="hover:opacity-70 transition-opacity flex items-center justify-center bg-transparent border-none p-0 cursor-pointer">
              <Image src={backArrowIcon} alt="Back to Login" width={20} height={20} className="object-contain" />
            </button>
            <h2 className="text-[22px] font-bold text-[#222] m-0">Change Password</h2>
          </div>

          {step === 'request' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-[12px] font-semibold text-[#222] mb-4">A verification code will be sent to your email.</p>
              <div className="relative mb-2">
                <Gr8TextField label="sample@email.com" type="email" value={email} onChange={(val) => { setEmail(val); setEmailError(false); }} isActive={activeField === 'email'} onFocus={() => setActiveField('email')} onBlur={() => setActiveField(null)} hasError={emailError} errorMessage="Please enter a valid email address." />
                <button type="button" onClick={handleGetCode} disabled={loading} className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#222] bg-transparent border-none cursor-pointer hover:opacity-70 disabled:opacity-50">
                  {loading ? "Sending..." : "Get Code"}
                </button>
              </div>
              <Gr8TextField label="Code" type="text" value={code} onChange={setCode} isLocked={true} />
              <div className="mt-6">
                <Gr8Button type="button" text="Verify" isLocked={true} />
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-[12px] font-semibold text-[#222] mb-4">A verification code will be sent to your email.</p>
              <div className="relative mb-2">
                <Gr8TextField label="sample@email.com" type="email" value={email} onChange={() => { }} disabled={true} />
                <button type="button" onClick={handleGetCode} disabled={loading || timeLeft > 0} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold bg-transparent border-none ${timeLeft > 0 ? 'text-[#888] cursor-not-allowed' : 'text-[#222] cursor-pointer hover:opacity-70 disabled:opacity-50'}`}>
                  {timeLeft > 0 ? `${timeLeft} s` : (loading ? "Sending..." : "Get Code")}
                </button>
              </div>
              <Gr8TextField 
                label="Code" 
                type="text" 
                value={code} 
                onChange={(val) => { 
                  setCode(val); 
                  setCodeError(false); 
                  if (val !== failedCode) setFailedCode(''); 
                }} 
                isActive={activeField === 'code'} 
                onFocus={() => setActiveField('code')} 
                onBlur={() => setActiveField(null)} 
                hasError={codeError} 
                errorMessage="Please enter the verification code." 
              />
              <div className="mt-6">
                <Gr8Button 
                  type="button" 
                  text={loading ? "Verifying..." : "Verify"} 
                  onClick={handleVerifyCode} 
                  variant="solid" 
                  disabled={loading || !code || code === failedCode || timeLeft === 0} 
                />
              </div>
            </div>
          )}

          {step === 'verify-mfa' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="text-[12px] font-semibold text-[#222] mb-4">
                Your account is protected by Two-Factor Authentication. Please enter the 6-digit code from your Authenticator app.
              </p>
              <Gr8TextField 
                label="6-Digit Authenticator Code" 
                type="text" 
                value={mfaCode} 
                onChange={(val) => { setMfaCode(val.replace(/\D/g, '').slice(0, 6)); }} 
                isActive={activeField === 'mfaCode'} 
                onFocus={() => setActiveField('mfaCode')} 
                onBlur={() => setActiveField(null)} 
              />
              <div className="mt-6">
                <Gr8Button 
                  type="button" 
                  text={loading ? "Verifying..." : "Verify"} 
                  onClick={handleVerifyMfaCode} 
                  variant="solid" 
                  disabled={loading || mfaCode.length < 6} 
                />
              </div>
            </div>
          )}

          {step === 'new-password' && (
            <PasswordDetailsForm
              passwordValue={newPassword}
              confirmValue={confirmPassword}
              onPasswordChange={(val) => { setNewPassword(val); setPasswordError(false); }}
              onConfirmChange={(val) => { setConfirmPassword(val); setPasswordError(false); }}
              onSubmit={handleSavePassword}
              isLoading={loading}
              buttonText="Save Password"
              error={passwordError}
              errorMessage={passwordErrorMessage}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          )}
        </div>
        <Gr8Toast message={toastError} isVisible={!!toastError} />
      </div>
    </div>
  );
}