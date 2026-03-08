// app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import myLogo from '../photos/logo.png';
import { Gr8TextField } from '../../../components/Gr8TextField';
import { Gr8Button } from '../../../components/Gr8Button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { login } from '../action';
import { error } from 'console';
import { Gr8Toast } from '@/components/Gr8Toast';

export default function LoginPage() {

  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);
  const [emptyError, setEmptyError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmptyError(false);
    setToastError(null);

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
      setToastError(result.error);
      setLoading(false);
      setTimeout(() => setToastError(null), 3000)
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden">

      {/* 1. LEFT PANEL (RED) - The background is now completely STATIC */}
      <div className="w-full lg:w-1/2 bg-[#ED1F24] flex flex-col justify-center items-center text-white py-16 px-6 lg:p-12 shrink-0">

        {/* MODIFIED: The animation is now ONLY applied to this wrapper holding the logo and text */}
        <div className="flex flex-col items-center gap-y-4 lg:gap-y-6 animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-700 ease-out">
          <div className="w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] relative">
            <Image
              src={myLogo}
              alt="Gr8Math Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-[40px] lg:text-[56px] font-extrabold m-0 tracking-wide text-center">
            Gr8 Math
          </h1>
        </div>

      </div>

      {/* 2. RIGHT PANEL (BEIGE) */}
      <div className="w-full lg:w-1/2 flex-1 bg-[#FDF8F2] flex justify-center items-center relative p-6 lg:p-16">

        {/* THE CARD WRAPPER - Keeps its smooth entrance animation */}
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out">
          <h2 className="text-[22px] font-bold text-center mb-8 text-[#222]">
            Welcome Back to Gr8 Math!
          </h2>

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
              <Gr8Button text="Forgot Password?" variant="link" />
            </div>

            <Gr8Button text="Login" type="submit" variant="solid" />

            {/* OR Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-[#D9D9D9]" />
              <span className="mx-3 text-[10px] text-[#666] font-bold">OR</span>
              <div className="flex-1 h-px bg-[#D9D9D9]" />
            </div>

            <p className="text-[12px] font-semibold mb-3 text-[#444] text-center">
              Don't have an account?
            </p>
            <Gr8Button text="Register" type="button" variant="solid" />
          </form>
        </div>

        {/* */}
        <Gr8Toast
          message={toastError}
          isVisible={!!toastError}
        />

      </div>
    </div>
  );
}