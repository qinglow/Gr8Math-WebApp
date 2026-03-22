'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- COMPONENTS ---
import { LessonCard } from '@/components/card/LessonCard';
import { AssessmentCard } from '@/components/card/AssessmentCard';
import { ParticipantAssessmentCard } from '@/components/card/ParticipantAssessmentCard';
import { Gr8RankPill } from '@/components/card/Gr8RankPill'; 
import { Gr8TextField } from '@/components/ui/Gr8TextField';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader'; 
import { Gr8RichTextEditor } from '@/components/ui/Gr8RichTextEditor'; 
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay'; 
import { Gr8DateTimePicker } from '@/components/ui/Gr8DateTimePicker'; 
import { Gr8AssessmentEditor, QuestionData } from '@/components/ui/Gr8AssessmentEditor';

// --- SIDEBAR IMAGES ---
import classActiveIcon from './photos/class-active.png';
import classInactiveIcon from './photos/class.png';
import participantsActiveIcon from './photos/participants-active.png';
import participantsIcon from './photos/participants.png';
import dllActiveIcon from './photos/dll-active.png';
import dllIcon from './photos/dll.png';

// --- NEW PARTICIPANTS TAB IMAGES ---
import goldTrophy from './photos/gold-trophy.png';
import silverTrophy from './photos/silver-trophy.png';
import bronzeTrophy from './photos/bronze-trophy.png';
import blueBanner from './photos/blue-banner.png';
import redBanner from './photos/red-banner.png';
import yellowRect from './photos/horizontal-yellow-rectangle.png';
import assessmentIcon from './photos/assessment.png';

// --- TYPE DEFINITIONS ---
type ClassContentItem = {
    id: number;
    type: 'lesson' | 'assessment';
    week_number?: number;
    lesson_title?: string;
    lesson_content?: string;
    preview?: string;
    assessment_number?: number;
    title?: string; 
    created_at?: string;
};

interface ClassPageClientProps {
    initialFeed: ClassContentItem[];
    sectionName: string;
    courseId: string;
}

// --- MOCK DATA FOR PARTICIPANTS & REPORTS ---
const MOCK_PARTICIPANTS = [
    { id: '1', name: 'Dela Cruz, Juan', rank: 1 },
    { id: '2', name: 'Dela Cruz, Juan', rank: 2 },
    { id: '3', name: 'Dela Cruz, Juan', rank: 3 },
    { id: '4', name: 'Dela Cruz, Juan', rank: 4 },
    { id: '5', name: 'Dela Cruz, Juan', rank: 5 },
    { id: '6', name: 'Dela Cruz, Juan', rank: 6 },
    { id: '7', name: 'Dela Cruz, Juan', rank: 7 },
    { id: '8', name: 'Dela Cruz, Juan', rank: 8 },
    { id: '9', name: 'Dela Cruz, Juan', rank: 9 },
    { id: '10', name: 'Dela Cruz, Juan', rank: 10 },
];

const MOCK_REPORT_DATA = [
    { no: 1, score: 10, items: 10, percentage: '100%', title: 'Polynomial' },
    { no: 2, score: 10, items: 10, percentage: '100%', title: 'Algebra' },
];
const TOTAL_SCORE = MOCK_REPORT_DATA.reduce((acc, curr) => acc + curr.score, 0);
const TOTAL_ITEMS = MOCK_REPORT_DATA.reduce((acc, curr) => acc + curr.items, 0);

