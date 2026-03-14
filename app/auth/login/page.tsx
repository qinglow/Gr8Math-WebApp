'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import myLogo from '../photos/logo.png';
import { Gr8TextField } from '../../../components/ui/Gr8TextField';
import { Gr8Button } from '../../../components/ui/Gr8Button';
import { Gr8Toast } from '@/components/ui/Gr8Toast';
import { login } from '../action';



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
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);
  const [emptyError, setEmptyError] = useState(false);
  const [loading, setLoading] = useState(false);


  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
  const messageFromUrl = searchParams.get('msg');

  if (messageFromUrl) {
    setToastMsg(decodeURIComponent(messageFromUrl));
    window.history.replaceState({}, '', window.location.pathname);
    const timer = setTimeout(() => setToastMsg(null), 4000);
    return () => clearTimeout(timer);
  }
}, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmptyError(false);
    setToastMsg(null);

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
    }
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
          <h2 className="text-[22px] font-bold text-center mb-8 text-[#222]">Welcome Back to Gr8 Math!</h2>

          <form onSubmit={handleLogin}>
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
              <Link href="/auth/update-password/">
                <Gr8Button text="Forgot Password?" variant="link" />
              </Link>
            </div>

            <Gr8Button
              text="Login"
              type="submit"
              variant="solid"
              disabled={loading}
            />

            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-[#D9D9D9]" />
              <span className="mx-3 text-[10px] text-[#666] font-bold">OR</span>
              <div className="flex-1 h-px bg-[#D9D9D9]" />
            </div>

            <p className="text-[12px] font-semibold mb-3 text-[#444] text-center">Don't have an account?</p>
            <Link href="/auth/sign-up" className="w-full">
              <Gr8Button text="Register" type="button" variant="solid" />
            </Link>
          </form>
        </div>

        <Gr8Toast
          message={toastMsg}
          isVisible={!!toastMsg}
        />
      </div>
    </div>
  );
}