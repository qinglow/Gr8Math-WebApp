import React from 'react';
import { Gr8TextField } from '../ui/Gr8TextField';
import { Gr8Button } from '../ui/Gr8Button';

interface FormProps {
    passwordValue: string;
    confirmValue: string;
    onPasswordChange: (val: string) => void;
    onConfirmChange: (val: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    buttonText?: string;
    error?: boolean;
    errorMessage?: string;
    activeField: string | null;
    setActiveField: (val: any) => void;
    disabled?: boolean;
}

export const PasswordDetailsForm = ({
    passwordValue,
    confirmValue,
    onPasswordChange,
    onConfirmChange,
    onSubmit,
    isLoading,
    buttonText = "Save Password",
    error,
    errorMessage,
    activeField,
    setActiveField,
    disabled
}: FormProps) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-[11px] font-semibold text-[#222] mb-6 leading-relaxed">
                <p className="mb-1">Please create a new password. The password needs to follow the following requirements:</p>
                <ul className="list-none p-0 m-0 text-[10px]">
                    <li>- Minimum of 8 and maximum of 16 characters</li>
                    <li>- At least one uppercase letter</li>
                    <li>- At least one number and one special character</li>
                </ul>
            </div>

            <Gr8TextField
                label="New Password"
                type="password"
                value={passwordValue}
                onChange={onPasswordChange}
                isActive={activeField === 'newPassword'}
                onFocus={() => setActiveField('newPassword')}
                onBlur={() => setActiveField(null)}
                hasError={error}
                errorMessage={errorMessage}
            />

            <Gr8TextField
                label="Re-enter Password"
                type="password"
                value={confirmValue}
                onChange={onConfirmChange}
                isActive={activeField === 'confirmPassword'}
                onFocus={() => setActiveField('confirmPassword')}
                onBlur={() => setActiveField(null)}
                hasError={error}
                errorMessage={errorMessage}
            />

            <div className="mt-6">
                <Gr8Button
                    type="button"
                    text={buttonText}
                    onClick={onSubmit}
                    variant="solid"
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};