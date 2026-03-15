'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Gr8TextField } from '@/components/ui/Gr8TextField';
import { Gr8TimePicker } from '@/components/ui/Gr8TimePicker';
import { ClassCard } from '@/components/card/ClassCard';
import { getTeacherClasses, getSearchHistory, saveSearchHistory, createClass } from './action';
import { formatTime } from '@/lib/utils/utils';
import { Gr8Toast } from '@/components/ui/Gr8Toast';
import { Gr8Cache } from '@/lib/utils/cache';
import Link from 'next/link';

// --- SIDEBAR IMAGE IMPORTS ---
import profileIcon from './photos/DefaultTemporaryProfile.png';
import termsIcon from './photos/TermsAndCondition.png';
import privacyIcon from './photos/PrivacyPolicy.png';
import logoutIcon from './photos/Logout.png';

interface UserProfile {
    id: string;
    first_name: string;
    roles: string;
    profile_pic: string | null;
}

export default function ClassManagerClient({ profile }: { profile: UserProfile | null }) {
    // Layout State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data States
    const [classesList, setClassesList] = useState<any[]>(() => Gr8Cache.get('teacher-classes', '') || []);
    const [isFetchingClasses, setIsFetchingClasses] = useState(!Gr8Cache.get('teacher-classes', ''));
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);



    // Modal & UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({
        isVisible: false,
        message: ''
    });

    const [className, setClassName] = useState('');
    const [numStudents, setNumStudents] = useState('');
    const [startTime, setStartTime] = useState('11:00 AM');
    const [endTime, setEndTime] = useState('12:30 PM');
    const [generatedCode, setGeneratedCode] = useState('');

    const [errors, setErrors] = useState<{ className?: string; numStudents?: string }>({});

    useEffect(() => {
        if (!profile?.id) return;

        getSearchHistory(profile.id).then(setSearchHistory);

        const cachedData = Gr8Cache.get('teacher-classes', searchQuery);
        if (cachedData) {
            setClassesList(cachedData);
            setIsFetchingClasses(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsFetchingClasses(true);
            const data = await getTeacherClasses(profile.id, searchQuery);

            Gr8Cache.set('teacher-classes', data, searchQuery);
            setClassesList(data);
            setIsFetchingClasses(false);

            if (searchQuery.trim().length > 0) {
                await saveSearchHistory(profile.id, searchQuery.trim());
                const updatedHistory = await getSearchHistory(profile.id);
                setSearchHistory(updatedHistory);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, profile?.id]);

    const validateForm = () => {
        const newErrors: { className?: string; numStudents?: string } = {};
        if (!className.trim()) newErrors.className = 'Please enter the needed details.';
        if (!numStudents.trim()) newErrors.numStudents = 'Please enter the needed details';
        else if (isNaN(Number(numStudents)) || Number(numStudents) <= 0) newErrors.numStudents = 'Must be a valid positive number.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateClass = async () => {
        if (!validateForm() || !profile?.id) return;

        setErrors({});
        setIsLoading(true);

        try {
            const result = await createClass(
                profile.id,
                className,
                Number(numStudents),
                startTime,
                endTime
            );

            if (result.success) {
                setGeneratedCode(result.classCode || '');
                setShowSuccess(true);
                Gr8Cache.invalidate('teacher-classes');
                const updatedClasses = await getTeacherClasses(profile.id, searchQuery);
                setClassesList(updatedClasses);
                Gr8Cache.set('teacher-classes', updatedClasses, searchQuery);
            }
        } catch (err) {
            triggerToast("Failed to create class. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const triggerToast = (msg: string) => {
        setToast({ isVisible: true, message: msg });
        setTimeout(() => {
            setToast({ isVisible: false, message: '' });
        }, 3000);
    };

    const handleCopyCode = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            triggerToast("CLASS CODE COPIED");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setShowSuccess(false);
        setClassName('');
        setNumStudents('');
        setErrors({});
    };

    const handleLogout = async () => {
        Gr8Cache.clearAll();
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        await supabase.auth.signOut();

        window.location.href = '/';
    };

    return (
        <div className="flex h-screen bg-[#E2E7E9] font-sans overflow-hidden">

            {/* --- MOBILE BACKDROP --- */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- COLLAPSIBLE SIDEBAR --- */}
            <div className={`fixed md:relative z-[50] h-full flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-[#F4F5F7] border-r border-[#D1D8DD] ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0 w-[280px] md:w-0'}`}>
                <div className="w-[280px] h-full flex flex-col">
                    <div className="bg-[#DDE2E5] flex flex-col items-center justify-center py-12 px-4 shrink-0">
                        <Image
                            src={profile?.profile_pic || profileIcon}
                            alt="Profile"
                            width={80}
                            height={80}
                            className={`mb-4 w-20 h-20 ${profile?.profile_pic ? 'rounded-full object-cover' : 'object-contain'}`}
                        />
                        <h2 className="text-[22px] font-extrabold text-[#222] m-0">Hi, {profile?.first_name || 'Name'}!</h2>
                    </div>

                    <div className="flex-1 flex flex-col gap-y-8 pt-10 px-8">
                        <button className="flex items-center justify-start w-full gap-x-4 text-[16px] font-bold text-[#222] transition-all hover:drop-shadow-lg bg-transparent border-none cursor-pointer p-0 text-left">
                            <Image src={termsIcon} alt="Terms and Conditions" width={24} height={24} className="object-contain shrink-0" />
                            <span className="leading-tight">Terms and Conditions</span>
                        </button>
                        <button className="flex items-center justify-start w-full gap-x-4 text-[16px] font-bold text-[#222] transition-all hover:drop-shadow-lg bg-transparent border-none cursor-pointer p-0 text-left">
                            <Image src={privacyIcon} alt="Privacy Policy" width={24} height={24} className="object-contain shrink-0" />
                            <span className="leading-tight">Privacy Policy</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-start w-full gap-x-4 text-[16px] font-bold text-[#222] transition-all hover:drop-shadow-lg bg-transparent border-none cursor-pointer p-0 text-left">
                            <Image src={logoutIcon} alt="Logout" width={24} height={24} className="object-contain shrink-0" />
                            <span className="leading-tight">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                {/* --- TOP HEADER --- */}
                <div className="p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-x-4">
                        <button aria-label='header' onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded hover:bg-black/5 transition-colors cursor-pointer outline-none">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <h1 className="text-[20px] font-extrabold m-0 text-[#222]">Class Manager</h1>
                    </div>

                    <div className="relative w-full md:w-[300px]">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            className="w-full py-2.5 pl-4 pr-10 text-sm bg-[#ECF1F4] border border-[#B0B8C1] rounded outline-none text-gray-800 placeholder-[#B0B8C1] focus:border-[#0A7F93]"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        {isSearchFocused && !searchQuery && searchHistory.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white mt-1 border border-[#D1D8DD] rounded-lg shadow-xl z-50 overflow-hidden">
                                <div className="px-4 py-2 text-[10px] font-bold text-[#A0A0A0] uppercase bg-[#F4F6F8]">Recent Searches</div>
                                {searchHistory.map((term, index) => (
                                    <button
                                        key={index}
                                        onMouseDown={() => {
                                            setSearchQuery(term);
                                            setIsSearchFocused(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-semibold text-[#444] hover:bg-[#FDF8F2] border-b last:border-0"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- CLASS GRID --- */}
                <div className="px-4 md:px-8 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 overflow-y-auto">
                    {isFetchingClasses && <div className="col-span-full py-10 text-center text-[#1A4C8B] font-bold">Updating list...</div>}

                    {!isFetchingClasses && classesList.map((cls) => (
                        <Link
                            key={cls.id}
                            href={`/class-page?id=${cls.id}`}
                            className="block group transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ClassCard
                                sectionName={cls.class_name}
                                timeRange={`${formatTime(cls.arrival_time)} - ${formatTime(cls.dismissal_time)}`}
                                studentCount={cls.class_size}
                            />
                        </Link>
                    ))}

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#E9E9E9] border-2 border-dashed border-[#B0B8C1] rounded-xl p-6 flex flex-col items-center justify-center gap-y-3 hover:border-[#1A4C8B] transition-all cursor-pointer h-[180px]"
                    >
                        <div className="w-10 h-10 rounded-full border-2 border-[#1A4C8B] flex items-center justify-center">
                            <span className="text-[#1A4C8B] text-2xl font-bold">+</span>
                        </div>
                        <span className="text-[14px] font-black text-[#1A4C8B] uppercase">Add Classes</span>
                    </button>
                </div>

                {/* --- MODAL SYSTEM --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-[420px] relative">
                            {!showSuccess ? (
                                <>
                                    {isLoading && (
                                        <div className="absolute inset-0 z-[110] bg-white/80 flex flex-col items-center justify-center rounded-xl">
                                            <div className="w-12 h-12 border-4 border-[#E0E0E0] border-t-[#1A4C8B] rounded-full animate-spin mb-4"></div>
                                            <span className="text-[#1A4C8B] font-bold text-sm">Creating Class...</span>
                                        </div>
                                    )}
                                    <h2 className="text-[20px] font-extrabold text-[#222] mb-6">Add Classes</h2>
                                    <div className="flex flex-col gap-y-1">
                                        <Gr8TextField label="Class Name" value={className} onChange={setClassName} hasError={!!errors.className} errorMessage={errors.className} showTopLabel />
                                        <div className="flex flex-col mb-4">
                                            <span className="text-[14px] font-extrabold text-[#222] mb-3">Class Schedule</span>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-x-4">
                                                <Gr8TimePicker label="Start" value={startTime} onChange={setStartTime} />
                                                <span className="font-extrabold text-[#222] hidden sm:block">-</span>
                                                <Gr8TimePicker label="End" value={endTime} onChange={setEndTime} />
                                            </div>
                                        </div>
                                        <Gr8TextField label="Number of Students" value={numStudents} onChange={setNumStudents} hasError={!!errors.numStudents} errorMessage={errors.numStudents} showTopLabel />
                                    </div>
                                    <div className="flex justify-end gap-x-4 mt-8">
                                        <button onClick={closeModal} className="px-6 py-2 text-xs font-black text-[#ED1F24] uppercase">Cancel</button>
                                        <button onClick={handleCreateClass} className="px-10 py-2.5 text-xs font-black text-white bg-[#1A4C8B] rounded uppercase">Create</button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <h2 className="text-[22px] font-extrabold text-[#222] mb-2 uppercase">Success</h2>
                                    <p className="text-[#666] text-sm mb-8">Class has been created</p>
                                    <div className="bg-[#F4F6F8] border border-[#D1D8DD] rounded-lg p-6 mb-8">
                                        <p className="text-[10px] font-bold text-[#A0A0A0] uppercase mb-2">Class Code</p>
                                        <div className="flex items-center justify-center gap-x-4">
                                            <span className="text-3xl font-black text-[#222]">{generatedCode}</span>
                                            <button aria-label='code' onClick={handleCopyCode} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A4C8B" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <button onClick={closeModal} className="w-full py-3 text-xs font-black text-white bg-[#1A4C8B] rounded uppercase shadow-md hover:bg-[#153a6b] transition-all">Done</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TOAST --- */}
                <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[200] pointer-events-none">
                    <Gr8Toast
                        isVisible={toast.isVisible}
                        message={toast.message}
                    />
                </div>
            </div>
        </div>
    );
}