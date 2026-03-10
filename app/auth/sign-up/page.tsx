// app/auth/sign-up/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // NEW: Import router for redirection!

import logo from '../photos/logo.png';
import backArrowIcon from '../photos/back-arrow.png'; 
import teacherRoleIcon from '../photos/role-teacher.png'; 
import studentRoleIcon from '../photos/role-student.png'; 
import teacherRoleIconActive from '../photos/role-teacher-active.png'; 
import studentRoleIconActive from '../photos/role-student-active.png'; 

import { Gr8Button } from '../../../components/Gr8Button';
import { Gr8TextField } from '../../../components/Gr8TextField'; 
import { Gr8Select } from '../../../components/Gr8Select'; 
import { Gr8DatePicker } from '../../../components/Gr8DatePicker';

export default function SignUpPage() {
  const router = useRouter(); // Initialize router

  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [step, setStep] = useState<'role' | 'teacher-info' | 'student-info' | 'create-password'>('role');
  const [roleError, setRoleError] = useState(false);

  // --- FORM STATES ---
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teachingPos, setTeachingPos] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- ERROR STATES ---
  const [emailError, setEmailError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [teachingPosError, setTeachingPosError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const [birthdateError, setBirthdateError] = useState(false);
  
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // --- UI STATES ---
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 

  // NEW: Terms Modal States
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // --- HANDLERS ---
  const handleNextRole = () => {
    if (!selectedRole) {
      setRoleError(true);
      setTimeout(() => setRoleError(false), 3000);
      return;
    }
    setStep(selectedRole === 'teacher' ? 'teacher-info' : 'student-info');
  };

  const handleNextTeacherInfo = () => {
    setEmailError(false); setFirstNameError(false); setLastNameError(false);
    setTeachingPosError(false); setGenderError(false); setBirthdateError(false);
    
    let isValid = true;
    if (!email) { setEmailError(true); isValid = false; }
    if (!firstName) { setFirstNameError(true); isValid = false; }
    if (!lastName) { setLastNameError(true); isValid = false; }
    if (!teachingPos) { setTeachingPosError(true); isValid = false; }
    if (!gender) { setGenderError(true); isValid = false; }
    if (!birthdate) { setBirthdateError(true); isValid = false; }

    if (!isValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('create-password');
    }, 800);
  };

  const handleVerifyPassword = () => {
    setPasswordError(false);
    setConfirmPasswordError(false);
    
    if (!password) {
      setPasswordError(true); setPasswordErrorMessage("Please enter a password."); return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError(true); setPasswordErrorMessage("Please enter a password."); return;
    }
    if (password !== confirmPassword) {
      setPasswordError(true); setConfirmPasswordError(true); setPasswordErrorMessage("Passwords do not match."); return;
    }

    // Passwords match! Open the Terms modal instead of alerting.
    setShowTermsModal(true);
  };

  const handleProceedRegistration = () => {
    if (!termsAccepted) return; // Prevent proceeding if not checked

    // Close modal and show loading spinner
    setShowTermsModal(false);
    setIsLoading(true);

    // Simulate API registration call, then redirect to login with success flag
    setTimeout(() => {
      setIsLoading(false);
      // Pushes to login page with a query parameter we can catch to show the toast
      router.push('/auth/login?registered=success'); 
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 bg-[#ED1F24] flex flex-col justify-center items-center text-white py-16 px-6 lg:p-12 shrink-0">
        <div className="flex flex-col items-center gap-y-4 lg:gap-y-6 animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-700 ease-out">
            <div className="w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] relative">
                <Image src={logo} alt="Gr8Math Logo" fill className="object-contain" priority />
            </div>
            <h1 className="text-[40px] lg:text-[56px] font-extrabold m-0 tracking-wide text-center">Gr8 Math</h1>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex-1 bg-[#FDF8F2] flex justify-center items-center relative p-6 lg:p-16">
        
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out">
          
          {/* LOADING OVERLAY */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
               <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-x-3 border border-gray-100">
                  <div className="w-5 h-5 border-2 border-[#1A4C8B] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-[#222]">Loading...</span>
               </div>
            </div>
          )}

          {/* STEP 1: ROLE SELECTION */}
          {step === 'role' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center">
               <div className="flex items-center mb-8 gap-x-4 w-full">
                 <Link href="/auth/login" className="hover:opacity-70 transition-opacity flex items-center justify-center">
                    <Image src={backArrowIcon} alt="Back to Login" width={20} height={20} className="object-contain" />
                 </Link>
                 <h2 className="text-[22px] font-bold text-[#222] m-0">Register</h2>
               </div>
               
               <h3 className="text-[18px] font-extrabold text-[#222] mb-8 text-center">What best describes your role?</h3>
               
               <div className="flex justify-center gap-x-10 mb-8 w-full">
                 <div className="flex flex-col items-center gap-y-3">
                   <button type="button" onClick={() => { setSelectedRole('student'); setRoleError(false); }} className={`flex items-center justify-center w-[100px] h-[100px] rounded-full border-[4px] transition-all bg-white cursor-pointer ${selectedRole === 'student' ? 'border-[#EBB637] shadow-[0_0_15px_rgba(235,182,55,0.3)]' : 'border-[#1A4C8B] hover:opacity-80'}`}>
                     <div className="w-12 h-12 relative">
                       <Image src={selectedRole === 'student' ? studentRoleIconActive : studentRoleIcon} alt="Student" fill className="object-contain" />
                     </div>
                   </button>
                   <span className={`text-[15px] font-bold ${selectedRole === 'student' ? 'text-[#EBB637]' : 'text-[#1A4C8B]'}`}>Student</span>
                 </div>

                 <div className="flex flex-col items-center gap-y-3">
                   <button type="button" onClick={() => { setSelectedRole('teacher'); setRoleError(false); }} className={`flex items-center justify-center w-[100px] h-[100px] rounded-full border-[4px] transition-all bg-white cursor-pointer ${selectedRole === 'teacher' ? 'border-[#EBB637] shadow-[0_0_15px_rgba(235,182,55,0.3)]' : 'border-[#1A4C8B] hover:opacity-80'}`}>
                     <div className="w-12 h-12 relative">
                       <Image src={selectedRole === 'teacher' ? teacherRoleIconActive : teacherRoleIcon} alt="Teacher" fill className="object-contain" />
                     </div>
                   </button>
                   <span className={`text-[15px] font-bold ${selectedRole === 'teacher' ? 'text-[#EBB637]' : 'text-[#1A4C8B]'}`}>Teacher</span>
                 </div>
               </div>

               <div className="h-6 mb-8 w-full flex justify-center">
                 {selectedRole ? (
                   <p className="text-[16px] font-extrabold text-[#555] m-0 text-center">You are a {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}!</p>
                 ) : (
                   <p className="text-[16px] font-bold text-[#A0A0A0] m-0 text-center">You are...</p>
                 )}
               </div>

               <div className="w-full">
                 <Gr8Button text="Next" onClick={handleNextRole} variant="solid" />
               </div>
             </div>
          )}

          {/* STEP 2: TEACHER INFO FORM */}
          {step === 'teacher-info' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center mb-4 gap-x-4">
                  <button onClick={() => setStep('role')} className="hover:opacity-70 transition-opacity bg-transparent border-none p-0 cursor-pointer flex items-center justify-center">
                     <Image src={backArrowIcon} alt="Back to Role Select" width={20} height={20} className="object-contain" />
                  </button>
                  <h2 className="text-[22px] font-bold text-[#222] m-0">Register</h2>
                </div>
                
                <p className="text-[14px] font-bold text-[#222] mb-6 mt-2 text-center">
                  Please enter the needed details.
                </p>

                <div className="flex flex-col gap-y-1">
                  <Gr8TextField label="Email" type="email" value={email} onChange={(val) => { setEmail(val); setEmailError(false); }} isActive={activeField === 'email'} onFocus={() => setActiveField('email')} onBlur={() => setActiveField(null)} hasError={emailError} errorMessage="Please enter the needed details." />
                  <Gr8TextField label="Firstname" type="text" value={firstName} onChange={(val) => { setFirstName(val); setFirstNameError(false); }} isActive={activeField === 'first'} onFocus={() => setActiveField('first')} onBlur={() => setActiveField(null)} hasError={firstNameError} errorMessage="Please enter the needed details." />
                  <Gr8TextField label="Lastname" type="text" value={lastName} onChange={(val) => { setLastName(val); setLastNameError(false); }} isActive={activeField === 'last'} onFocus={() => setActiveField('last')} onBlur={() => setActiveField(null)} hasError={lastNameError} errorMessage="Please enter the needed details." />
                  <Gr8Select label="Teaching Position" value={teachingPos} onChange={(val) => { setTeachingPos(val); setTeachingPosError(false); }} options={['Teacher I', 'Teacher II', 'Teacher III', 'Teacher IV', 'Teacher V', 'Teacher VI', 'Teacher VII', 'Master Teacher I', 'Master Teacher II', 'Master Teacher III', 'Master Teacher IV', 'Master Teacher V']} isActive={activeField === 'pos'} onFocus={() => setActiveField('pos')} onBlur={() => setActiveField(null)} hasError={teachingPosError} errorMessage="Please enter the needed details." />

                  <div className="flex items-start mb-2">
                      <span className="w-[90px] text-[14px] font-extrabold text-[#222] mt-3">Gender</span>
                      <div className="flex-1">
                         <Gr8Select label="Gender" value={gender} onChange={(val) => { setGender(val); setGenderError(false); }} options={['Male', 'Female']} isActive={activeField === 'gender'} onFocus={() => setActiveField('gender')} onBlur={() => setActiveField(null)} hasError={genderError} errorMessage="Please enter the needed details." />
                      </div>
                  </div>

                  <div className="flex items-start">
                      <span className="w-[90px] text-[14px] font-extrabold text-[#222] mt-3">Birthdate</span>
                      <div className="flex-1">
                         <Gr8DatePicker label="MM/DD/YYYY" value={birthdate} onChange={(val) => { setBirthdate(val); setBirthdateError(false); }} isActive={activeField === 'bday'} onFocus={() => setActiveField('bday')} onBlur={() => setActiveField(null)} hasError={birthdateError} errorMessage="Please enter the needed details." />
                      </div>
                  </div>
                </div>

                <div className="w-full mt-6">
                  <Gr8Button text="Next" onClick={handleNextTeacherInfo} variant="solid" />
                </div>
             </div>
          )}

          {/* STEP 3: CREATE PASSWORD */}
          {step === 'create-password' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center mb-6 gap-x-4">
                  <button onClick={() => setStep('teacher-info')} className="hover:opacity-70 transition-opacity bg-transparent border-none p-0 cursor-pointer flex items-center justify-center">
                     <Image src={backArrowIcon} alt="Back to Teacher Info" width={20} height={20} className="object-contain" />
                  </button>
                  <h2 className="text-[22px] font-bold text-[#222] m-0">Change Password</h2>
                </div>

                <div className="text-[11px] font-semibold text-[#222] mb-6 leading-relaxed">
                  <p className="mb-1">Please create a new password. The password needs to follow the following requirements:</p>
                  <ul className="list-none p-0 m-0">
                    <li>- Minimum of 8 and maximum of 16 characters</li>
                    <li>- At least one uppercase letter</li>
                    <li>- At least one number and one special character</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Gr8TextField label="Password" type="password" value={password} onChange={(val) => { setPassword(val); setPasswordError(false); }} isActive={activeField === 'pass'} onFocus={() => setActiveField('pass')} onBlur={() => setActiveField(null)} hasError={passwordError} errorMessage={passwordErrorMessage} />
                  <Gr8TextField label="Re-enter Password" type="password" value={confirmPassword} onChange={(val) => { setConfirmPassword(val); setConfirmPasswordError(false); }} isActive={activeField === 'confirmPass'} onFocus={() => setActiveField('confirmPass')} onBlur={() => setActiveField(null)} hasError={confirmPasswordError} errorMessage={passwordErrorMessage} />
                </div>

                <div className="w-full mt-6">
                  <Gr8Button text="Verify" onClick={handleVerifyPassword} variant="solid" />
                </div>
             </div>
          )}

          {step === 'student-info' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <p>Student Form goes here...</p>
                 <button onClick={() => setStep('role')} className="text-[#1A4C8B] underline mt-4 text-sm font-bold bg-transparent border-none cursor-pointer">Go Back</button>
             </div>
          )}
        </div>

        {/* =========================================
            TERMS & CONDITIONS MODAL OVERLAY
            ========================================= */}
        {showTermsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] relative animate-in zoom-in-95 duration-300">
              
              {/* Close 'X' Button */}
              <button 
                onClick={() => setShowTermsModal(false)} 
                className="absolute top-4 right-4 text-gray-500 hover:text-black bg-transparent border-none cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>

              <div className="flex items-start gap-x-3 mt-4 mb-6">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 cursor-pointer accent-[#1A4C8B]"
                />
                <p className="text-[12px] font-extrabold text-[#222] leading-tight m-0">
                  By checking this box, you are agreeing to our Terms and Conditions and Privacy Policy.
                </p>
              </div>

              <div className="flex justify-center">
                 <button
                   onClick={handleProceedRegistration}
                   disabled={!termsAccepted}
                   className={`px-8 py-2 rounded text-white text-xs font-bold transition-colors border-none cursor-pointer ${termsAccepted ? 'bg-[#1A4C8B] hover:bg-[#153a6b]' : 'bg-[#0A7F93] hover:opacity-80'}`}
                 >
                   Proceed
                 </button>
              </div>
            </div>
          </div>
        )}

        {roleError && (
          <div className="absolute bottom-12 bg-[#0A7F93] text-white px-6 py-3 rounded text-xs font-semibold shadow-md animate-in slide-in-from-bottom-4 duration-300">
            Please pick a role
          </div>
        )}

      </div>
    </div>
  );
}