export default function ClassPageClient({ initialFeed, sectionName, courseId }: ClassPageClientProps) {
    // --- HIGH-LEVEL VIEW STATE ---
    const [currentView, setCurrentView] = useState<'feed' | 'editor' | 'viewer' | 'assessment-editor'>('feed');
    const [viewingLesson, setViewingLesson] = useState<ClassContentItem | null>(null);

    // --- MOBILE RESPONSIVE STATE ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- FEED & SIDEBAR STATES ---
    // FIX: Set initial state to 'class' instead of 'participants'
    const [activeTab, setActiveTab] = useState('class'); 
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // --- MODAL & FLOW STATES ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAddOption, setSelectedAddOption] = useState<string | null>(null);
    const [addStep, setAddStep] = useState<'select' | 'details'>('select');

    // --- PARTICIPANT FLOW STATES ---
    const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
    const [selectedAssessmentResult, setSelectedAssessmentResult] = useState<any | null>(null);
    const [showQuarterlyReport, setShowQuarterlyReport] = useState(false); 

    // --- LESSON DETAILS STATES ---
    const [weekNumber, setWeekNumber] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [hasDetailsError, setHasDetailsError] = useState(false);
    
    // --- ASSESSMENT DETAILS STATES ---
    const [quarterNumber, setQuarterNumber] = useState('');
    const [assessmentNumber, setAssessmentNumber] = useState('');
    const [assessmentTitle, setAssessmentTitle] = useState('');
    const [availableFrom, setAvailableFrom] = useState('');
    const [availableUntil, setAvailableUntil] = useState('');
    const [hasAssessmentDetailsError, setHasAssessmentDetailsError] = useState(false);
    const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);

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
    }, [initialFeed, courseId]);

    // --- DYNAMIC HEADER TITLE LOGIC ---
    let displayTitle = sectionName;
    if (activeTab === 'participants') {
        displayTitle = selectedParticipant ? 'Scores' : 'Participants';
    } else if (activeTab === 'dll') {
        displayTitle = 'Daily Lesson Log';
    }

    const handleBackClick = () => {
        if (activeTab === 'participants' && selectedParticipant) {
            setSelectedParticipant(null);
            setShowQuarterlyReport(false); 
        } else {
            window.location.href = '/class-manager';
        }
    };

    // --- ADD / EDIT FLOW HANDLERS ---
    const handleEditLesson = (lesson: ClassContentItem) => {
        setIsEditingLesson(true);
        setEditingLessonId(lesson.id);
        setWeekNumber(lesson.week_number?.toString() || '');
        setLessonTitle(lesson.title || lesson.lesson_title || '');

        setIsAddModalOpen(true);
        setAddStep('details');
        setSelectedAddOption('lesson');
    };

    const handleProceedToDetails = () => {
        if (!selectedAddOption) return;
        setAddStep('details');
    };

    const handleLessonNextDetails = () => {
        if (!weekNumber.trim() || !lessonTitle.trim()) {
            setHasDetailsError(true);
            return;
        }
        setHasDetailsError(false);

        setTimeout(() => {
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
        }, 300);
    };

    const handleAssessmentNextDetails = () => {
        if (!quarterNumber.trim() || !assessmentNumber.trim() || !assessmentTitle.trim() || !availableFrom || !availableUntil) {
            setHasAssessmentDetailsError(true);
            return;
        }
        setHasAssessmentDetailsError(false);
        setIsAssessmentLoading(true);

        setTimeout(() => {
            setIsAssessmentLoading(false);
            setIsAddModalOpen(false);
            setAddStep('select');
            setSelectedAddOption(null);
            setCurrentView('assessment-editor');
            
            setQuarterNumber('');
            setAssessmentNumber('');
            setAssessmentTitle('');
            setAvailableFrom('');
            setAvailableUntil('');
        }, 1500);
    };

    const isAssessmentFormComplete = quarterNumber.trim() !== '' && assessmentNumber.trim() !== '' && assessmentTitle.trim() !== '' && availableFrom !== '' && availableUntil !== '';

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setTimeout(() => {
            setSelectedAddOption(null);
            setAddStep('select');
            setWeekNumber('');
            setLessonTitle('');
            setHasDetailsError(false);
            setQuarterNumber('');
            setAssessmentNumber('');
            setAssessmentTitle('');
            setAvailableFrom('');
            setAvailableUntil('');
            setHasAssessmentDetailsError(false);
            setIsEditingLesson(false);
            setEditingLessonId(null);
        }, 200);
    };

    const handleBackFromEditor = () => {
        const plainText = lessonContent.replace(/<[^>]*>/g, '').trim();
        if (plainText.length > 0) setIsDiscardModalOpen(true);
        else resetToFeed();
    };

    const confirmDiscard = () => {
        setIsDiscardModalOpen(false);
        resetToFeed();
    };

    const executeSaveLesson = () => {
        setIsSaveConfirmModalOpen(false);
        setIsSavingLesson(true);

        setTimeout(() => {
            const cleanPreview = lessonContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 100) + '...';

            if (isEditingLesson && editingLessonId) {
                setCourseContent(prev => prev.map(lesson =>
                    lesson.id === editingLessonId ? { ...lesson, week_number: parseInt(weekNumber), lesson_title: lessonTitle, lesson_content: lessonContent, preview: cleanPreview } : lesson
                ));
                setToastMessage('Lesson updated!');
            } else {
                const newLesson: ClassContentItem = { type: 'lesson', id: Date.now(), week_number: parseInt(weekNumber), lesson_title: lessonTitle, lesson_content: lessonContent, preview: cleanPreview };
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
        setSelectedParticipant(null);
        setShowQuarterlyReport(false); 
    };

    // ============================================================================
    // VIEW 1: THE FULL SCREEN EDITOR (RICH TEXT)
    // ============================================================================
    if (currentView === 'editor') {
        return (
            <div key="editor-view" className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader />
                <Gr8LoadingOverlay isLoading={isSavingLesson} message="Processing..." />

                <Gr8RichTextEditor 
                    initialContent={lessonContent}
                    onChange={setLessonContent}
                    onSave={() => setIsSaveConfirmModalOpen(true)}
                    onBack={handleBackFromEditor}
                    isEditing={isEditingLesson}
                />

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
    // VIEW 2: THE LESSON VIEWER ("See More" with RICH TEXT support)
    // ============================================================================
    if (currentView === 'viewer' && viewingLesson) {
        return (
            <div key="viewer-view" className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative overflow-y-auto">
                <Gr8MathHeader />

                <div className="p-4 md:p-8 lg:p-12 pb-4 md:pb-6 flex flex-col w-full max-w-6xl mx-auto">
                    <button aria-label="Close modal" onClick={() => setCurrentView('feed')} className="flex items-center gap-x-2 group cursor-pointer outline-none w-fit mb-6 md:mb-8">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <div>
                        <span className="text-[12px] font-extrabold text-[#000000] uppercase tracking-wider">Week {viewingLesson.week_number}</span>
                        <h1 className="text-[24px] md:text-[32px] font-black text-[#222] mt-1 leading-none">{viewingLesson.title || viewingLesson.lesson_title}</h1>
                    </div>
                </div>
                <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-8 lg:px-12 pb-8 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex-1 w-full bg-white border border-[#D1D8DD] rounded-xl p-6 md:p-12 shadow-sm min-h-[50vh]">
                        <div 
                            className="text-[14px] md:text-[16px] text-black font-medium leading-loose whitespace-pre-wrap outline-none
                                [&_p]:mb-4 [&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-[#222] [&_h1]:mb-4
                                [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:text-[#222] [&_h2]:mb-3 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-[#222] [&_h3]:mb-3
                                [&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-[#222] [&_h4]:mb-2 [&_h5]:text-lg [&_h5]:font-bold [&_h5]:text-[#222] [&_h5]:mb-2
                                [&_ul]:list-disc [&_ul]:ml-8 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-8 [&_ol]:mb-4
                                [&_li]:pl-2 [&_li]:mb-1 [&_b]:font-bold [&_i]:italic [&_u]:underline [&_strike]:line-through
                            "
                            dangerouslySetInnerHTML={{ __html: viewingLesson.lesson_content || '' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // VIEW 3: ASSESSMENT EDITOR
    // ============================================================================
    if (currentView === 'assessment-editor') {
        return (
            <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader />
                <div className="flex-1 w-full overflow-y-auto pb-12 animate-in fade-in duration-500">
                     <Gr8AssessmentEditor 
                        onBack={() => setCurrentView('feed')}
                        onPublish={(questions) => {
                            console.log("Published Questions:", questions);
                            setToastMessage('Assessment Published!');
                            setCurrentView('feed');
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 3000);
                        }}
                     />
                </div>
            </div>
        );
    }

    // ============================================================================
    // VIEW 4: THE MAIN FEED & SIDEBAR (Default)
    // ============================================================================
    return (
        <div key="feed-view" className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans">
            
            <div className="fixed md:relative top-0 left-0 w-full z-[100] md:z-0 shrink-0">
                <Gr8MathHeader />
            </div>

            <div className="flex flex-1 relative pt-[100px] md:pt-0">
                
                {isSidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
                )}

                <div className={`fixed top-0 left-0 md:sticky md:top-0 z-[50] h-screen flex flex-col shrink-0 transition-transform duration-300 ease-in-out bg-[#E9E9E9] border-r border-[#D1D8DD] w-[280px] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className="p-8 pb-4">
                        <button onClick={handleBackClick} className="flex items-center gap-x-3 group cursor-pointer w-fit outline-none">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                            <h1 className="text-[22px] font-black text-[#222] m-0 group-hover:text-[#0A7F93] transition-colors">{displayTitle}</h1>
                        </button>
                    </div>

                    <div className="flex flex-col gap-y-3 px-6 pt-6 flex-1">
                        <button onClick={() => handleTabClick('class')} className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border outline-none ${activeTab === 'class' ? 'bg-[#EFBD31]/10 border-[#EFBD31]/30 text-[#EFBD31] shadow-sm' : 'bg-transparent border-transparent text-[#0F8B8D] hover:bg-[#D1D8DD]/50'}`}>
                            <Image src={activeTab === 'class' ? classActiveIcon : classInactiveIcon} alt="Class" width={24} height={24} className="object-contain" />
                            <span className="text-[15px] tracking-wide">Class</span>
                        </button>
                        <button onClick={() => handleTabClick('participants')} className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border outline-none ${activeTab === 'participants' ? 'bg-[#EFBD31]/10 border-[#EFBD31]/30 text-[#EFBD31] shadow-sm' : 'bg-transparent border-transparent text-[#0F8B8D] hover:bg-[#D1D8DD]/50'}`}>
                            <Image src={activeTab === 'participants' ? participantsActiveIcon : participantsIcon} alt="Participants" width={24} height={24} className="object-contain" />
                            <span className="text-[15px] tracking-wide">Participants</span>
                        </button>
                        <button onClick={() => handleTabClick('dll')} className={`flex items-center gap-x-4 px-5 py-3.5 rounded-xl font-bold transition-all border outline-none ${activeTab === 'dll' ? 'bg-[#EFBD31]/10 border-[#EFBD31]/30 text-[#EFBD31] shadow-sm' : 'bg-transparent border-transparent text-[#0F8B8D] hover:bg-[#D1D8DD]/50'}`}>
                            <Image src={activeTab === 'dll' ? dllActiveIcon : dllIcon} alt="DLL" width={24} height={24} className="object-contain" />
                            <span className="text-[15px] tracking-wide">DLL</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative flex flex-col w-full bg-[#E2E7E9]">
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
                                <h1 className="text-[18px] font-black text-[#222] m-0">{displayTitle}</h1>
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto h-full">
                        
                        {/* ======================= */}
                        {/* TAB: CLASS              */}
                        {/* ======================= */}
                        {activeTab === 'class' && (
                            <div className="flex flex-col gap-y-4 md:gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
                                {courseContent.length === 0 ? (
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
                                            <LessonCard key={`lesson-${item.id}`} week={`Week ${item.week_number}`} title={item.lesson_title || 'Untitled'} description={item.preview || ''} onEdit={() => handleEditLesson(item)} onSeeMore={() => handleOpenViewer(item)} />
                                        ) : (
                                            <AssessmentCard key={`assessment-${item.id}`} title={item.title || `Assessment ${item.assessment_number}`} onClick={() => console.log('Open Assessment', item.id)} />
                                        )
                                    ))
                                )}
                            </div>
                        )}

                        {/* ======================= */}
                        {/* TAB: PARTICIPANTS       */}
                        {/* ======================= */}
                        {activeTab === 'participants' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                
                                {!selectedParticipant ? (
                                    
                                    /* --------------------------- */
                                    /* STATE A: LEADERBOARD VIEW   */
                                    /* --------------------------- */
                                    <div className="bg-[#F8F5EF] rounded-2xl pb-8 border border-[#D1D8DD] shadow-sm flex-1 flex flex-col overflow-hidden relative">
                                        {/* Decorative Background Blocks */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                                            <div className="absolute top-10 left-10 opacity-[0.15] hidden md:block">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex gap-1"><div className="w-8 h-8 bg-[#EFBD31]"></div><div className="w-8 h-8 bg-transparent"></div></div>
                                                    <div className="flex gap-1"><div className="w-8 h-8 bg-[#1A4C8B]"></div><div className="w-8 h-8 bg-[#1A4C8B]"></div></div>
                                                </div>
                                            </div>
                                            <div className="absolute top-[45%] -left-6 opacity-[0.2] hidden lg:block">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex gap-1 ml-9"><div className="w-8 h-8 bg-[#0A7F93]"></div></div>
                                                    <div className="flex gap-1"><div className="w-8 h-8 bg-[#ED1F24]"></div><div className="w-8 h-8 bg-[#0A7F93]"></div><div className="w-8 h-8 bg-[#EFBD31]"></div></div>
                                                    <div className="flex gap-1 ml-9"><div className="w-8 h-8 bg-[#1A4C8B]"></div><div className="w-8 h-8 bg-[#1A4C8B]"></div></div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-20 left-16 opacity-[0.15] hidden xl:block">
                                                <div className="flex flex-col gap-1">
                                                     <div className="flex gap-1"><div className="w-6 h-6 bg-[#ED1F24]"></div><div className="w-6 h-6 bg-[#EFBD31]"></div></div>
                                                    <div className="flex gap-1 ml-6"><div className="w-6 h-6 bg-[#0A7F93]"></div></div>
                                                </div>
                                            </div>
                                            <div className="absolute top-24 right-12 opacity-[0.15] hidden lg:block">
                                                <div className="flex flex-col gap-1 items-end">
                                                    <div className="flex gap-1"><div className="w-8 h-8 bg-[#1A4C8B]"></div><div className="w-8 h-8 bg-[#0A7F93]"></div></div>
                                                    <div className="flex gap-1 mr-9"><div className="w-8 h-8 bg-[#ED1F24]"></div></div>
                                                </div>
                                            </div>
                                            <div className="absolute top-[55%] -right-4 opacity-[0.2] hidden md:block">
                                                <div className="flex flex-col gap-1 items-end">
                                                    <div className="flex gap-1 mr-9"><div className="w-8 h-8 bg-[#EFBD31]"></div></div>
                                                    <div className="flex gap-1"><div className="w-8 h-8 bg-[#1A4C8B]"></div><div className="w-8 h-8 bg-[#0A7F93]"></div><div className="w-8 h-8 bg-[#EFBD31]"></div></div>
                                                    <div className="flex gap-1 mr-9"><div className="w-8 h-8 bg-[#ED1F24]"></div><div className="w-8 h-8 bg-[#ED1F24]"></div></div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-32 right-20 opacity-[0.15] hidden xl:block">
                                                <div className="flex gap-1"><div className="w-10 h-10 bg-[#1A4C8B]"></div><div className="w-10 h-10 bg-[#EFBD31]"></div></div>
                                            </div>
                                        </div>

                                        {/* Layered Top 3 Container */}
                                        <div className="relative flex justify-center items-end mt-12 mb-12 px-2 md:px-4 min-h-[250px] z-10">
                                            {/* Background Layers (Yellow Bar + Red/Blue Banners) */}
                                            <div className="absolute inset-x-0 top-0 flex flex-col items-center pointer-events-none z-0 w-full h-full">
                                                <div className="w-[95%] max-w-[650px] relative">
                                                    <Image src={yellowRect} alt="Yellow bar" className="w-full h-auto object-contain z-10 relative" quality={100} />
                                                </div>
                                                <div className="flex w-[90%] max-w-[600px] justify-center -mt-2 z-0 relative h-full">
                                                    <div className="w-1/2 relative h-[200px]">
                                                        <Image src={blueBanner} alt="Blue Banner" fill className="object-contain object-top" quality={100} />
                                                    </div>
                                                    <div className="w-1/2 relative h-[200px]">
                                                        <Image src={redBanner} alt="Red Banner" fill className="object-contain object-top" quality={100} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FIX: Properly spaced columns to completely prevent pills from colliding */}
                                            <div className="flex justify-between items-end z-10 w-full relative pt-10 max-w-[850px] mx-auto px-1 sm:px-4">
                                                
                                                {/* Rank 2 (Silver) */}
                                                <div className="flex flex-col items-center pb-4 w-[32%] z-20">
                                                    <Image src={silverTrophy} alt="2nd Place" className="w-20 md:w-36 h-auto object-contain drop-shadow-md" quality={100} />
                                                    <div className="mt-2 md:mt-4 w-full px-0.5 sm:px-2 flex justify-center">
                                                        <Gr8RankPill rank={2} name={MOCK_PARTICIPANTS[1].name} onClick={() => setSelectedParticipant(MOCK_PARTICIPANTS[1])} className="w-full max-w-[180px]" />
                                                    </div>
                                                </div>

                                                {/* Rank 1 (Gold) */}
                                                <div className="flex flex-col items-center z-30 pb-12 w-[36%]">
                                                    <Image src={goldTrophy} alt="1st Place" className="w-24 md:w-48 h-auto object-contain drop-shadow-xl" quality={100} />
                                                    <div className="mt-2 md:mt-4 w-full px-0.5 sm:px-2 flex justify-center">
                                                        <Gr8RankPill rank={1} name={MOCK_PARTICIPANTS[0].name} onClick={() => setSelectedParticipant(MOCK_PARTICIPANTS[0])} className="w-full max-w-[220px] shadow-md transform md:scale-105" />
                                                    </div>
                                                </div>

                                                {/* Rank 3 (Bronze) */}
                                                <div className="flex flex-col items-center pb-2 w-[32%] z-20">
                                                    <Image src={bronzeTrophy} alt="3rd Place" className="w-16 md:w-32 h-auto object-contain drop-shadow-md" quality={100} />
                                                    <div className="mt-2 md:mt-4 w-full px-0.5 sm:px-2 flex justify-center">
                                                        <Gr8RankPill rank={3} name={MOCK_PARTICIPANTS[2].name} onClick={() => setSelectedParticipant(MOCK_PARTICIPANTS[2])} className="w-full max-w-[180px]" />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Rest of Ranks (4-10) using 2-Column Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6 px-4 md:px-12 pb-12 overflow-y-auto max-w-5xl mx-auto w-full mt-8 relative z-10">
                                            {MOCK_PARTICIPANTS.slice(3).map((p) => (
                                                <Gr8RankPill key={p.id} rank={p.rank} name={p.name} onClick={() => setSelectedParticipant(p)} className="w-full max-w-[400px]" />
                                            ))}
                                        </div>
                                    </div>

                                ) : !showQuarterlyReport ? (
                                    
                                    /* --------------------------- */
                                    /* STATE B: INDIVIDUAL SCORES  */
                                    /* --------------------------- */
                                    <div className="bg-[#F8F5EF] rounded-2xl p-6 md:p-10 border border-[#D1D8DD] shadow-sm flex-1 flex flex-col relative animate-in slide-in-from-right-8 duration-300">
                                        
                                        {/* Clear Back Button */}
                                        <button onClick={() => setSelectedParticipant(null)} className="flex items-center gap-x-2 text-[#0A7F93] font-bold text-[14px] hover:text-[#1A4C8B] transition-colors mb-6 outline-none w-fit">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                            Back to Rankings
                                        </button>

                                        {/* UPGRADED: Premium Student Profile Header */}
                                        <div className="bg-white border border-[#D1D8DD] rounded-xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1A4C8B] to-[#0A7F93] text-white rounded-full flex items-center justify-center text-[24px] md:text-[32px] font-black shadow-inner shrink-0">
                                                {selectedParticipant.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h1 className="text-[24px] md:text-[32px] font-black text-[#222] leading-tight">
                                                    {selectedParticipant.name}
                                                </h1>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className="bg-[#EFBD31] text-[#222] text-[12px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
                                                        Rank: {selectedParticipant.rank}{selectedParticipant.rank === 1 ? 'st' : selectedParticipant.rank === 2 ? 'nd' : selectedParticipant.rank === 3 ? 'rd' : 'th'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-y-4">
                                            {/* UPGRADED: Rich Assessment Cards using reusable component */}
                                            {MOCK_REPORT_DATA.map((report) => (
                                                <ParticipantAssessmentCard 
                                                    key={report.no}
                                                    assessmentNumber={report.no}
                                                    title={report.title}
                                                    score={report.score}
                                                    totalItems={report.items}
                                                    onClick={() => setSelectedAssessmentResult({ num: report.no, title: report.title })}
                                                />
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-12 flex justify-end">
                                            <button 
                                                onClick={() => setShowQuarterlyReport(true)}
                                                className="bg-[#1A4C8B] text-white px-6 md:px-8 py-3 rounded-lg font-bold text-[13px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 outline-none"
                                            >
                                                Quarterly Completion Report
                                            </button>
                                        </div>

                                        {/* Assessment Result Modal overlay */}
                                        {selectedAssessmentResult && (
                                            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 rounded-2xl animate-in fade-in duration-200">
                                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                                    <div className="bg-[#1A4C8B] flex justify-between items-center px-6 py-4">
                                                        <h3 className="text-white font-extrabold text-[16px]">Assessment Test Result</h3>
                                                        <button onClick={() => setSelectedAssessmentResult(null)} className="text-white hover:text-gray-300 transition-colors outline-none">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                    <div className="p-6 flex flex-col gap-y-4">
                                                        <div className="flex justify-between border-b border-[#D1D8DD] pb-2">
                                                            <span className="text-[#222] font-bold text-[13px]">Assessment Test Number:</span>
                                                            <span className="text-[#222] font-extrabold text-[13px]">{selectedAssessmentResult.num}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-[#D1D8DD] pb-2">
                                                            <span className="text-[#222] font-bold text-[13px]">Assessment Test Title:</span>
                                                            <span className="text-[#222] font-medium text-[13px]">{selectedAssessmentResult.title}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-[#D1D8DD] pb-2 mt-4">
                                                            <span className="text-[#222] font-bold text-[13px]">Student's Assessment Test Score:</span>
                                                            <span className="text-[#222] font-extrabold text-[13px]">10</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-[#D1D8DD] pb-2">
                                                            <span className="text-[#222] font-bold text-[13px]">Number of Items:</span>
                                                            <span className="text-[#222] font-extrabold text-[13px]">10</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-[#D1D8DD] pb-2">
                                                            <span className="text-[#222] font-bold text-[13px]">Percentage of Score:</span>
                                                            <span className="text-[#222] font-extrabold text-[13px]">100%</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-[#D1D8DD] pb-2 mt-4">
                                                            <span className="text-[#222] font-bold text-[13px]">Date Accomplished:</span>
                                                            <span className="text-[#222] font-extrabold text-[13px]">Jan. 1, 2026</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-[#D1D8DD] pb-2">
                                                            <span className="text-[#222] font-bold text-[13px]">Time Accomplished:</span>
                                                            <span className="text-[#222] font-extrabold text-[13px]">11:00 AM</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                ) : (
                                    
                                    /* --------------------------- */
                                    /* STATE C: QUARTERLY REPORT   */
                                    /* --------------------------- */
                                    <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-300">
                                        
                                        <div className="bg-[#1A4C8B] text-white rounded-t-2xl p-5 md:px-8 flex items-center gap-x-3 shadow-sm z-10">
                                            <button onClick={() => setShowQuarterlyReport(false)} className="p-1 hover:bg-white/10 rounded transition-colors outline-none cursor-pointer">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                            </button>
                                            <h2 className="text-[18px] md:text-[20px] font-bold tracking-wide">Quarterly Completion Report</h2>
                                        </div>

                                        <div className="p-6 md:p-10 bg-[#F8F5EF] rounded-b-2xl border-x border-b border-[#D1D8DD] shadow-sm flex-1 flex flex-col">
                                            
                                            <h3 className="text-[20px] md:text-[24px] font-black text-[#222] mb-8 w-fit">
                                                Quarter 1
                                            </h3>

                                            <div className="overflow-x-auto rounded-xl border border-[#1A4C8B] shadow-sm bg-white">
                                                <table className="w-full text-center border-collapse min-w-[600px]">
                                                    <thead>
                                                        <tr className="bg-[#1A4C8B] text-white text-[13px] font-medium tracking-wide">
                                                            <th className="p-4 md:p-5 border-r border-[#153a6b]/50">Assessment Test No.</th>
                                                            <th className="p-4 md:p-5 border-r border-[#153a6b]/50">Assessment Test Score</th>
                                                            <th className="p-4 md:p-5 border-r border-[#153a6b]/50">Percentage of Score</th>
                                                            <th className="p-4 md:p-5">No. of Items</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {MOCK_REPORT_DATA.map((row, i) => (
                                                            <tr key={i} className="even:bg-[#F4F6F8] hover:bg-[#E2E7E9]/50 transition-colors border-b border-[#D1D8DD] group">
                                                                <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px] border-r border-[#D1D8DD] group-hover:border-[#C0C8CF] transition-colors">{row.no}</td>
                                                                <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px] border-r border-[#D1D8DD] group-hover:border-[#C0C8CF] transition-colors">{row.score}</td>
                                                                <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px] border-r border-[#D1D8DD] group-hover:border-[#C0C8CF] transition-colors">{row.percentage}</td>
                                                                <td className="p-4 md:p-5 text-[#222] font-extrabold text-[14px]">{row.items}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-[#1A4C8B] text-white text-[14px] font-bold">
                                                            <td className="p-4 md:p-5 border-r border-[#153a6b]/50 text-left pl-6 md:pl-10 tracking-wide">Total Score</td>
                                                            <td className="p-4 md:p-5 border-r border-[#153a6b]/50">{TOTAL_SCORE}</td>
                                                            <td className="p-4 md:p-5 border-r border-[#153a6b]/50 text-right pr-6 md:pr-10 tracking-wide">Total No. of Items</td>
                                                            <td className="p-4 md:p-5">{TOTAL_ITEMS}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            <div className="mt-10 flex justify-end">
                                                <button className="bg-[#1A4C8B] text-white px-8 md:px-10 py-3 rounded-lg font-bold text-[13px] hover:bg-[#153a6b] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 outline-none tracking-wide">
                                                    Generate a copy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ======================= */}
                        {/* TAB: DLL                */}
                        {/* ======================= */}
                        {activeTab === 'dll' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-[18px] font-black text-[#222] mb-6 uppercase tracking-wider">Daily Lesson Log</h2>
                                <div className="text-[#888] font-bold mt-10">You have no new DLL records.</div>
                            </div>
                        )}
                    </div>

                    {/* ONLY SHOW FLOATING ADD BUTTON IF ON CLASS TAB */}
                    {activeTab === 'class' && (
                        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50">
                            <button onClick={() => setIsAddModalOpen(true)} className="bg-[#1A4C8B] text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full font-black text-[14px] uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-[#153a6b] transition-all flex items-center gap-x-2 outline-none focus:ring-4 focus:ring-[#1A4C8B]/30">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add
                            </button>
                        </div>
                    )}

                    {/* --- THE ADD CONTENT MODAL --- */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[420px] relative animate-in zoom-in-95 duration-200 flex flex-col">
                                
                                <Gr8LoadingOverlay isLoading={isAssessmentLoading} message="Loading..." />

                                {addStep === 'select' && (
                                    <>
                                        <button aria-label="Close modal" onClick={closeAddModal} className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors outline-none cursor-pointer">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                        <h2 className="text-[20px] font-extrabold text-[#222] mb-6 text-center">Add Content</h2>
                                        
                                        <div className="flex flex-col gap-y-3 mb-8">
                                            <label className={`flex items-center gap-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white hover:border-[#1A4C8B] ${selectedAddOption === 'lesson' ? 'border-[#1A4C8B]' : 'border-[#D1D8DD]'}`} onClick={() => setSelectedAddOption('lesson')}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddOption === 'lesson' ? 'border-[#1A4C8B]' : 'border-[#B0B8C1]'}`}>
                                                    {selectedAddOption === 'lesson' && <div className="w-2.5 h-2.5 rounded-full bg-[#1A4C8B]" />}
                                                </div>
                                                <span className="font-bold text-[#222]">Write a Lesson</span>
                                            </label>
                                            <label className={`flex items-center gap-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white hover:border-[#1A4C8B] ${selectedAddOption === 'assessment' ? 'border-[#1A4C8B]' : 'border-[#D1D8DD]'}`} onClick={() => setSelectedAddOption('assessment')}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddOption === 'assessment' ? 'border-[#1A4C8B]' : 'border-[#B0B8C1]'}`}>
                                                    {selectedAddOption === 'assessment' && <div className="w-2.5 h-2.5 rounded-full bg-[#1A4C8B]" />}
                                                </div>
                                                <span className="font-bold text-[#222]">Create Assessment Test</span>
                                            </label>
                                            <label className={`flex items-center gap-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white hover:border-[#1A4C8B] ${selectedAddOption === 'dll' ? 'border-[#1A4C8B]' : 'border-[#D1D8DD]'}`} onClick={() => setSelectedAddOption('dll')}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddOption === 'dll' ? 'border-[#1A4C8B]' : 'border-[#B0B8C1]'}`}>
                                                    {selectedAddOption === 'dll' && <div className="w-2.5 h-2.5 rounded-full bg-[#1A4C8B]" />}
                                                </div>
                                                <span className="font-bold text-[#222]">Daily Lesson Log</span>
                                            </label>
                                        </div>
                                        <button onClick={handleProceedToDetails} disabled={!selectedAddOption} className={`w-full py-3.5 text-[13px] font-black rounded-lg uppercase tracking-wide transition-all outline-none flex items-center justify-center gap-x-2 ${selectedAddOption ? 'bg-[#1A4C8B] text-white shadow-md hover:bg-[#153a6b]' : 'bg-[#E9E9E9] text-[#A0A0A0] cursor-not-allowed'}`}>Proceed</button>
                                    </>
                                )}
                                
                                {/* ASSESSMENT DETAILS FORM */}
                                {addStep === 'details' && selectedAddOption === 'assessment' && (
                                    <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col">
                                        <div className="flex items-center justify-center mb-1 relative">
                                            <button onClick={() => setAddStep('select')} className="absolute left-0 p-1 -ml-1 text-gray-600 hover:text-gray-900 transition-colors outline-none cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                                            <h2 className="text-[18px] font-extrabold text-[#222] text-center">Assessment Test</h2>
                                        </div>
                                        <p className="text-[12px] font-bold text-center text-[#222] mb-6">Please enter the needed details.</p>

                                        <div className="flex flex-col gap-y-3 mb-8">
                                            <input type="text" placeholder="Quarter Number" value={quarterNumber} onChange={(e) => setQuarterNumber(e.target.value)} className={`w-full p-3 bg-white text-[#222] placeholder:text-[#A0A0A0] text-[14px] font-semibold border rounded-lg outline-none transition-all focus:border-[#EFBD31] focus:ring-1 focus:ring-[#EFBD31] ${hasAssessmentDetailsError && !quarterNumber ? 'border-red-500' : 'border-[#D1D8DD]'}`} />
                                            <input type="text" placeholder="Assessment Number" value={assessmentNumber} onChange={(e) => setAssessmentNumber(e.target.value)} className={`w-full p-3 bg-white text-[#222] placeholder:text-[#A0A0A0] text-[14px] font-semibold border rounded-lg outline-none transition-all focus:border-[#EFBD31] focus:ring-1 focus:ring-[#EFBD31] ${hasAssessmentDetailsError && !assessmentNumber ? 'border-red-500' : 'border-[#D1D8DD]'}`} />
                                            <input type="text" placeholder="Assessment Title" value={assessmentTitle} onChange={(e) => setAssessmentTitle(e.target.value)} className={`w-full p-3 bg-white text-[#222] placeholder:text-[#A0A0A0] text-[14px] font-semibold border rounded-lg outline-none transition-all focus:border-[#EFBD31] focus:ring-1 focus:ring-[#EFBD31] ${hasAssessmentDetailsError && !assessmentTitle ? 'border-red-500' : 'border-[#D1D8DD]'}`} />
                                            
                                            <div className="grid grid-cols-2 gap-x-3 mt-2">
                                                <Gr8DateTimePicker label="Available From" value={availableFrom} onChange={setAvailableFrom} hasError={hasAssessmentDetailsError && !availableFrom} />
                                                <Gr8DateTimePicker label="Available Until" value={availableUntil} onChange={setAvailableUntil} hasError={hasAssessmentDetailsError && !availableUntil} />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleAssessmentNextDetails} 
                                            disabled={!isAssessmentFormComplete}
                                            className={`w-full py-3.5 text-[14px] font-black rounded-lg transition-colors outline-none
                                                ${isAssessmentFormComplete ? 'bg-[#1A4C8B] text-white hover:bg-[#153a6b] shadow-md' : 'bg-[#E9E9E9] text-[#A0A0A0] cursor-not-allowed'}
                                            `}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}

                                {/* LESSON DETAILS FORM */}
                                {addStep === 'details' && selectedAddOption === 'lesson' && (
                                    <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col">
                                        <div className="flex items-center justify-center mb-6 relative">
                                            <button onClick={() => setAddStep('select')} className="absolute left-0 p-1 -ml-1 text-gray-600 hover:text-gray-900 transition-colors outline-none cursor-pointer">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                            </button>
                                            <h2 className="text-[18px] font-extrabold text-[#222]">Write a Lesson</h2>
                                        </div>

                                        <div className="flex flex-col gap-y-1 mb-8">
                                            <Gr8TextField label="Week Number" value={weekNumber} onChange={setWeekNumber} hasError={hasDetailsError && !weekNumber} />
                                            <Gr8TextField label="Lesson Title" value={lessonTitle} onChange={setLessonTitle} hasError={hasDetailsError && !lessonTitle} />
                                        </div>

                                        <button onClick={handleLessonNextDetails} className="w-full py-3.5 text-[13px] font-black rounded-lg uppercase tracking-wide transition-all outline-none bg-[#1A4C8B] text-white shadow-md hover:bg-[#153a6b]">
                                            Next
                                        </button>
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
        </div>
    );
}