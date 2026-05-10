'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// IMPORT OVERLAY
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';

// IMPORT FROM ACTIONS
import { fetchProfileData, saveProfileData } from '@/app/(moderator)/action';

import defaultProfile from '@/app/(teacher)/class-manager/photos/DefaultTemporaryProfile.png';

// --- CUSTOM TOAST COMPONENT ---
const Gr8Toast = ({ isVisible, message }: { isVisible: boolean, message: string }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out">
            <div className="bg-[#0A7F93] text-white px-8 py-3.5 rounded shadow-xl flex items-center justify-center">
                <span className="text-[13px] font-bold tracking-wide">{message}</span>
            </div>
        </div>
    );
};

// --- CORE CONTENT COMPONENT ---
function AccountSettingsContent() {
    const router = useRouter();
    // --- ORIGINAL DATA BACKUP (For Canceling) ---
    const [originalData, setOriginalData] = useState({ firstName: '', lastName: '', gender: '', birthdate: '' });

    // --- FORM STATE ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [birthdate, setBirthdate] = useState('');

    // --- PROFILE PICTURE STATE ---
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- EDIT MODE STATE (View First) ---
    const [isEditingFirst, setIsEditingFirst] = useState(false);
    const [isEditingLast, setIsEditingLast] = useState(false);
    const [isEditingGender, setIsEditingGender] = useState(false);
    const [isEditingBirthdate, setIsEditingBirthdate] = useState(false);

    // --- REFS FOR AUTO-FOCUS ---
    const firstRef = useRef<HTMLInputElement>(null);
    const lastRef = useRef<HTMLInputElement>(null);

    // --- UI STATE ---
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, message: '' });

    const triggerToast = (msg: string) => {
        setToast({ isVisible: true, message: msg });
        setTimeout(() => setToast({ isVisible: false, message: '' }), 3000);
    };

    // Load Profile Data on Mount
    useEffect(() => {
        async function loadProfile() {
            setIsLoading(true);
            const response = await fetchProfileData();

            if (response.success && response.data) {
                const fName = response.data.first_name || '';
                const lName = response.data.last_name || '';
                const gen = response.data.gender || '';
                const bDate = response.data.birthdate || '';

                setFirstName(fName);
                setLastName(lName);
                setGender(gen);
                setBirthdate(bDate);

                setOriginalData({ firstName: fName, lastName: lName, gender: gen, birthdate: bDate });

                if (response.data.profile_pic) {
                    setPreviewImage(response.data.profile_pic);
                }
            } else {
                triggerToast(response.error || 'Failed to load profile');
            }
            setIsLoading(false);
        }
        loadProfile();
    }, []);

    // Handle Image Selection (Preview Only)
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Handle Save Profile
    const handleSave = async () => {
        setIsSaving(true);

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('gender', gender);
        formData.append('birthdate', birthdate);

        if (selectedFile) {
            formData.append('profile_pic', selectedFile);
        }

        const response = await saveProfileData(formData);

        if (response.success) {
            triggerToast('Profile updated successfully!');

            setOriginalData({ firstName, lastName, gender, birthdate });

            // Lock fields back into "view" mode
            setIsEditingFirst(false);
            setIsEditingLast(false);
            setIsEditingGender(false);
            setIsEditingBirthdate(false);
        } else {
            triggerToast(response.error || 'Failed to save');
        }

        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-[#F4F5F7] font-sans relative flex flex-col items-center pb-12">

            {/* Loading Overlays */}
            <Gr8LoadingOverlay isLoading={isLoading} message="Loading Profile..." />
            <Gr8LoadingOverlay isLoading={isSaving} message="Saving Changes..." />

            {/* Toast Notification */}
            <Gr8Toast isVisible={toast.isVisible} message={toast.message} />

            {/* --- TOOLBAR --- */}
            <div className="w-full h-16 flex items-center justify-between px-4 bg-transparent mt-4 max-w-2xl">
                {/* 
                  FIX: Using <Link> instead of button/router.push. 
                  Next.js automatically prefetches this route, completely eliminating the black screen.
                */}
                <button
                    aria-label='back'
                    onClick={() => router.back()}
                    className="p-2 text-gray-700 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h1 className="text-[20px] font-bold text-[#222]">Profile</h1>
                <div className="w-10"></div>
            </div>

            {/* --- MAIN SCROLL CONTENT --- */}
            <div className="w-full max-w-xl px-6 mt-6 relative">

                {/* Overlapping Profile Picture */}
                <div className="relative z-10 w-[120px] h-[120px] mx-auto -mb-[60px] drop-shadow-md">
                    <Image
                        src={previewImage || defaultProfile}
                        alt="Profile"
                        layout="fill"
                        className="rounded-full object-cover border-4 border-white bg-white"
                        unoptimized={!!previewImage}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <button
                        aria-label='inputRef'
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-[#1A4C8B] hover:bg-gray-50 transition-colors outline-none"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                    </button>
                </div>

                {/* --- CARD CONTENT --- */}
                <div className="bg-white rounded-[24px] pt-[80px] pb-8 px-6 md:px-10 shadow-sm border border-gray-100 flex flex-col relative z-0">

                    {/* First Name Field */}
                    <div className="flex items-end mb-6 gap-4">
                        <div className="flex-1">
                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">First Name</label>
                            <input
                                aria-label='firstName'
                                ref={firstRef}
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={!isEditingFirst}
                                className={`w-full text-[18px] text-[#222] border-b pb-2 mt-1 bg-transparent outline-none transition-colors
                                    ${isEditingFirst ? 'border-[#008B8B]' : 'border-gray-300 opacity-80'}
                                `}
                            />
                        </div>
                        {isEditingFirst ? (
                            <button aria-label='Notedit' onClick={() => { setIsEditingFirst(false); setFirstName(originalData.firstName); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors outline-none">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        ) : (
                            <button aria-label='edit' onClick={() => { setIsEditingFirst(true); setTimeout(() => firstRef.current?.focus(), 50); }} className="p-1.5 text-[#008B8B] hover:bg-gray-100 rounded transition-colors outline-none">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                        )}
                    </div>

                    {/* Last Name Field */}
                    <div className="flex items-end mb-8 gap-4">
                        <div className="flex-1">
                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Last Name</label>
                            <input
                                aria-label='lastName'
                                ref={lastRef}
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={!isEditingLast}
                                className={`w-full text-[18px] text-[#222] border-b pb-2 mt-1 bg-transparent outline-none transition-colors
                                    ${isEditingLast ? 'border-[#008B8B]' : 'border-gray-300 opacity-80'}
                                `}
                            />
                        </div>
                        {isEditingLast ? (
                            <button aria-label='notEdit' onClick={() => { setIsEditingLast(false); setLastName(originalData.lastName); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors outline-none">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        ) : (
                            <button aria-label='edit' onClick={() => { setIsEditingLast(true); setTimeout(() => lastRef.current?.focus(), 50); }} className="p-1.5 text-[#008B8B] hover:bg-gray-100 rounded transition-colors outline-none">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                        )}
                    </div>

                    {/* Gender Dropdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-2 sm:gap-4">
                        <label className="w-[120px] text-[15px] font-bold text-[#222]">Gender</label>
                        <div className="flex-1 relative flex gap-2">
                            <div className="relative flex-1">
                                <select
                                    aria-label='selectGender'
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    disabled={!isEditingGender}
                                    className={`w-full appearance-none bg-[#F4F5F7] border rounded-lg px-4 py-3 text-[15px] text-[#222] outline-none transition-colors cursor-pointer
                                        ${isEditingGender ? 'border-[#008B8B]' : 'border-gray-300 opacity-80'}
                                    `}
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                            {isEditingGender ? (
                                <button aria-label='notEdit' onClick={() => { setIsEditingGender(false); setGender(originalData.gender); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors outline-none shrink-0 self-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            ) : (
                                <button aria-label='edit' onClick={() => setIsEditingGender(true)} className="p-1.5 text-[#008B8B] hover:bg-gray-100 rounded transition-colors outline-none shrink-0 self-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Birthdate Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center mb-10 gap-2 sm:gap-4">
                        <label className="w-[120px] text-[15px] font-bold text-[#222]">Birthdate</label>
                        <div className="flex-1 relative flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    aria-label='inputDate'
                                    type="date"
                                    value={birthdate}
                                    onChange={(e) => setBirthdate(e.target.value)}
                                    disabled={!isEditingBirthdate}
                                    className={`w-full bg-[#F4F5F7] border rounded-lg px-4 py-3 text-[15px] text-[#222] outline-none transition-colors appearance-none cursor-pointer
                                        ${isEditingBirthdate ? 'border-[#008B8B]' : 'border-gray-300 opacity-80'}
                                    `}
                                />
                            </div>
                            {isEditingBirthdate ? (
                                <button aria-label='notEdit' onClick={() => { setIsEditingBirthdate(false); setBirthdate(originalData.birthdate); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors outline-none shrink-0 self-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            ) : (
                                <button aria-label='edit' onClick={() => setIsEditingBirthdate(true)} className="p-1.5 text-[#008B8B] hover:bg-gray-100 rounded transition-colors outline-none shrink-0 self-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || (!isEditingFirst && !isEditingLast && !isEditingGender && !isEditingBirthdate && !selectedFile)}
                            className="w-full bg-[#1A4C8B] text-white py-3.5 rounded-lg font-bold text-[15px] hover:bg-[#153a6b] transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}


export default function AccountSettingsPage() {
    return (
        <Suspense fallback={<Gr8LoadingOverlay isLoading={true} message="Preparing Profile..." />}>
            <AccountSettingsContent />
        </Suspense>
    );
}
