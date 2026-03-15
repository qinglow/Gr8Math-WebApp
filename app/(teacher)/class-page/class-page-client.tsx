'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- COMPONENTS ---
import { LessonCard } from '@/components/card/LessonCard';
import { AssessmentCard } from '@/components/card/AssessmentCard';
import { Gr8TextField } from '@/components/ui/Gr8TextField';

// --- SIDEBAR TAB ICONS ---
import classActiveIcon from './photos/class-active.png';
import classInactiveIcon from './photos/class.png';
import participantsActiveIcon from './photos/participants-active.png';
import participantsIcon from './photos/participants.png';
import notificationsActiveIcon from './photos/notifications-active.png';
import notificationsIcon from './photos/notifications.png';
import dllActiveIcon from './photos/dll-active.png';
import dllIcon from './photos/dll.png';

// --- TYPE DEFINITIONS ---
type ClassContentItem = {
    id: number;
    type: 'lesson' | 'assessment';
    week_number?: number;
    lesson_title?: string;
    lesson_content?: string;
    preview?: string; // Stripped content for the card view
    assessment_number?: number;
    title?: string; // Used for assessments
    created_at?: string;
};

interface ClassPageClientProps {
    initialFeed: ClassContentItem[];
    sectionName: string;
    courseId: string;
}

