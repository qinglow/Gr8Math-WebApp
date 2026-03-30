'use client';

import React, { useState, useEffect } from 'react';
import { handleLessonSave } from '@/app/service/lesson-save';
import { 
    publishAssessmentAction, 
    fetchAssessmentDetails, 
    updateAssessmentAction 
} from '@/app/service/assessment';
import { convertToIso, revertIsoToPicker, pickerToDate } from '@/lib/utils/utils';

// --- COMPONENTS ---
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';
import { Gr8RichTextEditor } from '@/components/ui/Gr8RichTextEditor';
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';
import { Gr8AssessmentEditor } from '@/components/ui/Gr8AssessmentEditor';
import { ParticipantsTabContent } from '@/components/ui/PaticipantTabContent';
import { AddContentModal } from '@/components/ui/AddContentModal';
import { Sidebar } from '@/app/(teacher)/class-page/components/Sidebar';
import { ClassFeed } from './components/ClassFeed';
import { LessonViewerView } from '@/app/(teacher)/class-page/components/LessonViewerView';

// --- TYPES ---
export type ClassContentItem = {
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

export default function ClassPageClient({ initialFeed, sectionName, courseId }: { initialFeed: ClassContentItem[], sectionName: string, courseId: string }) {
    // --- UI & VIEW NAVIGATION ---
    const [currentView, setCurrentView] = useState<'feed' | 'editor' | 'viewer' | 'assessment-editor'>('feed');
    const [activeTab, setActiveTab] = useState('class');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- DATA & FEED ---
    const [courseContent, setCourseContent] = useState<ClassContentItem[]>(initialFeed);
    const [viewingLesson, setViewingLesson] = useState<ClassContentItem | null>(null);

    // --- PARTICIPANT FLOW STATES ---
    const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
    const [selectedAssessmentResult, setSelectedAssessmentResult] = useState<any | null>(null);
    const [showQuarterlyReport, setShowQuarterlyReport] = useState(false);

    // --- SHARED MODAL FLOW STATES ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addStep, setAddStep] = useState<'select' | 'details'>('select');
    const [selectedAddOption, setSelectedAddOption] = useState<string | null>(null);

    // --- LESSON FORM STATES ---
    const [lessonContent, setLessonContent] = useState('');
    const [weekNumber, setWeekNumber] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [pendingMedia, setPendingMedia] = useState<any[]>([]);

    // --- EDITING LOGIC ---
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    const [hasDetailsError, setHasDetailsError] = useState(false);

    // --- ASSESSMENT FORM STATES ---
    const [quarterNumber, setQuarterNumber] = useState('');
    const [assessmentNumber, setAssessmentNumber] = useState('');
    const [assessmentTitle, setAssessmentTitle] = useState('');
    const [availableFrom, setAvailableFrom] = useState('');
    const [availableUntil, setAvailableUntil] = useState('');
    const [hasAssessmentDetailsError, setHasAssessmentDetailsError] = useState(false);
    const [assessmentInitialQuestions, setAssessmentInitialQuestions] = useState<any[]>([]);

    // --- TOAST NOTIFICATIONS ---
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

    useEffect(() => { setCourseContent(initialFeed); }, [initialFeed]);

    // ============================================================================
    // BROWSER BACK BUTTON INTERCEPT
    // ============================================================================
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (currentView !== 'feed') {
                const confirmLeave = window.confirm("Are you sure? Any unsaved process will not be recorded.");
                if (!confirmLeave) {
                    window.history.pushState(null, "", window.location.href);
                } else {
                    setCurrentView('feed');
                }
            }
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [currentView]);

    // ============================================================================
    // DATE HANDLERS (No Past Dates + Toasts)
    // ============================================================================
    const handleSetAvailableFrom = (val: string) => {
        setAvailableFrom(val);
        const fromDate = pickerToDate(val);
        const untilDate = pickerToDate(availableUntil);

        if (fromDate && untilDate && untilDate <= fromDate) {
            setAvailableUntil('');
            setToastMessage("'Available Until' reset: must be after Start Time.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleSetAvailableUntil = (val: string) => {
        const fromDate = pickerToDate(availableFrom);
        const untilDate = pickerToDate(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!availableFrom || !fromDate) {
            setToastMessage("Please select a valid 'Available From' first!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (untilDate && untilDate < today) {
            setToastMessage("Cannot select a date before today!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (untilDate && untilDate <= fromDate) {
            setToastMessage("End time must be later than Start time!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }
        setAvailableUntil(val);
    };

    // ============================================================================
    // SAVE / PUBLISH ACTIONS
    // ============================================================================
    const onPublishAssessment = async (questions: any[]) => {
        setIsSaving(true);
        const start = convertToIso(availableFrom);
        const end = convertToIso(availableUntil);

        if (!start || !end) {
            setToastMessage("Date conversion failed. Please re-select schedule.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setIsSaving(false);
            return;
        }

        try {
            const payload = {
                courseId: parseInt(courseId), title: assessmentTitle,
                startTime: start, endTime: end,
                assessmentNumber: parseInt(assessmentNumber),
                assessmentQuarter: parseInt(quarterNumber), questions
            };

            const res = isEditingLesson && editingLessonId 
                ? await updateAssessmentAction({ ...payload, assessmentId: editingLessonId })
                : await publishAssessmentAction(payload);

            if (res.success) {
                const newItem: ClassContentItem = {
                    id: res.id || Date.now(),
                    type: 'assessment',
                    title: assessmentTitle,
                    assessment_number: parseInt(assessmentNumber)
                };
                setCourseContent(prev => isEditingLesson 
                    ? prev.map(a => a.id === editingLessonId ? newItem : a) 
                    : [newItem, ...prev]
                );
                setToastMessage(isEditingLesson ? 'Assessment Updated!' : 'Assessment Published!');
                resetEditor();
            } else {
                alert(res.error || "Failed to publish.");
            }
        } catch (error) { console.error(error); }
        setIsSaving(false);
    };

    const onExecuteSave = async () => {
        setIsSaveConfirmModalOpen(false);
        setIsSaving(true);
        try {
            const result = await handleLessonSave({
                courseId, lessonContent, pendingMedia, isEditingLesson,
                editingLessonId, weekNumber, lessonTitle
            });
            if (result.success) {
                const updated = result.lesson as ClassContentItem;
                setCourseContent(prev => result.isEdit 
                    ? prev.map(l => l.id === editingLessonId ? updated : l) 
                    : [updated, ...prev]
                );
                setToastMessage(result.isEdit ? 'Lesson updated!' : 'Lesson posted!');
                resetEditor();
            }
        } catch (e: any) { alert(e.message); }
        finally { setIsSaving(false); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }
    };

    // ============================================================================
    // EDIT LOAD LOGIC
    // ============================================================================
    const handleEditAssessment = async (assessment: ClassContentItem) => {
        setIsEditingLesson(true);
        setEditingLessonId(assessment.id);
        setIsSaving(true);

        const res = await fetchAssessmentDetails(assessment.id);
        if (res.success && res.data) {
            const dbData = res.data;
            setAssessmentTitle(dbData.title || '');
            setAssessmentNumber(dbData.assessment_number?.toString() || '');
            setQuarterNumber(dbData.assessment_quarter?.toString() || '');
            setAvailableFrom(revertIsoToPicker(dbData.start_time));
            setAvailableUntil(revertIsoToPicker(dbData.end_time));

            const parsedQuestions = dbData.assessment_questions.map((dbQ: any) => {
                const qMatch = dbQ.question_text.match(/^\[(.*?)\] (.*)$/);
                const type = qMatch ? qMatch[1] : 'Multiple Choice';
                const cleanQuestion = qMatch ? qMatch[2] : dbQ.question_text;
                let points = 1;
                const choices: string[] = [];
                const correctAnswers: string[] = [];
                dbQ.assessment_choices?.forEach((dbC: any) => {
                    const cMatch = dbC.choice_text.match(/^\[(\d+)\s*pts\]\s*(.*)$/i);
                    let cleanChoice = dbC.choice_text;
                    if (cMatch) { points = parseInt(cMatch[1], 10); cleanChoice = cMatch[2].trim(); }
                    choices.push(cleanChoice);
                    if (dbC.is_correct) correctAnswers.push(cleanChoice);
                });
                return {
                    id: dbQ.id.toString(), type, question: cleanQuestion,
                    choices: choices.length > 0 ? choices : [''],
                    hasError: false, choiceErrors: choices.map(() => false),
                    points, correctAnswers, isAnswerKeyMode: false
                };
            });
            setAssessmentInitialQuestions(parsedQuestions);
            setSelectedAddOption('assessment');
            setAddStep('details');
            setIsAddModalOpen(true);
        }
        setIsSaving(false);
    };

    const handleEditLesson = (lesson: ClassContentItem) => {
        setIsEditingLesson(true);
        setEditingLessonId(lesson.id);
        setWeekNumber(lesson.week_number?.toString() || '');
        setLessonTitle(lesson.title || lesson.lesson_title || '');
        setLessonContent(lesson.lesson_content || '');
        setSelectedAddOption('lesson');
        setAddStep('details');
        setIsAddModalOpen(true);
    };

    // ============================================================================
    // UI NAVIGATION & HELPERS
    // ============================================================================
    const openAddModal = () => {
        setWeekNumber(''); setLessonTitle(''); setLessonContent('');
        setAssessmentTitle(''); setAvailableFrom(''); setAvailableUntil('');
        setIsEditingLesson(false); setEditingLessonId(null);
        setSelectedAddOption(null); setAddStep('select');
        setIsAddModalOpen(true);
    };

    const resetEditor = () => {
        setCurrentView('feed');
        setViewingLesson(null);
        setIsAddModalOpen(false);
        setIsDiscardModalOpen(false);
        setAvailableFrom('');
        setAvailableUntil('');
    };

    const isAssessmentFormComplete = !!(availableFrom && availableUntil && assessmentTitle);

    // ============================================================================
    // RENDER LOGIC (THE VIEWS)
    // ============================================================================

    // 1. LESSON VIEWER
    if (currentView === 'viewer' && viewingLesson) {
        return <LessonViewerView viewingLesson={viewingLesson} onBack={() => setCurrentView('feed')} />;
    }

    // 2. RICH TEXT EDITOR (Lesson Editor)
    if (currentView === 'editor') {
        return (
            <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader />
                <Gr8LoadingOverlay isLoading={isSaving} message="Processing..." />
                <Gr8RichTextEditor
                    courseId={courseId}
                    initialContent={lessonContent}
                    onChange={setLessonContent}
                    onSave={() => setIsSaveConfirmModalOpen(true)}
                    onBack={() => lessonContent.replace(/<[^>]*>/g, '').trim().length > 0 ? setIsDiscardModalOpen(true) : resetEditor()}
                    isEditing={isEditingLesson}
                    onMediaQueued={(id, file, url) => setPendingMedia(p => [...p, { id, file, url }])}
                />
                {isSaveConfirmModalOpen && <ConfirmModal title={`Confirm ${isEditingLesson ? 'Update' : 'Save'}?`} onYes={onExecuteSave} onNo={() => setIsSaveConfirmModalOpen(false)} />}
                {isDiscardModalOpen && <ConfirmModal title="Discard Changes?" subtitle="Unsaved work will be lost." onYes={resetEditor} onNo={() => setIsDiscardModalOpen(false)} />}
            </div>
        );
    }

    // 3. ASSESSMENT EDITOR
    if (currentView === 'assessment-editor') {
        return (
            <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader />
                <Gr8LoadingOverlay isLoading={isSaving} message="Processing..." />
                <Gr8AssessmentEditor onBack={resetEditor} initialQuestions={assessmentInitialQuestions} isEditing={isEditingLesson} onPublish={onPublishAssessment} courseId={courseId} />
            </div>
        );
    }

    // 4. MAIN FEED VIEW
    return (
        <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans">
            <div className="fixed md:relative top-0 left-0 w-full z-[100] shrink-0"><Gr8MathHeader /></div>
            <div className="flex flex-1 relative pt-[100px] md:pt-0">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} title={sectionName} onBack={() => window.location.href = '/class-manager'} />
                
                <div className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto h-full overflow-y-auto">
                    {activeTab === 'class' && (
                        <ClassFeed 
                            courseContent={courseContent} 
                            onEdit={(item: any) => item.type === 'assessment' ? handleEditAssessment(item) : handleEditLesson(item)} 
                            onSeeMore={(item: any) => { setViewingLesson(item); setCurrentView('viewer'); }} 
                        />
                    )}
                    {activeTab === 'participants' && <ParticipantsTabContent selectedParticipant={selectedParticipant} setSelectedParticipant={setSelectedParticipant} showQuarterlyReport={showQuarterlyReport} setShowQuarterlyReport={setShowQuarterlyReport} selectedAssessmentResult={selectedAssessmentResult} setSelectedAssessmentResult={setSelectedAssessmentResult} />}
                    {activeTab === 'dll' && (
                        <div className="animate-in fade-in duration-300 text-center py-20">
                            <h2 className="text-[18px] font-black text-[#222] mb-2 uppercase tracking-wider">Daily Lesson Log</h2>
                            <div className="text-[#888] font-bold mt-10">No DLL records found.</div>
                        </div>
                    )}
                </div>

                {activeTab === 'class' && (
                    <div className="fixed bottom-10 right-10 z-50">
                        <button onClick={openAddModal} className="bg-[#1A4C8B] text-white px-8 py-3.5 rounded-full font-black shadow-lg flex items-center gap-x-2 transition-transform hover:scale-105 active:scale-95 outline-none cursor-pointer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add
                        </button>
                    </div>
                )}

                {isAddModalOpen && (
                    <AddContentModal
                        {...{
                            isEditingLesson, addStep, setAddStep, selectedAddOption, setSelectedAddOption,
                            weekNumber, setWeekNumber, lessonTitle, setLessonTitle, quarterNumber, setQuarterNumber,
                            assessmentNumber, setAssessmentNumber, assessmentTitle, setAssessmentTitle,
                            availableFrom, setAvailableFrom: handleSetAvailableFrom, 
                            availableUntil, setAvailableUntil: handleSetAvailableUntil,
                            hasDetailsError, hasAssessmentDetailsError,
                            handleProceedToDetails: () => setAddStep('details'),
                            handleLessonNextDetails: () => { setIsAddModalOpen(false); setCurrentView('editor'); },
                            handleAssessmentNextDetails: () => { 
                                if(!isAssessmentFormComplete) { setHasAssessmentDetailsError(true); return; }
                                setIsAddModalOpen(false); 
                                setCurrentView('assessment-editor'); 
                            },
                            isAssessmentFormComplete
                        }}
                        closeAddModal={() => setIsAddModalOpen(false)}
                    />
                )}
            </div>
            {showToast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-[#0A7F93] text-white px-10 py-3 rounded shadow-xl font-bold uppercase">{toastMessage}</div>}
        </div>
    );
}

const ConfirmModal = ({ title, subtitle, onYes, onNo }: { title: string, subtitle?: string, onYes: () => void, onNo: () => void }) => (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-[400px] text-center font-sans animate-in zoom-in-95">
            <h2 className="text-[18px] font-extrabold text-[#222] mb-2">{title}</h2>
            {subtitle && <p className="text-[14px] text-[#666] mb-6">{subtitle}</p>}
            <div className="flex justify-center gap-x-12 mt-4">
                <button onClick={onYes} className="text-[#ED1F24] font-black outline-none cursor-pointer hover:opacity-70 transition-opacity">Yes</button>
                <button onClick={onNo} className="text-[#ED1F24] font-black outline-none cursor-pointer hover:opacity-70 transition-opacity">No</button>
            </div>
        </div>
    </div>
);