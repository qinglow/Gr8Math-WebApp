import React from 'react';
import Image from 'next/image';
import backArrowIcon from '../../app/auth/photos/back-arrow.png';
import { Gr8TextField } from '../ui/Gr8TextField';
import { Gr8Button } from '../ui/Gr8Button';
import { Gr8Select } from '../ui/Gr8Select';
import { Gr8DatePicker } from '../ui/Gr8DatePicker';

interface FormProps {
  roleTitle: string;
  onBack: () => void;
  onNext: () => void;
  formData: any;
  setField: (field: string, value: string) => void;
  errors: any;
  extraFieldLabel: string;
  extraFieldType: 'text' | 'select';
  extraFieldOptions?: string[];
  activeField: string | null;
  setActiveField: (val: string | null) => void;
  errorMessages?: Record<string, string>; 
}

export const RegistrationDetailsForm = ({
  roleTitle,
  onBack,
  onNext,
  formData,
  setField,
  errors,
  extraFieldLabel,
  extraFieldType,
  extraFieldOptions = [],
  activeField,
  setActiveField,
  errorMessages = {} 
}: FormProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center mb-4 gap-x-4">
        <button type="button" aria-label="Close modal" onClick={onBack} className="hover:opacity-70 transition-opacity bg-transparent border-none p-0 cursor-pointer flex items-center justify-center">
          <Image src={backArrowIcon} alt="Back" width={20} height={20} className="object-contain" />
        </button>
        <h2 className="text-[22px] font-bold text-[#222] m-0">Register</h2>
      </div>

      <p className="text-[14px] font-bold text-[#222] mb-6 mt-2 text-center">
        Please enter the needed {roleTitle} details.
      </p>

      <div className="flex flex-col gap-y-1">
        {/* Email with dynamic message */}
        <Gr8TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(v) => setField('email', v)}
          isActive={activeField === 'email'}
          onFocus={() => setActiveField('email')}
          onBlur={() => setActiveField(null)}
          hasError={errors.email}
          errorMessage={errorMessages.email || "Required"}
        />

        <Gr8TextField
          label="Firstname"
          value={formData.firstName}
          onChange={(v) => setField('firstName', v)}
          isActive={activeField === 'first'}
          onFocus={() => setActiveField('first')}
          onBlur={() => setActiveField(null)}
          hasError={errors.firstName}
          errorMessage={errorMessages.firstName || "Required"}
        />

        <Gr8TextField
          label="Lastname"
          value={formData.lastName}
          onChange={(v) => setField('lastName', v)}
          isActive={activeField === 'last'}
          onFocus={() => setActiveField('last')}
          onBlur={() => setActiveField(null)}
          hasError={errors.lastName}
          errorMessage={errorMessages.lastName || "Required"}
        />

        {extraFieldType === 'select' ? (
          <Gr8Select
            label={extraFieldLabel}
            value={formData.extra}
            onChange={(v) => setField('extra', v)}
            options={extraFieldOptions}
            isActive={activeField === 'extra'}
            onFocus={() => setActiveField('extra')}
            onBlur={() => setActiveField(null)}
            hasError={errors.extra}
            errorMessage={errorMessages.extra || "Required"}
          />
        ) : (
          <Gr8TextField
            label={extraFieldLabel}
            value={formData.extra}
            onChange={(v) => setField('extra', v)}
            isActive={activeField === 'extra'}
            onFocus={() => setActiveField('extra')}
            onBlur={() => setActiveField(null)}
            hasError={errors.extra}
            errorMessage={errorMessages.extra || "Required"}
          />
        )}

        <div className="flex items-start mb-2">
          <span className="w-[90px] text-[14px] font-extrabold text-[#222] mt-3">Gender</span>
          <div className="flex-1">
            <Gr8Select
              label="Gender"
              value={formData.gender}
              onChange={(v) => setField('gender', v)}
              options={['Male', 'Female']}
              isActive={activeField === 'gender'}
              onFocus={() => setActiveField('gender')}
              onBlur={() => setActiveField(null)}
              hasError={errors.gender}
              errorMessage={errorMessages.gender || "Required"}
            />
          </div>
        </div>

        <div className="flex items-start">
          <span className="w-[90px] text-[14px] font-extrabold text-[#222] mt-3">Birthdate</span>
          <div className="flex-1">
            <Gr8DatePicker
              label="MM/DD/YYYY"
              value={formData.birthdate}
              onChange={(v) => setField('birthdate', v)}
              isActive={activeField === 'bday'}
              onFocus={() => setActiveField('bday')}
              onBlur={() => setActiveField(null)}
              hasError={errors.birthdate}
              errorMessage={errorMessages.birthdate || "Required"}
            />
          </div>
        </div>
      </div>

      <div className="w-full mt-6">
        <Gr8Button text="Next" onClick={onNext} variant="solid" />
      </div>
    </div>
  );
};