'use client';

import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';
import { getCustomBannedWords, addBannedWord, removeBannedWord } from '@/app/service/moderation';

// --- SIDEBAR ASSET IMPORTS ---
import profileIcon from '@/app/(teacher)/class-manager/photos/DefaultTemporaryProfile.png';
import termsIcon from '@/app/(teacher)/class-manager/photos/TermsAndCondition.png';
import privacyIcon from '@/app/(teacher)/class-manager/photos/PrivacyPolicy.png';
import logoutIcon from '@/app/(teacher)/class-manager/photos/Logout.png';

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

export default function ModeratorDashboard({ profile }: { profile: any }) {
    const router = useRouter();

    // --- STATE FOR SIDEBAR ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- STATE FOR WORD FILTER ---
    const [inputValue, setInputValue] = useState('');
    const [bannedWords, setBannedWords] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // --- STATE FOR UI FEEDBACK ---
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Saving...');
    const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({ isVisible: false, message: '' });

    // --- STATE FOR VIOLATIONS FLOW ---
    const [violations, setViolations] = useState([
        {
            id: 1,
            studentName: 'Juan Dela Crux',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In non lorem varius, rutrum sapien et, iaculis odio. Suspendisse rhoncus tortor.',
            issue: 'Content contains Banned Word.',
            offendingWord: 'bobo'
        }
    ]);
    const [selectedViolation, setSelectedViolation] = useState<any | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);

    // --- HANDLERS ---
    const triggerToast = (msg: string) => {
        setToast({ isVisible: true, message: msg });
        setTimeout(() => setToast({ isVisible: false, message: '' }), 3000);
    };

    const handleLogout = () => {
        // Add your logout logic here
        router.push('/auth/login');
    };

    useEffect(() => {
        async function load() {
            const words = await getCustomBannedWords();
            setBannedWords(words);
        }
        load();
    }, []);

    const handleAddWord = async () => {
        const word = inputValue.trim().replace(/^@/, '').toLowerCase();
        if (word && !bannedWords.includes(word)) {
            setLoadingMessage('Saving...');
            setIsLoading(true);

            const result = await addBannedWord(word);

            setIsLoading(false);
            if (!result?.error) {
                setBannedWords([...bannedWords, word]);
                setInputValue('');
                triggerToast('Word added to database!');
            } else {
                triggerToast('Failed to save word.');
            }
        }
    };

    const removeWord = async (wordToRemove: string) => {
        setLoadingMessage('Removing...');
        setIsLoading(true);

        const result = await removeBannedWord(wordToRemove);

        setIsLoading(false);
        if (!result?.error) {
            setBannedWords(bannedWords.filter(w => w !== wordToRemove));
            triggerToast('Word removed from filter');
        } else {
            triggerToast('Failed to remove word.');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            handleAddWord();
        }
        if (e.key === 'Backspace' && inputValue === '' && bannedWords.length > 0) {
            const lastWord = bannedWords[bannedWords.length - 1];
            removeWord(lastWord);
        }
    };

    const handleConfirmRemove = () => {
        setShowConfirmRemoveModal(false);
        setLoadingMessage('Removing...');
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setViolations(violations.filter(v => v.id !== selectedViolation?.id));
            setSelectedViolation(null);
            triggerToast('Content Removed');
        }, 1500);
    };

    return (
        <div className="flex h-screen bg-[#E2E7E9] font-sans overflow-hidden">
            <Gr8LoadingOverlay isLoading={isLoading} message={loadingMessage} />

            {/* --- COLLAPSIBLE SIDEBAR --- */}
            <div className={`fixed md:relative z-[100] h-full flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-[#F4F5F7] border-r border-[#D1D8DD] ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0 w-[280px] md:w-0'}`}>
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

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
                <Gr8MathHeader />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 md:pt-12 w-full">

                    {/* DARK CYAN HAMBURGER - TOGGLES SIDEBAR */}
                    <div className="mb-6 flex items-center gap-3">
                        <button
                            aria-label='de'
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-[#008B8B] hover:opacity-80 transition-opacity outline-none cursor-pointer block"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-8 items-start">

                        {/* LEFT COLUMN: VIOLATIONS */}
                        <div className="bg-[#F4F6F8] border border-[#B0B8C1] rounded-xl p-6 md:p-8 min-h-[600px] shadow-sm">
                            <h2 className="text-[22px] font-black text-[#222] mb-6">Violations</h2>

                            <div className="space-y-4">
                                {violations.length === 0 ? (
                                    <p className="text-gray-500 font-medium">No violations to review.</p>
                                ) : (
                                    violations.map((violation) => (
                                        <div key={violation.id} className="bg-[#F4EBE6] border border-[#DCD3CC] rounded-xl p-6 relative overflow-hidden">
                                            <h3 className="text-[15px] font-bold text-[#222] mb-3">{violation.studentName}</h3>
                                            <p className="text-[13px] text-[#444] font-medium leading-relaxed mb-6 text-justify">
                                                {violation.description}
                                            </p>

                                            <div className="bg-[#E91D26BF] rounded-full px-5 py-3 flex justify-between items-center text-white shadow-sm">
                                                <span className="font-bold text-[13px] truncate pr-4">{violation.issue}</span>
                                                <button
                                                    onClick={() => { setSelectedViolation(violation); setShowDetailsModal(true); }}
                                                    className="font-black text-[13px] underline hover:opacity-80 transition-opacity outline-none cursor-pointer"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: WORD FILTER & AUDIT TRAILS */}
                        <div className="flex flex-col gap-6 lg:gap-8">

                            <div className="bg-[#F4F6F8] border border-[#B0B8C1] rounded-xl p-6 md:p-8 shadow-sm">
                                <h2 className="text-[22px] font-black text-[#222] mb-4">Word Filter</h2>
                                <p className="text-[13px] text-[#444] font-medium leading-relaxed mb-6 text-justify">
                                    This database contains terms identified as derogatory, disrespectful, or profane. To maintain a safe and focused learning environment, any student posts matching these entries will be automatically flagged for moderator review before appearing in the public feed.
                                </p>

                                <label className="block text-[14px] font-bold text-[#222] mb-2">Add words</label>

                                <div
                                    className="bg-transparent border border-[#B0B8C1] rounded-lg min-h-[100px] p-3 flex flex-wrap gap-2 items-start content-start mb-6 shadow-sm focus-within:ring-1 focus-within:ring-[#EFBD31] focus-within:border-[#EFBD31] transition-all cursor-text"
                                    onClick={() => inputRef.current?.focus()}
                                >
                                    {bannedWords.map((word, index) => (
                                        <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D1D8DD] rounded-full text-[13px] font-semibold text-[#222]">
                                            {word}
                                            <button aria-label='dwd' onClick={(e) => { e.stopPropagation(); removeWord(word); }} className="text-[#888] hover:text-[#ED1F24] outline-none ml-1 cursor-pointer">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={bannedWords.length === 0 ? "ex. @word" : ""}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] font-medium text-[#222] placeholder:text-[#A0A0A0] py-1.5"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={handleAddWord} className="bg-[#1A4C8B] text-white px-8 py-2.5 rounded-lg font-bold text-[13px] hover:bg-[#153a6b] shadow-md outline-none">
                                        Add Word
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#F4F6F8] border border-[#B0B8C1] rounded-xl p-6 md:p-8 shadow-sm">
                                <h2 className="text-[22px] font-black text-[#222] mb-4">Audit Trails</h2>
                                <p className="text-[13px] text-[#444] font-medium leading-relaxed mb-6 text-justify">
                                    This ledger provides a chronological record of all administrative actions, security events, and content moderation decisions. To ensure accountability and transparency, entries in this log are read-only and cannot be modified or deleted.
                                </p>
                                <div className="flex justify-end">
                                    <Link
                                        href="/audit-trails"
                                        className="bg-[#1A4C8B] text-white px-8 py-2.5 rounded-lg font-bold text-[13px] hover:bg-[#153a6b] shadow-md outline-none inline-block text-center"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODALS */}
                {showDetailsModal && selectedViolation && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-[450px] relative animate-in zoom-in-95 duration-200">
                            <button aria-label='dwd' onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors outline-none">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <h2 className="text-[18px] font-extrabold text-[#222] mb-6">Violation Details</h2>

                            <div className="mb-4">
                                <span className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1">Student Name</span>
                                <span className="text-[15px] font-black text-[#222]">{selectedViolation.studentName}</span>
                            </div>

                            <div className="mb-8">
                                <span className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Flagged Content</span>
                                <div className="bg-[#F8F5EF] border border-[#D1D8DD] rounded-lg p-4 text-[13px] text-[#444] font-medium leading-relaxed text-justify">
                                    Lorem ipsum dolor sit amet, <span className="bg-[#E91D26BF] text-white px-1.5 py-0.5 rounded font-bold mx-1">{selectedViolation.offendingWord}</span> consectetur adipiscing elit. In non lorem varius, rutrum sapien et, iaculis odio. Suspendisse rhoncus tortor.
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setViolations(violations.filter(v => v.id !== selectedViolation?.id)); setShowDetailsModal(false); triggerToast('Content Allowed'); }}
                                    className="w-full py-3.5 rounded-lg text-white font-black text-[13px] transition-colors outline-none shadow-md hover:opacity-90"
                                    style={{ backgroundColor: '#1E4B95' }}
                                >
                                    Allow Content
                                </button>
                                <button onClick={() => { setShowDetailsModal(false); setShowConfirmRemoveModal(true); }} className="w-full py-3.5 rounded-lg bg-[#ED1F24] text-white font-black text-[13px] hover:bg-[#c9181c] transition-colors shadow-md outline-none">
                                    Remove Content
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showConfirmRemoveModal && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-[400px] text-center animate-in zoom-in-95 duration-200">
                            <h2 className="text-[16px] font-extrabold text-[#222] mb-8 leading-snug">Are you sure you want to remove this content?</h2>
                            <div className="flex justify-center gap-x-12">
                                <button onClick={handleConfirmRemove} className="text-[#ED1F24] font-black text-[15px] hover:opacity-70 transition-opacity outline-none">Yes</button>
                                <button onClick={() => setShowConfirmRemoveModal(false)} className="text-[#ED1F24] font-black text-[15px] hover:opacity-70 transition-opacity outline-none">No</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Gr8Toast isVisible={toast.isVisible} message={toast.message} />
        </div>
    );
}