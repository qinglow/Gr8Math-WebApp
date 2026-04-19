'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import logo from '@/app/auth/photos/logo.png';
import backArrowIcon from '@/app/auth/photos/back-arrow.png';
import teacherRoleIcon from '@/app/auth/photos/role-teacher.png';
import studentRoleIcon from '@/app/auth/photos/role-student.png';
import teacherRoleIconActive from '@/app/auth/photos/role-teacher-active.png';
import studentRoleIconActive from '@/app/auth/photos/role-student-active.png';

import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';
import { Gr8Button } from '@/components/ui/Gr8Button';
import { RegistrationDetailsForm } from '@/components/form/RegistrationForm';
import { ROLES, ROLE_CONFIGS, type Role } from '@/app/constant/registration';
import { register, checkAvailability } from '../action';
import { Gr8Toast } from '@/components/ui/Gr8Toast';
import { PasswordDetailsForm } from '@/components/form/PasswordForm';

export default function SignUpPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [step, setStep] = useState<'role' | 'info' | 'create-password'>('role');
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    birthdate: '',
    extra: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNextRole = () => {
    if (!selectedRole) {
      showToast("Please pick a role")
      setTimeout(() => setErrors({}), 3000);
      return;
    }
    setStep('info');
  };

  const validateInfo = async () => {
    const newErrors: Record<string, string> = {};
    const fields = ['email', 'firstName', 'lastName', 'extra', 'gender', 'birthdate'];

    fields.forEach(f => {
      if (!formData[f as keyof typeof formData]) {
        newErrors[f] = "Please enter the needed details.";
      }
    });

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const emailCheck = await checkAvailability('email', formData.email);
      if (emailCheck.exists) {
        setErrors(prev => ({ ...prev, email: "Email already exists" }));
        setIsLoading(false);
        return;
      }

      if (selectedRole === ROLES.STUDENT) {
        const lrnValue = formData.extra.trim();

        if (!/^\d{12}$/.test(lrnValue)) {
          setErrors(prev => ({ ...prev, extra: "LRN requires exactly 12 digits" }));
          setIsLoading(false);
          return;
        }

        const lrnCheck = await checkAvailability('lrn', lrnValue);
        if (lrnCheck.exists) {
          setErrors(prev => ({ ...prev, extra: "LRN already exists" }));
          setIsLoading(false);
          return;
        }
      }

      setStep('create-password');
    } catch (e) {
      showToast("Validation failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPassword = () => {
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,16}$/;

    if (!formData.password || !formData.confirmPassword) {
      setErrors({ password: "Required", confirmPassword: "Required" });
      setPasswordErrorMessage("Please enter needed details");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ password: "No match", confirmPassword: "No match" });
      setPasswordErrorMessage("Passwords do not match.");
      return;
    }

    if (!pattern.test(formData.password)) {
      setErrors({ password: "Invalid" });
      setPasswordErrorMessage("Password Invalid");
      return;
    }

    setShowTermsModal(true);
  };

  const handleProceedRegistration = async () => {
    if (!termsAccepted) return;
    setShowTermsModal(false);
    setIsLoading(true);

    const regData = new FormData();
    regData.append('email', formData.email);
    regData.append('password', formData.password);
    regData.append('firstName', formData.firstName);
    regData.append('lastName', formData.lastName);
    regData.append('gender', formData.gender);
    regData.append('birthdate', formData.birthdate);
    regData.append('role', selectedRole!);
    regData.append('extra', formData.extra);

    const result = await register(regData);

    if (result?.success) {
      setIsLoading(false);
      const msg = encodeURIComponent("Registered successfully");
      resetRegistration();
      router.replace(`/auth/login?msg=${msg}`);
    } else {
      setIsLoading(false);
      showToast(result?.error || "Registration failed. Please try again.");
    }
  };

  const resetRegistration = () => {
    setStep('role');
    setSelectedRole(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      gender: '',
      birthdate: '',
      extra: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 bg-[#ED1F24] flex flex-col justify-center items-center text-white py-16 px-6 lg:p-12 shrink-0">
        <div className="flex flex-col items-center gap-y-4 lg:gap-y-6">
          <div className="w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] relative">
            <Image src={logo} alt="Gr8Math Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-[40px] lg:text-[56px] font-extrabold m-0 tracking-wide text-center">Gr8 Math</h1>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex-1 bg-[#FDF8F2] flex justify-center items-center relative p-6 lg:p-16">
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100 relative overflow-visible animate-in slide-in-from-bottom-8 duration-1000">

          {/* LOADING OVERLAY */}
          <Gr8LoadingOverlay isLoading={isLoading} message="Loading..." />


          {step === 'role' && (
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-8 gap-x-4 w-full text-left">
                <Link
                  href="/auth/login"
                  aria-label="Go back to Login Page"
                  onClick={resetRegistration}>
                  <Image src={backArrowIcon} alt="Back" width={20} height={20} />
                </Link>
                <h2 className="text-[22px] font-bold text-[#222] m-0">Register</h2>
              </div>
              <h3 className="text-[18px] font-extrabold text-[#222] mb-8 text-center">What best describes your role?</h3>
              <div className="flex justify-center gap-x-10 mb-8 w-full">
                {[ROLES.STUDENT, ROLES.TEACHER].map((role) => (
                  <div key={role} className="flex flex-col items-center gap-y-3">
                    <button
                      aria-label='role'
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`w-[100px] h-[100px] rounded-full border-[4px] bg-white transition-all ${selectedRole === role ? 'border-[#EBB637]' : 'border-[#1A4C8B]'}`}
                    >
                      <div className="w-12 h-12 relative mx-auto">
                        <Image
                          src={role === ROLES.STUDENT
                            ? (selectedRole === ROLES.STUDENT ? studentRoleIconActive : studentRoleIcon)
                            : (selectedRole === ROLES.TEACHER ? teacherRoleIconActive : teacherRoleIcon)
                          }
                          alt={role}
                          fill
                        />
                      </div>
                    </button>
                    <span className={`text-[15px] font-bold ${selectedRole === role ? 'text-[#EBB637]' : 'text-[#1A4C8B]'}`}>
                      {role}
                    </span>
                  </div>
                ))}
              </div>
              <Gr8Button text="Next" onClick={handleNextRole} variant="solid" />
            </div>
          )}

          {step === 'info' && selectedRole && (
            <RegistrationDetailsForm
              roleTitle={ROLE_CONFIGS[selectedRole].title}
              extraFieldType={ROLE_CONFIGS[selectedRole].extraType}
              extraFieldLabel={ROLE_CONFIGS[selectedRole].extraLabel}
              extraFieldOptions={[...ROLE_CONFIGS[selectedRole].options]}
              onBack={() => setStep('role')}
              onNext={validateInfo}
              formData={formData}
              setField={updateField}
              errors={Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, !!v]))}
              errorMessages={errors}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          )}

          {/* CREATE PASSWORD */}
          {step === 'create-password' && (
            <div className="flex flex-col animate-in slide-in-from-right-4 duration-500">
              {/* Manual Back Button and Title for the Sign Up Flow */}
              <div className="flex items-center mb-8 gap-x-4 w-full text-left">
                <button
                  aria-label='back'
                  type="button"
                  onClick={() => {
                    setStep('info');
                    setErrors({});
                  }}
                  className="cursor-pointer hover:opacity-70 transition-opacity outline-none"
                >
                  <Image src={backArrowIcon} alt="Back" width={20} height={20} />
                </button>
                <h2 className="text-[22px] font-bold text-[#222] m-0">Create Password</h2>
              </div>

              {/* The actual reusable form - without the onBack prop */}
              <PasswordDetailsForm
                passwordValue={formData.password}
                confirmValue={formData.confirmPassword}
                onPasswordChange={(v) => updateField('password', v)}
                onConfirmChange={(v) => updateField('confirmPassword', v)}
                onSubmit={handleVerifyPassword}
                isLoading={isLoading}
                buttonText="Save Password"
                error={!!errors.password}
                errorMessage={passwordErrorMessage}
                activeField={activeField}
                setActiveField={setActiveField}
              />
            </div>
          )}

        </div>

        <Gr8Toast
          message={toastMessage}
          isVisible={!!toastMessage}
        />

      </div>

      {/* TERMS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] relative">
            <button onClick={() => setShowTermsModal(false)} className="absolute top-4 right-4 text-gray-500 cursor-pointer">✕</button>
            <div className="flex items-start gap-x-3 mt-4 mb-6">
              <input id="terms-checkbox" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-5 h-5 accent-[#1A4C8B] cursor-pointer" />
              <label htmlFor="terms-checkbox" className="text-[12px] font-extrabold text-[#222] leading-tight m-0 cursor-pointer">
                By checking this box, you agree to our{' '}
                <Link href="/terms-and-conditions" className="text-[#1A4C8B] underline hover:opacity-80" target="_blank">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-[#1A4C8B] underline hover:opacity-80" target="_blank">
                  Privacy Policy
                </Link>.
              </label>
            </div>
            <button onClick={handleProceedRegistration} disabled={!termsAccepted} className={`px-8 py-2 w-full rounded text-white text-xs font-bold ${termsAccepted ? 'bg-[#1A4C8B]' : 'bg-gray-400'}`}>Proceed</button>
          </div>
        </div>
      )}
    </div>
  );
}