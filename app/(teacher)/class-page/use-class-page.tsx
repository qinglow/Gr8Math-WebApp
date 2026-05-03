import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';
import { handleLessonSave } from '@/app/service/lesson-save';
import { publishAssessmentAction, fetchAssessmentDetails, updateAssessmentAction } from '@/app/service/assessment';
import { convertToIso, revertIsoToPicker, pickerToDate } from '@/lib/utils/utils';
import { fetchParticipantsAction } from './participants/action';
import { getDllsAction, saveDllAction } from './dll/action';
import { prepareDllForDatabase, rebuildDllLocalState } from './dll/helper';
import type { ClassContentItem } from './class-page-client';
import { useRouter } from 'next/navigation';

export function useClassManager(courseId: string, initialFeed: ClassContentItem[]) {
    const router = useRouter();
    // --- STATE ---
    const [currentView, setCurrentView] = useState<'feed' | 'editor' | 'viewer' | 'assessment-editor' | 'dll-editor' | 'dll-viewer'>('feed');
    const [activeTab, setActiveTab] = useState('class');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [courseContent, setCourseContent] = useState<ClassContentItem[]>(initialFeed);
    const [viewingLesson, setViewingLesson] = useState<ClassContentItem | null>(null);
    const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
    const [selectedAssessmentResult, setSelectedAssessmentResult] = useState<any | null>(null);
    const [showQuarterlyReport, setShowQuarterlyReport] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addStep, setAddStep] = useState<'select' | 'details'>('select');
    const [selectedAddOption, setSelectedAddOption] = useState<string | null>(null);
    const [lessonContent, setLessonContent] = useState('');
    const [weekNumber, setWeekNumber] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [pendingMedia, setPendingMedia] = useState<any[]>([]);
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    const [hasDetailsError, setHasDetailsError] = useState(false);
    const [quarterNumber, setQuarterNumber] = useState('');
    const [assessmentNumber, setAssessmentNumber] = useState('');
    const [assessmentTitle, setAssessmentTitle] = useState('');
    const [availableFrom, setAvailableFrom] = useState('');
    const [availableUntil, setAvailableUntil] = useState('');
    const [hasAssessmentDetailsError, setHasAssessmentDetailsError] = useState(false);
    const [assessmentInitialQuestions, setAssessmentInitialQuestions] = useState<any[]>([]);
    const [viewingDll, setViewingDll] = useState<any | null>(null);
    const [dllSemesterNumber, setDllSemesterNumber] = useState('');
    const [dllWeekNumber, setDllWeekNumber] = useState('');
    const [dllAvailableFrom, setDllAvailableFrom] = useState('');
    const [dllAvailableUntil, setDllAvailableUntil] = useState('');
    const [hasDllDetailsError, setHasDllDetailsError] = useState(false);
    const [isDllLoading, setIsDllLoading] = useState(false);
    const [currentDllDates, setCurrentDllDates] = useState<{ from: string, to: string } | null>(null);
    const [dllRecords, setDllRecords] = useState<any[]>([]);
    const [dllFromError, setDllFromError] = useState('');
    const [dllUntilError, setDllUntilError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [participantsList, setParticipantsList] = useState<any[]>([]);
    const [pendingNavigation, setPendingNavigation] = useState<boolean>(false);
    const [activeWarning, setActiveWarning] = useState<any>(null);
    const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [assessmentTimeLimit, setAssessmentTimeLimit] = useState<number>(0);

    // --- EFFECTS ---
    useEffect(() => { setCourseContent(initialFeed); }, [initialFeed]);

    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (['editor', 'assessment-editor', 'dll-editor'].includes(currentView) || isAddModalOpen) {
                window.history.pushState(null, "", window.location.href);
                setPendingNavigation(true);
                setIsDiscardModalOpen(true);
            } else if (currentView !== 'feed') {
                setCurrentView('feed');
            }
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener('popstate', handlePopState);

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (['editor', 'assessment-editor', 'dll-editor'].includes(currentView) || isAddModalOpen) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentView, isAddModalOpen]);

    useEffect(() => {
        const loadDlls = async () => {
            const res = await getDllsAction(courseId);
            if (res.success && res.data) setDllRecords(res.data);
        };
        loadDlls();
    }, [courseId]);

    useEffect(() => {
        const loadParticipants = async () => {
            const res = await fetchParticipantsAction(courseId);
            if (res.success && res.data) setParticipantsList(res.data.participants);
            else setParticipantsList([]);
        };
        loadParticipants();
    }, [courseId]);


    useEffect(() => {
        const fetchUserStatus = async () => {
            const supabase = createClient();

            // 1. Get session first (More reliable on fast production initial loads)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user) {
                console.log("[DEBUG] No user session found on mount. Auth race condition triggered.");
                return;
            }

            console.log("[DEBUG] Fetching status for:", user.email);

            // 2. Fetch User Profile
            const { data: dbUser, error: userError } = await supabase
                .from('user')
                .select('id, is_restricted, warning_count')
                .eq('email_add', user.email)
                .single();

            if (userError) console.error("[DEBUG] Error fetching user:", userError);
            if (dbUser) setUserProfile(dbUser);

            if (dbUser) {
                // 3. Fetch Notifications
                const { data: notices, error: noticeError } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', dbUser.id)
                    .eq('is_read', false)
                    .eq('type', 'warning');

                if (noticeError) console.error("[DEBUG] Error fetching notices (Check RLS Policies!):", noticeError);
                console.log("[DEBUG] Raw notices found:", notices);

                if (notices && notices.length > 0) {
                    const flashNotice = notices.find((n: any) => n.meta?.flash_ui);

                    if (flashNotice) {
                        console.log("[DEBUG] Flash notice matched! Setting active warning.");
                        setActiveWarning({
                            id: flashNotice.id,
                            message: flashNotice.message,
                            count: flashNotice.meta?.warning_count
                        });
                    } else {
                        console.log("[DEBUG] Notices exist, but none have meta.flash_ui == true");
                    }
                }
            }
        };

        fetchUserStatus();
    }, []);

    const dismissWarning = async () => {
        if (activeWarning?.id) {
            const supabase = createClient();
            await supabase.from('notifications').update({ is_read: true }).eq('id', activeWarning.id);
        }
        setActiveWarning(null);
    };

    // --- HANDLERS ---
    const handleSetAvailableFrom = (val: string) => {
        setAvailableFrom(val);
        const fromDate = pickerToDate(val);
        const untilDate = pickerToDate(availableUntil);
        if (fromDate && untilDate && untilDate <= fromDate) {
            setAvailableUntil('');
            setToastMessage("'Available Until' reset: must be after Start Time.");
            setShowToast(true); setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleSetAvailableUntil = (val: string) => {
        const fromDate = pickerToDate(availableFrom);
        const untilDate = pickerToDate(val);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (!availableFrom || !fromDate) { setToastMessage("Please select a valid 'Available From' first!"); setShowToast(true); setTimeout(() => setShowToast(false), 3000); return; }
        if (untilDate && untilDate < today) { setToastMessage("Cannot select a date before today!"); setShowToast(true); setTimeout(() => setShowToast(false), 3000); return; }
        if (untilDate && untilDate <= fromDate) { setToastMessage("End time must be later than Start time!"); setShowToast(true); setTimeout(() => setShowToast(false), 3000); return; }
        setAvailableUntil(val);
    };

    const handleSetDllAvailableFrom = (val: string) => {
        const date = pickerToDate(val);
        if (date) {
            if (date.getDay() !== 1) { setDllFromError("Must be a Monday"); setDllUntilError(""); setDllAvailableFrom(''); setDllAvailableUntil(''); return; }
            setDllFromError(''); setDllUntilError(''); setDllAvailableFrom(val);
            const friday = new Date(date); friday.setDate(friday.getDate() + 4);
            setDllAvailableUntil(`${friday.getMonth() + 1}/${friday.getDate()}/${friday.getFullYear()}`);
        } else { setDllFromError(''); setDllAvailableFrom(''); setDllAvailableUntil(''); }
    };

    const handleSetDllAvailableUntil = (val: string) => {
        const date = pickerToDate(val);
        if (date) {
            if (date.getDay() !== 5) { setDllUntilError("Must end on a Friday"); setDllAvailableUntil(''); return; }
            setDllUntilError(''); setDllAvailableUntil(val);
        } else { setDllUntilError(''); setDllAvailableUntil(''); }
    };

    const isAssessmentFormComplete = quarterNumber.trim() !== '' && assessmentNumber.trim() !== '' && assessmentTitle.trim() !== '' && availableFrom !== '' && availableUntil !== '';

    const handleProceedToDetails = () => {
        if (selectedAddOption === 'blackboard') {
            setIsAddModalOpen(false);
            window.location.href = `/virtual-blackboard?courseId=${courseId}`;
        } else if (selectedAddOption) {
            setAddStep('details');
        }
    };
    const handleLessonNextDetails = () => { if (!weekNumber.trim() || !lessonTitle.trim()) { setHasDetailsError(true); return; } setHasDetailsError(false); setIsAddModalOpen(false); setCurrentView('editor'); };
    const handleAssessmentNextDetails = () => { if (!isAssessmentFormComplete) { setHasAssessmentDetailsError(true); return; } setHasAssessmentDetailsError(false); setIsAddModalOpen(false); setCurrentView('assessment-editor'); };

    const handleDllNextDetails = () => {
        let hasErr = false;
        if (!dllSemesterNumber.trim() || !dllWeekNumber.trim()) { setHasDllDetailsError(true); hasErr = true; } else { setHasDllDetailsError(false); }
        if (!dllAvailableFrom) { if (!dllFromError) setDllFromError("Please enter needed details"); hasErr = true; }
        if (!dllAvailableUntil) { if (!dllUntilError) setDllUntilError("Please enter needed details"); hasErr = true; }
        if (hasErr) return;
        setIsDllLoading(true); setCurrentDllDates({ from: dllAvailableFrom, to: dllAvailableUntil });
        setTimeout(() => { setIsDllLoading(false); setIsAddModalOpen(false); setAddStep('select'); setSelectedAddOption(null); setCurrentView('dll-editor'); setDllFromError(''); setDllUntilError(''); }, 1500);
    };

    const openAddModal = () => {
        setWeekNumber(''); setLessonTitle(''); setLessonContent(''); setAssessmentTitle(''); setAvailableFrom(''); setAvailableUntil(''); setAssessmentInitialQuestions([]);
        setQuarterNumber(''); setAssessmentNumber(''); setIsEditingLesson(false); setEditingLessonId(null); setSelectedAddOption(null); setAddStep('select'); setIsAddModalOpen(true);
    };

    const resetEditor = () => {
        setCurrentView('feed'); setViewingLesson(null); setIsAddModalOpen(false); setIsDiscardModalOpen(false); setPendingNavigation(false);
        setAvailableFrom(''); setAvailableUntil(''); setAssessmentInitialQuestions([]);
    };

    const cancelDiscard = () => { setIsDiscardModalOpen(false); setPendingNavigation(false); };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setTimeout(() => {
            setSelectedAddOption(null); setAddStep('select'); setWeekNumber(''); setLessonTitle(''); setHasDetailsError(false);
            setQuarterNumber(''); setAssessmentNumber(''); setAssessmentTitle(''); setAvailableFrom(''); setAvailableUntil('');
            setAssessmentInitialQuestions([]); setHasAssessmentDetailsError(false); setDllSemesterNumber(''); setDllWeekNumber('');
            setDllAvailableFrom(''); setDllAvailableUntil(''); setHasDllDetailsError(false); setDllFromError(''); setDllUntilError('');
            setIsEditingLesson(false); setEditingLessonId(null);
        }, 200);
    };

    const onPublishAssessment = async (questions: any[], timeLimit: number = 0) => {

        // --- NEW: STRICT ANSWER KEY CHECK ---
        // This stops the teacher from publishing if any question is missing a correct answer
        const hasMissingKeys = questions.some(q => !q.correctAnswers || q.correctAnswers.length === 0);
        if (hasMissingKeys) {
            setToastMessage("Cannot publish: Please set an answer key for all questions.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return; // Stops the function from running
        }
        // ------------------------------------

        setIsSaving(true);
        const start = convertToIso(availableFrom);
        const end = convertToIso(availableUntil);

        if (!start || !end) {
            setToastMessage("Date conversion failed.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setIsSaving(false);
            return;
        }

        try {
            const payload = {
                courseId: parseInt(courseId),
                title: assessmentTitle,
                startTime: start,
                endTime: end,
                timeLimit: timeLimit,
                assessmentNumber: parseInt(assessmentNumber),
                assessmentQuarter: parseInt(quarterNumber),
                questions
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
                    ? prev.map(a => (a.id === editingLessonId && a.type === 'assessment') ? newItem : a)
                    : [newItem, ...prev]
                );

                setToastMessage(isEditingLesson ? 'Assessment Test updated!' : 'Assessment Test posted!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                resetEditor();
            } else {
                const errorMsg = res.error?.toLowerCase() || "";
                if (errorMsg.includes('not found') || errorMsg.includes('foreign key')) {
                    throw new Error("CLASS_DELETED");
                }
                alert(res.error || "Failed to publish.");
            }
        } catch (error) {
            console.error(error);
        }
        setIsSaving(false);
    };

    const onExecuteSave = async () => {
        setIsSaveConfirmModalOpen(false);
        setIsSaving(true);
        try {
            const result = await handleLessonSave({
                courseId, lessonContent, pendingMedia,
                isEditingLesson, editingLessonId, weekNumber, lessonTitle
            });

            if (result.success) {
                const updated = { ...result.lesson, type: 'lesson' } as ClassContentItem;
                setCourseContent(prev => result.isEdit
                    ? prev.map(l => (l.id === editingLessonId && l.type === 'lesson') ? updated : l)
                    : [updated, ...prev]
                );
                setToastMessage(result.isEdit ? 'Lesson edited!' : 'Lesson posted!');
                resetEditor();
            } else {
                const errorMsg = result.message?.toLowerCase() || "";
                if (errorMsg.includes('not found') || errorMsg.includes('foreign key')) {
                    throw new Error("CLASS_DELETED");
                }
                alert(result.message || "Failed to save lesson.");
            }
        } catch (e: any) {
            if (e.message === "CLASS_DELETED") throw e;
            alert(e.message);
        } finally {
            setIsSaving(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleEditAssessment = async (assessment: ClassContentItem) => {
        setIsEditingLesson(true); setEditingLessonId(assessment.id); setIsSaving(true);
        const res = await fetchAssessmentDetails(assessment.id);
        if (res.success && res.data) {
            const dbData = res.data;
            setAssessmentTitle(dbData.title || ''); setAssessmentNumber(dbData.assessment_number?.toString() || ''); setQuarterNumber(dbData.assessment_quarter?.toString() || '');
            setAvailableFrom(revertIsoToPicker(dbData.start_time)); setAvailableUntil(revertIsoToPicker(dbData.end_time));
            setAssessmentTimeLimit(dbData.time_limit_minutes ?? 0);


            const parsedQuestions = dbData.assessment_questions.map((dbQ: any) => {
                // 1. Separate Image URL from Question Text
                let rawText = dbQ.question_text;
                let extractedImageUrl = '';

                if (rawText.includes(' ||| ')) {
                    const parts = rawText.split(' ||| ');
                    rawText = parts[0];
                    extractedImageUrl = parts[1];
                }

                // 2. Parse the clean text
                const qMatch = rawText.match(/^\[(.*?)\] (.*)$/);
                const type = qMatch ? qMatch[1] : 'Multiple Choice';
                const cleanQuestion = qMatch ? qMatch[2] : rawText;

                let points = 1; const choices: string[] = []; const correctAnswers: string[] = [];
                dbQ.assessment_choices?.forEach((dbC: any) => {
                    const cMatch = dbC.choice_text.match(/^\[(\d+)\s*pts\]\s*(.*)$/i);
                    let cleanChoice = dbC.choice_text;
                    if (cMatch) { points = parseInt(cMatch[1], 10); cleanChoice = cMatch[2].trim(); }
                    choices.push(cleanChoice);
                    if (dbC.is_correct) correctAnswers.push(cleanChoice);
                });

                // 3. Return the parsed data including imageUrl
                return {
                    id: dbQ.id.toString(),
                    type,
                    question: cleanQuestion,
                    imageUrl: extractedImageUrl, // <--- Added this!
                    choices: choices.length > 0 ? choices : [''],
                    hasError: false,
                    choiceErrors: choices.map(() => false),
                    points,
                    correctAnswers,
                    isAnswerKeyMode: false
                };
            });

            setAssessmentInitialQuestions(parsedQuestions); setSelectedAddOption('assessment'); setAddStep('details'); setIsAddModalOpen(true);
        }
        setIsSaving(false);
    };

    const handleEditLesson = (lesson: ClassContentItem) => {
        setIsEditingLesson(true); setEditingLessonId(lesson.id); setWeekNumber(lesson.week_number?.toString() || '');
        setLessonTitle(lesson.title || lesson.lesson_title || ''); setLessonContent(lesson.lesson_content || '');
        setSelectedAddOption('lesson'); setAddStep('details'); setIsAddModalOpen(true);
    };

    return {
        currentView, setCurrentView, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isSaving, setIsSaving,
        courseContent, setCourseContent, viewingLesson, setViewingLesson, selectedParticipant, setSelectedParticipant, selectedAssessmentResult, setSelectedAssessmentResult,
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
        onPublishAssessment, onExecuteSave, handleEditAssessment, handleEditLesson, isAssessmentFormComplete,
        activeWarning, dismissWarning, userProfile, assessmentTimeLimit
    };
}