'use client';

import React from 'react';
import { useClassManager } from './use-class-page';
import { saveDllAction } from './dll/action';
import { prepareDllForDatabase, rebuildDllLocalState } from './dll/helper';

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
import { Gr8DllEditor } from '@/components/dll/Gr8DllEditor';
import { Gr8DllViewer } from '@/components/dll/Gr8DllViewer';
import { DllTabContent } from './dll/DllTabContent';

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

    const {
        currentView, setCurrentView, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isSaving, setIsSaving,
        courseContent, viewingLesson, setViewingLesson, selectedParticipant, setSelectedParticipant, selectedAssessmentResult, setSelectedAssessmentResult,
        showQuarterlyReport, setShowQuarterlyReport, isAddModalOpen, setIsAddModalOpen, addStep, setAddStep, selectedAddOption, setSelectedAddOption,
        lessonContent, setLessonContent, weekNumber, setWeekNumber, lessonTitle, setLessonTitle, pendingMedia, setPendingMedia, isEditingLesson,
        editingLessonId, hasDetailsError, setHasDetailsError, quarterNumber, setQuarterNumber, assessmentNumber, setAssessmentNumber, assessmentTitle,
        setAssessmentTitle, availableFrom, setAvailableFrom, availableUntil, setAvailableUntil, hasAssessmentDetailsError, setHasAssessmentDetailsError,
        assessmentInitialQuestions, setAssessmentInitialQuestions, viewingDll, setViewingDll, dllSemesterNumber, setDllSemesterNumber, dllWeekNumber,
        setDllWeekNumber, dllAvailableFrom, setDllAvailableFrom, dllAvailableUntil, setDllAvailableUntil, hasDllDetailsError, setHasDllDetailsError, isDllLoading, setIsDllLoading,
        currentDllDates, setCurrentDllDates, dllRecords, setDllRecords, dllFromError, setDllFromError, dllUntilError, setDllUntilError, showToast,
        setShowToast, toastMessage, setToastMessage, isSaveConfirmModalOpen, setIsSaveConfirmModalOpen, isDiscardModalOpen, setIsDiscardModalOpen,
        participantsList, setParticipantsList, pendingNavigation, setPendingNavigation,
        handleSetAvailableFrom, handleSetAvailableUntil, handleSetDllAvailableFrom, handleSetDllAvailableUntil, handleProceedToDetails,
        handleLessonNextDetails, handleAssessmentNextDetails, handleDllNextDetails, openAddModal, resetEditor, cancelDiscard, closeAddModal,
        onPublishAssessment, onExecuteSave, handleEditAssessment, handleEditLesson, isAssessmentFormComplete
    } = useClassManager(courseId, initialFeed);

    // ============================================================================
    // RENDER LOGIC
    // ============================================================================
    if (currentView === 'viewer' && viewingLesson) return <LessonViewerView viewingLesson={viewingLesson} onBack={() => setCurrentView('feed')} />;

    if (currentView === 'editor') {
        return (
            <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader /> <Gr8LoadingOverlay isLoading={isSaving} message="Loading..." />
                <Gr8RichTextEditor courseId={courseId} initialContent={lessonContent} onChange={setLessonContent} onSave={() => setIsSaveConfirmModalOpen(true)} onBack={() => setIsDiscardModalOpen(true)} isEditing={isEditingLesson} onMediaQueued={(id: string, file: File, url: string) => setPendingMedia(p => [...p, { id, file, url }])} />
                {isSaveConfirmModalOpen && <ConfirmModal title={`Confirm ${isEditingLesson ? 'Update' : 'Save'}?`} onYes={onExecuteSave} onNo={() => setIsSaveConfirmModalOpen(false)} />}
                {isDiscardModalOpen && <ConfirmModal title="Discard Changes?" subtitle="You have unsaved content. If you go back, your changes will be lost." onYes={resetEditor} onNo={cancelDiscard} />}
            </div>
        );
    }

    if (currentView === 'assessment-editor') {
        return (
            <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader /> <Gr8LoadingOverlay isLoading={isSaving} message="Loading..." />
                <Gr8AssessmentEditor
                    onBack={() => setIsDiscardModalOpen(true)}
                    initialQuestions={assessmentInitialQuestions}
                    isEditing={isEditingLesson}
                    onPublish={onPublishAssessment}
                    courseId={courseId}
                />
                {isDiscardModalOpen && <ConfirmModal title="Discard Changes?" subtitle="You have unsaved content. If you go back, your changes will be lost." onYes={resetEditor} onNo={cancelDiscard} />}
            </div>
        );
    }

    if (currentView === 'dll-editor') {
        return (
            <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader />
                <Gr8DllEditor
                    onBack={() => setIsDiscardModalOpen(true)}
                    onSaveComplete={async (data: any) => {
                        setIsSaving(true);
                        const dbPayload = prepareDllForDatabase(data, currentDllDates?.from || '', currentDllDates?.to || '', courseId, quarterNumber, dllWeekNumber);
                        const res = await saveDllAction(dbPayload);
                        if (res.success) {
                            const localData = rebuildDllLocalState(data, dbPayload);
                            const newDllRecord = { id: res.id, from: currentDllDates?.from || '', to: currentDllDates?.to || '', data: localData };
                            setDllRecords(prev => [newDllRecord, ...prev]);
                            setCurrentDllDates(null); setToastMessage('DLL Saved Successfully!'); setCurrentView('feed'); setActiveTab('dll');
                            setShowToast(true); setTimeout(() => setShowToast(false), 3000);
                            setDllSemesterNumber(''); setDllWeekNumber(''); setDllAvailableFrom(''); setDllAvailableUntil('');
                        } else {
                            alert(res.error || "Failed to save DLL");
                        }
                        setIsSaving(false);
                    }}
                />
                {isDiscardModalOpen && <ConfirmModal title="Discard Changes?" subtitle="Unsaved work will be lost." onYes={resetEditor} onNo={cancelDiscard} />}
            </div>
        );
    }

    if (currentView === 'dll-viewer' && viewingDll) {
        return (
            <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans relative">
                <Gr8MathHeader /> <Gr8DllViewer record={viewingDll} onBack={() => { setViewingDll(null); setCurrentView('feed'); }} />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#E2E7E9] font-sans">
            <div className="fixed md:relative top-0 left-0 w-full z-[100] shrink-0"><Gr8MathHeader /></div>
            <div className="flex flex-1 relative pt-[100px] md:pt-0">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} title={sectionName} onBack={() => window.location.href = '/class-manager'} />

                <div className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto h-full overflow-y-auto">
                    {activeTab === 'class' && (
                        <ClassFeed courseContent={courseContent} onEdit={(item: any) => item.type === 'assessment' ? handleEditAssessment(item) : handleEditLesson(item)} onSeeMore={(item: any) => { setViewingLesson(item); setCurrentView('viewer'); }} />
                    )}
                    {activeTab === 'participants' && (
                        <ParticipantsTabContent
                            participantsList={participantsList}
                            selectedParticipant={selectedParticipant}
                            setSelectedParticipant={setSelectedParticipant}
                            showQuarterlyReport={showQuarterlyReport}
                            setShowQuarterlyReport={setShowQuarterlyReport}
                            selectedAssessmentResult={selectedAssessmentResult}
                            setSelectedAssessmentResult={setSelectedAssessmentResult}
                        />
                    )}

                    {activeTab === 'dll' && (
                        <DllTabContent
                            dllRecords={dllRecords}
                            setViewingDll={setViewingDll}
                            setCurrentView={setCurrentView}
                        />
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
                            handleProceedToDetails, handleLessonNextDetails, handleAssessmentNextDetails,
                            handleDllNextDetails, isAssessmentFormComplete, dllSemesterNumber, setDllSemesterNumber,
                            dllWeekNumber, setDllWeekNumber, dllAvailableFrom, setDllAvailableFrom: handleSetDllAvailableFrom,
                            dllAvailableUntil, setDllAvailableUntil: handleSetDllAvailableUntil,
                            hasDllDetailsError, dllFromError, dllUntilError
                        }}
                        closeAddModal={closeAddModal}
                    />
                )}

                {isDiscardModalOpen && currentView === 'feed' && (
                    <ConfirmModal title="Discard Changes?" subtitle="You have unsaved content. If you go back, your changes will be lost." onYes={resetEditor} onNo={cancelDiscard} />
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