export default function ClassPageClient({ initialFeed, sectionName, courseId }: ClassPageClientProps) {
    // --- HIGH-LEVEL VIEW STATE ---
    const [currentView, setCurrentView] = useState<'feed' | 'editor' | 'viewer'>('feed');
    const [viewingLesson, setViewingLesson] = useState<ClassContentItem | null>(null);

    // --- MOBILE RESPONSIVE STATE ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- FEED & SIDEBAR STATES ---
    const [activeTab, setActiveTab] = useState('class');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // --- MODAL & FLOW STATES ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAddOption, setSelectedAddOption] = useState<string | null>(null);
    const [addStep, setAddStep] = useState<'select' | 'details'>('select');

    const [weekNumber, setWeekNumber] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [hasDetailsError, setHasDetailsError] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    // EDIT STATE MANAGEMENT
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

    // --- EDITOR STATES ---
    const [lessonContent, setLessonContent] = useState('');
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
    const [isSavingLesson, setIsSavingLesson] = useState(false);

    // --- DATABASE STATE ---
    const [courseContent, setCourseContent] = useState<ClassContentItem[]>(initialFeed);

    useEffect(() => {
        setCourseContent(initialFeed);
        setCurrentView('feed');
        setViewingLesson(null);
        setActiveTab('class');

    }, [initialFeed, courseId]);
    // --- ADD / EDIT FLOW HANDLERS ---
    const handleEditLesson = (lesson: ClassContentItem) => {
        setIsEditingLesson(true);
        setEditingLessonId(lesson.id);
        setWeekNumber(lesson.week_number?.toString() || '');
        setLessonTitle(lesson.lesson_title || '');

        setIsAddModalOpen(true);
        setAddStep('details');
        setSelectedAddOption('lesson');
    };

    const handleProceedToDetails = () => {
        if (!selectedAddOption) return;
        if (selectedAddOption === 'lesson') {
            setAddStep('details');
        } else {
            setIsAddModalOpen(false);
        }
    };

    const handleNextDetails = () => {
        if (!weekNumber.trim() || !lessonTitle.trim()) {
            setHasDetailsError(true);
            return;
        }
        setHasDetailsError(false);
        setIsDetailsLoading(true);

        setTimeout(() => {
            setIsDetailsLoading(false);
            setIsAddModalOpen(false);
            setAddStep('select');
            setSelectedAddOption(null);

            if (isEditingLesson && editingLessonId) {
                const lessonToEdit = courseContent.find(l => l.id === editingLessonId);
                setLessonContent(lessonToEdit?.lesson_content || '');
            } else {
                setLessonContent('');
            }

            setCurrentView('editor');
        }, 1200);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setTimeout(() => {
            setSelectedAddOption(null);
            setAddStep('select');
            setWeekNumber('');
            setLessonTitle('');
            setHasDetailsError(false);
            setIsEditingLesson(false);
            setEditingLessonId(null);
        }, 200);
    };

    // --- EDITOR HANDLERS ---
    const handleBackFromEditor = () => {
        if (lessonContent.trim().length > 0) {
            setIsDiscardModalOpen(true);
        } else {
            resetToFeed();
        }
    };

    const confirmDiscard = () => {
        setIsDiscardModalOpen(false);
        resetToFeed();
    };

    const executeSaveLesson = () => {
        setIsSaveConfirmModalOpen(false);
        setIsSavingLesson(true);


        setTimeout(() => {
            if (isEditingLesson && editingLessonId) {
                setCourseContent(prev => prev.map(lesson =>
                    lesson.id === editingLessonId
                        ? {
                            ...lesson,
                            week_number: parseInt(weekNumber),
                            lesson_title: lessonTitle,
                            lesson_content: lessonContent,
                            preview: lessonContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                        }
                        : lesson
                ));
                setToastMessage('Lesson updated!');
            } else {
                const newLesson: ClassContentItem = {
                    type: 'lesson',
                    id: Date.now(),
                    week_number: parseInt(weekNumber),
                    lesson_title: lessonTitle,
                    lesson_content: lessonContent,
                    preview: lessonContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                };
                setCourseContent(prev => [newLesson, ...prev]);
                setToastMessage('Lesson posted!');
            }

            setIsSavingLesson(false);
            resetToFeed();

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 2000);
    };

    const resetToFeed = () => {
        setCurrentView('feed');
        setWeekNumber('');
        setLessonTitle('');
        setLessonContent('');
        setIsEditingLesson(false);
        setEditingLessonId(null);
    };

    const handleOpenViewer = (lesson: ClassContentItem) => {
        setViewingLesson(lesson);
        setCurrentView('viewer');
    };

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };


    // ============================================================================
    // VIEW 1: THE FULL SCREEN EDITOR
    // ============================================================================
    if (currentView === 'editor') {
        return (
            <div className="flex flex-col h-screen bg-[#E2E7E9] font-sans relative">
                {isSavingLesson && (
                    <div className="absolute inset-0 z-[200] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-[#E0E0E0] border-t-[#1A4C8B] rounded-full animate-spin mb-4"></div>
                        <span className="text-[#1A4C8B] font-bold text-sm tracking-wide">Processing...</span>
                    </div>
                )}

                <div className="p-4 md:p-8 lg:p-12 pb-4 flex items-center w-full mx-auto">
                    <button onClick={handleBackFromEditor} className="flex items-center gap-x-3 group cursor-pointer outline-none">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        <h1 className="text-[20px] md:text-[22px] font-black text-[#222] m-0 group-hover:text-[#0A7F93] transition-colors">
                            {isEditingLesson ? 'Edit Lesson' : 'Lesson Content'}
                        </h1>
                    </button>
                </div>

                <div className="flex-1 flex flex-col w-full mx-auto px-4 md:px-8 lg:px-12 pb-8 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-end mb-3">
                        <button className="flex items-center gap-x-2 text-[12px] font-extrabold text-[#0A7F93] hover:text-[#1A4C8B] transition-colors outline-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            Add Media
                        </button>
                    </div>

                    <textarea
                        value={lessonContent}
                        onChange={(e) => setLessonContent(e.target.value)}
                        placeholder="Type lesson here..."
                        className="flex-1 w-full bg-white border border-[#D1D8DD] rounded-xl p-4 md:p-8 text-[14px] text-[#444] font-medium leading-relaxed resize-none outline-none transition-all focus:border-[#EBB637] focus:ring-4 focus:ring-[#EBB637]/20 shadow-sm whitespace-pre-wrap"
                    />

                    <div className="flex justify-center mt-6 md:mt-10">
                        <button
                            onClick={() => setIsSaveConfirmModalOpen(true)}
                            disabled={!lessonContent.trim()}
                            className={`w-full md:w-auto md:px-32 py-3.5 rounded-xl font-black text-[14px] uppercase tracking-wide transition-all shadow-md outline-none
                                ${lessonContent.trim() ? 'bg-[#0A7F93] text-white hover:bg-[#086a7a] hover:shadow-lg hover:-translate-y-1' : 'bg-[#D1D8DD] text-gray-400 cursor-not-allowed shadow-none'}
                            `}
                        >
                            {isEditingLesson ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>

                {isSaveConfirmModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-[400px] text-center">
                            <h2 className="text-[16px] font-extrabold text-[#222] mb-8">Are you sure you want to {isEditingLesson ? 'update' : 'save'}?</h2>
                            <div className="flex justify-center gap-x-12">
                                <button onClick={executeSaveLesson} className="text-[#ED1F24] font-black text-[15px] hover:opacity-70 transition-opacity outline-none">Yes</button>
                                <button onClick={() => setIsSaveConfirmModalOpen(false)} className="text-[#ED1F24] font-black text-[15px] hover:opacity-70 transition-opacity outline-none">No</button>
                            </div>
                        </div>
                    </div>
                )}

                {isDiscardModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-[400px] text-center">
                            <h2 className="text-[20px] font-extrabold text-[#222] mb-3">Discard Changes?</h2>
                            <p className="text-[14px] text-[#666] font-medium leading-relaxed mb-8">You have unsaved content. If you go back, your changes will be lost.</p>
                            <div className="flex justify-center gap-x-12">
                                <button onClick={confirmDiscard} className="text-[#ED1F24] font-black text-[15px] hover:opacity-70 transition-opacity outline-none">Yes</button>
                                <button onClick={() => setIsDiscardModalOpen(false)} className="text-[#ED1F24] font-black text-[15px] hover:opacity-70 transition-opacity outline-none">No</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ============================================================================
    // VIEW 2: THE LESSON VIEWER ("See More")
    // ============================================================================
    if (currentView === 'viewer' && viewingLesson) {
        return (
            <div className="flex flex-col h-screen bg-[#E2E7E9] font-sans relative overflow-y-auto">
                <div className="p-4 md:p-8 lg:p-12 pb-4 md:pb-6 flex flex-col w-full mx-auto">
                    <button aria-label="Close modal" onClick={() => setCurrentView('feed')} className="flex items-center gap-x-2 group cursor-pointer outline-none w-fit mb-6 md:mb-8">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <div>
                        <span className="text-[12px] font-extrabold text-[#000000] uppercase tracking-wider">Week {viewingLesson.week_number}</span>
                        <h1 className="text-[24px] md:text-[32px] font-black text-[#222] mt-1 leading-none">{viewingLesson.lesson_title}</h1>
                    </div>
                </div>
                <div className="flex-1 flex flex-col w-full mx-auto px-4 md:px-8 lg:px-12 pb-8 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex-1 w-full bg-white border border-[#D1D8DD] rounded-xl p-6 md:p-12 shadow-sm min-h-[50vh]">
                        <p className="text-[14px] md:text-[15px] text-[#444] font-medium leading-loose whitespace-pre-wrap">
                            {viewingLesson.lesson_content}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // VIEW 3: THE MAIN FEED & SIDEBAR (Default)
    // ============================================================================
    return (
        <div className="flex h-screen bg-[#E2E7E9] font-sans overflow-hidden">
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`fixed md:relative z-[50] h-full flex flex-col shrink-0 transition-transform duration-300 ease-in-out bg-[#E9E9E9] border-r border-[#D1D8DD] w-[280px] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-8 pb-4">
                    <Link href="/class-manager" className="flex items-center gap-x-3 group cursor-pointer w-fit outline-none">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        <h1 className="text-[22px] font-black text-[#222] m-0 group-hover:text-[#0A7F93] transition-colors">
                            {sectionName}
                        </h1>
                    </Link>
                </div>

                <div className="flex flex-col gap-y-3 px-6 pt-6">
                    <button onClick={() => handleTabClick('class')} className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border outline-none ${activeTab === 'class' ? 'bg-[#EBB637]/10 border-[#EBB637]/30 text-[#EBB637] shadow-sm' : 'bg-transparent border-transparent text-[#0A7F93] hover:bg-[#D1D8DD]/50'}`}>
                        <Image src={activeTab === 'class' ? classActiveIcon : classInactiveIcon} alt="Class" width={24} height={24} className="object-contain" />
                        <span className="text-[15px] tracking-wide">Class</span>
                    </button>
                    <button onClick={() => handleTabClick('participants')} className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border outline-none ${activeTab === 'participants' ? 'bg-[#EBB637]/10 border-[#EBB637]/30 text-[#EBB637] shadow-sm' : 'bg-transparent border-transparent text-[#0A7F93] hover:bg-[#D1D8DD]/50'}`}>
                        <Image src={activeTab === 'participants' ? participantsActiveIcon : participantsIcon} alt="Participants" width={24} height={24} className="object-contain" />
                        <span className="text-[15px] tracking-wide">Participants</span>
                    </button>
                    <button onClick={() => handleTabClick('notifications')} className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border outline-none ${activeTab === 'notifications' ? 'bg-[#EBB637]/10 border-[#EBB637]/30 text-[#EBB637] shadow-sm' : 'bg-transparent border-transparent text-[#0A7F93] hover:bg-[#D1D8DD]/50'}`}>
                        <Image src={activeTab === 'notifications' ? notificationsActiveIcon : notificationsIcon} alt="Notifications" width={24} height={24} className="object-contain" />
                        <span className="text-[15px] tracking-wide">Notifications</span>
                    </button>
                    <button onClick={() => handleTabClick('dll')} className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border outline-none ${activeTab === 'dll' ? 'bg-[#EBB637]/10 border-[#EBB637]/30 text-[#EBB637] shadow-sm' : 'bg-transparent border-transparent text-[#0A7F93] hover:bg-[#D1D8DD]/50'}`}>
                        <Image src={activeTab === 'dll' ? dllActiveIcon : dllIcon} alt="DLL" width={24} height={24} className="object-contain" />
                        <span className="text-[15px] tracking-wide">DLL</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col overflow-hidden">
                <div className="md:hidden flex items-center justify-between p-4 bg-[#E9E9E9] border-b border-[#D1D8DD] shrink-0">
                    <div className="flex items-center gap-x-4">
                        <button aria-label="Menu" onClick={() => setIsSidebarOpen(true)} className="p-1.5 rounded hover:bg-black/5 transition-colors outline-none">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <Link href="/class-manager" className="flex items-center gap-x-2 outline-none">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            <h1 className="text-[18px] font-black text-[#222] m-0">{sectionName}</h1>
                        </Link>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 w-full">
                    {activeTab === 'class' && (
                        <div className="flex flex-col gap-y-4 md:gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
                            {courseContent.length === 0 ? (
                                // --- EMPTY STATE FOR CLASS TAB ---
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="bg-white/40 border-2 border-dashed border-[#B0B8C1] rounded-3xl p-10 md:p-16 max-w-md">
                                        <h2 className="text-[20px] font-black text-[#222] mb-3 uppercase tracking-tight">No content posted yet.</h2>
                                        <p className="text-[14px] text-[#666] font-medium leading-relaxed">
                                            Tap the <span className="font-bold text-[#1A4C8B]">'Add'</span> button below to write your first lesson or create an assessment.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                courseContent.map((item) => (
                                    item.type === 'lesson' ? (
                                        <LessonCard
                                            key={`lesson-${item.id}`}
                                            week={`Week ${item.week_number}`}
                                            title={item.lesson_title || 'Untitled'}
                                            description={item.preview || ''}
                                            onEdit={() => handleEditLesson(item)}
                                            onSeeMore={() => handleOpenViewer(item)}
                                        />
                                    ) : (
                                        <AssessmentCard
                                            key={`assessment-${item.id}`}
                                            title={item.title || `Assessment ${item.assessment_number}`}
                                            onClick={() => console.log('Open Assessment', item.id)}
                                        />
                                    )
                                ))
                            )}
                        </div>
                    )}

                    {/* PARTICIPANTS TAB CONTENT */}
                    {activeTab === 'participants' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-[18px] font-black text-[#222] mb-6 uppercase tracking-wider">Participants</h2>
                            <div className="text-[#888] font-bold mt-10">
                                No participants joined yet.
                            </div>

                        </div>
                    )}

                    {/* NOTIFICATIONS TAB CONTENT */}
                    {activeTab === 'notifications' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-[18px] font-black text-[#222] mb-6 uppercase tracking-wider">Notifications</h2>
                           <div className="text-[#888] font-bold mt-10">
                                You have no new notifications.
                            </div>
                        </div>
                    )}

                    {/* DLL TAB CONTENT */}
                    {activeTab === 'dll' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-[18px] font-black text-[#222] mb-6 uppercase tracking-wider">Daily Lesson Log</h2>
                            <div className="text-[#888] font-bold mt-10">
                                You have no new notifications.
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-50">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#1A4C8B] text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full font-black text-[14px] uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-[#153a6b] transition-all flex items-center gap-x-2 outline-none focus:ring-4 focus:ring-[#1A4C8B]/30"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add
                    </button>
                </div>

                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-[#F4F6F8] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-[420px] relative animate-in zoom-in-95 duration-200">
                            {addStep === 'select' ? (
                                <>
                                    <button aria-label="Close modal" onClick={closeAddModal} className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors outline-none">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                    <h2 className="text-[20px] font-extrabold text-[#222] mb-6 text-center">Add Content</h2>
                                    <div className="flex flex-col gap-y-3 mb-8">
                                        <label className={`flex items-center gap-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${selectedAddOption === 'lesson' ? 'border-[#1A4C8B]' : 'border-[#D1D8DD]'}`} onClick={() => setSelectedAddOption('lesson')}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddOption === 'lesson' ? 'border-[#1A4C8B]' : 'border-[#B0B8C1]'}`}>
                                                {selectedAddOption === 'lesson' && <div className="w-2.5 h-2.5 rounded-full bg-[#1A4C8B]" />}
                                            </div>
                                            <span className="font-bold text-[#222]">Write a Lesson</span>
                                        </label>
                                        <label className={`flex items-center gap-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${selectedAddOption === 'assessment' ? 'border-[#1A4C8B]' : 'border-[#D1D8DD]'}`} onClick={() => setSelectedAddOption('assessment')}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddOption === 'assessment' ? 'border-[#1A4C8B]' : 'border-[#B0B8C1]'}`}>
                                                {selectedAddOption === 'assessment' && <div className="w-2.5 h-2.5 rounded-full bg-[#1A4C8B]" />}
                                            </div>
                                            <span className="font-bold text-[#222]">Create Assessment</span>
                                        </label>
                                    </div>
                                    <button onClick={handleProceedToDetails} disabled={!selectedAddOption} className={`w-full py-3.5 text-[13px] font-black rounded uppercase ${selectedAddOption ? 'bg-[#1A4C8B] text-white shadow-md' : 'bg-[#E9E9E9] text-[#A0A0A0] cursor-not-allowed'}`}>Proceed</button>
                                </>
                            ) : (
                                <div className="animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <button aria-label='l' onClick={() => setAddStep('select')} className="p-1 -ml-1 text-gray-600 hover:text-gray-900 outline-none"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                                        <h2 className="text-[18px] font-extrabold text-[#222] flex-1 text-center pr-6">{isEditingLesson ? 'Edit Details' : 'Write a Lesson'}</h2>
                                    </div>
                                    <div className="flex flex-col gap-y-1 mb-8">
                                        <Gr8TextField label="Week Number" value={weekNumber} onChange={setWeekNumber} hasError={hasDetailsError && !weekNumber} />
                                        <Gr8TextField label="Lesson Title" value={lessonTitle} onChange={setLessonTitle} hasError={hasDetailsError && !lessonTitle} />
                                    </div>
                                    <button onClick={handleNextDetails} className="w-full py-3.5 text-[13px] font-black rounded uppercase bg-[#1A4C8B] text-white shadow-md">Next</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showToast && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out w-[90%] md:w-auto text-center">
                        <div className="bg-[#0A7F93] text-white px-6 md:px-10 py-3 rounded shadow-xl inline-flex items-center justify-center min-w-[200px]">
                            <span className="text-[14px] font-normal tracking-wide uppercase">{toastMessage}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}