'use server'
import { createClient } from "@/lib/supabase/server";
import { checkContentModeration } from "@/app/service/moderation";

export async function publishAssessmentAction(params: {
    courseId: number;
    title: string;
    startTime: string;
    endTime: string;
    timeLimit: number;
    assessmentNumber: number;
    assessmentQuarter: number;
    questions: any[];
}) {
    const supabase = await createClient();

    try {
        const { data: cc, error: ccErr } = await supabase
            .from('course_content')
            .select('id')
            .eq('section_id', params.courseId)
            .single();

        if (ccErr || !cc) throw new Error("Could not find course content for this section.");

        const allTextToCheck = params.title + " " + params.questions.map(q =>
            (q.question || q.questionText || '') + " " + (q.choices || []).join(" ")
        ).join(" ");

        const modCheck = await checkContentModeration(allTextToCheck);
        const status = modCheck.isSafe ? 'approved' : 'pending';

        // FIX: Calculate total points by multiplying the points value by the number of correct answers
        const totalPoints = params.questions.reduce((sum, q) => {
            const pts = Number(q.points) || 1;
            if (q.type === 'Checkboxes' && q.correctAnswers && q.correctAnswers.length > 0) {
                return sum + (pts * q.correctAnswers.length);
            }
            return sum + pts; // Default to standard points for single-answer types
        }, 0);

        const { data: assessment, error: aErr } = await supabase
            .from('assessment_created')
            .insert({
                course_id: cc.id,
                title: params.title,
                start_time: params.startTime,
                end_time: params.endTime,
                time_limit_minutes: params.timeLimit,
                assessment_items: params.questions.length,
                total_points: totalPoints,
                assessment_number: params.assessmentNumber,
                assessment_quarter: params.assessmentQuarter,
                status: status
            })
            .select()
            .single();

        if (aErr) throw aErr;

        // 3. Loop through Questions
        for (const q of params.questions) {
            const rawQuestionText = q.question || q.questionText || '';
            let formattedQuestionText = `[${q.type}] ${rawQuestionText.trim()}`;

            if (q.imageUrl && q.imageUrl.trim() !== '') {
                formattedQuestionText += ` ||| ${q.imageUrl.trim()}`;
            }

            const { data: savedQ, error: qErr } = await supabase
                .from('assessment_questions')
                .insert({
                    assessment_id: assessment.id,
                    question_text: formattedQuestionText
                })
                .select()
                .single();

            if (qErr) throw qErr;

            // 4. Batch Insert Choices
            if (q.choices && q.choices.length > 0) {
                const stripPts = (s: string) => s.replace(/\s*\[\s*\d+(?:\.\d+)?\s*pts?\s*\]\s*/gi, '').trim();


                const choicesToInsert = q.choices.map((choiceText: string) => {
                    const correctArray = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
                    const isCorrect = correctArray.some((ans: string) => ans.trim() === choiceText.trim());
                    return {
                        question_id: savedQ.id,
                        choice_text: choiceText.trim(),
                        is_correct: isCorrect
                    };
                });

                const { error: cErr } = await supabase.from('assessment_choices').insert(choicesToInsert);
                if (cErr) throw cErr;
            }
        }

        if (!modCheck.isSafe) {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();

            // --- NEW: CAPTURE THE WHOLE CONTENT FOR CONTEXT ---
            const fullContext = `[FLAGGED ITEM: ${modCheck.offendingWord}]\n\nTITLE: ${params.title}\n\nCONTENT:\n${allTextToCheck}`;

            await supabase.from('moderation_actions').insert({
                target_user_id: dbUser?.id,
                content_type: 'assessment',
                content_id: assessment.id,
                violation_details: fullContext, // <--- SAVES FULL CONTEXT HERE
                reason_code: modCheck.reasonCode || 'Banned Word', // Ensures accurate reason
                status: 'pending'
            });

            return { success: true, id: assessment.id, flagged: true }; // Stop here, do not notify students
        }

        // ---> FIX: ACTUALLY CALL THE NOTIFICATION FUNCTION HERE <---
        await notifyStudentsOfAssessment(cc.id, assessment.id);

        const { data: { user } } = await supabase.auth.getUser();
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();

        if (dbUser) {
            await supabase.from('audit_trails').insert({
                user_id: dbUser.id,
                resource: 'Assessment',
                action: 'CREATE',
                status: 'SUCCESS',
                details: `Published new assessment: ${params.title}`
            });
        }

        return { success: true, id: assessment.id };
    } catch (error: any) {
        console.error("Assessment creation failed:", error.message);
        return { success: false, error: error.message };
    }
}

export async function fetchAssessmentDetails(assessmentId: number) {
    const supabase = await createClient();

    try {
        const { data: assessment, error } = await supabase
            .from('assessment_created')
            .select(`
                *,
                assessment_questions (
                    id, question_text,
                    assessment_choices ( id, choice_text, is_correct )
                )
            `)
            .eq('id', assessmentId)
            .single();

        if (error) throw error;
        return { success: true, data: assessment };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateAssessmentAction(params: {
    assessmentId: number;
    title: string;
    startTime: string;
    endTime: string;
    timeLimit: number;
    assessmentNumber: number;
    assessmentQuarter: number;
    questions: any[];
}) {
    const supabase = await createClient();

    try {
        // --- MODERATION CHECK ---
        const allTextToCheck = params.title + " " + params.questions.map(q =>
            (q.question || q.questionText || '') + " " + (q.choices || []).join(" ")
        ).join(" ");

        const modCheck = await checkContentModeration(allTextToCheck);
        const status = modCheck.isSafe ? 'approved' : 'pending';


        // --- FETCH EXISTING DATES ---
        const { data: existingAssessment } = await supabase
            .from('assessment_created')
            .select('start_time, end_time')
            .eq('id', params.assessmentId)
            .single();

       
        const totalPoints = params.questions.reduce((sum, q) => {
            const pts = Number(q.points) || 1;
            if (q.type === 'Checkboxes' && q.correctAnswers && q.correctAnswers.length > 0) {
                return sum + (pts * q.correctAnswers.length);
            }
            return sum + pts; // Default to standard points for single-answer types
        }, 0);

        // 1. Update Main Info
        const { error: aErr } = await supabase
            .from('assessment_created')
            .update({
                title: params.title,
                start_time: params.startTime,
                end_time: params.endTime,
                time_limit_minutes: params.timeLimit,
                assessment_items: params.questions.length,
                total_points: totalPoints,
                assessment_number: params.assessmentNumber,
                assessment_quarter: params.assessmentQuarter,
                status: status
            })
            .eq('id', params.assessmentId);

        if (aErr) throw aErr;

        // --- TIME EXTENSION CHECK & 0-SCORE WIPE ---
        if (existingAssessment) {
            const oldEnd = new Date(existingAssessment.end_time).getTime();
            const newEnd = new Date(params.endTime).getTime();

            // If the new end time is strictly newer/greater than the previously recorded end time
            if (newEnd > oldEnd) {
                const { data: wipedRecords, error: wipeErr } = await supabase
                    .from('assessment_record')
                    .delete()
                    .eq('assessment_id', params.assessmentId)
                    .eq('score', 0)
                    .select('student_id');

                // Delete their specific answers so they get a totally clean slate
                if (!wipeErr && wipedRecords && wipedRecords.length > 0) {
                    const studentIds = wipedRecords.map(r => r.student_id);
                    await supabase
                        .from('student_answers')
                        .delete()
                        .eq('assessment_id', params.assessmentId)
                        .in('student_id', studentIds);
                }
            }
        }

        // 2. Wipe old questions
        await supabase.from('assessment_questions').delete().eq('assessment_id', params.assessmentId);

        // 3. Re-insert Edited Questions
        for (const q of params.questions) {
            const rawQuestionText = q.question || q.questionText || '';
            let formattedQuestionText = `[${q.type}] ${rawQuestionText.trim()}`;

            if (q.imageUrl && q.imageUrl.trim() !== '') {
                formattedQuestionText += ` ||| ${q.imageUrl.trim()}`;
            }

            const { data: savedQ, error: qErr } = await supabase
                .from('assessment_questions')
                .insert({ assessment_id: params.assessmentId, question_text: formattedQuestionText })
                .select().single();

            if (qErr) throw qErr;

            if (q.choices && q.choices.length > 0) {
                const stripPts = (s: string) => s.replace(/\s*\[\s*\d+(?:\.\d+)?\s*pts?\s*\]\s*/gi, '').trim();


                const choicesToInsert = q.choices.map((choiceText: string) => {
                    const correctArray = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
                    const isCorrect = correctArray.some((ans: string) => ans.trim() === choiceText.trim());
                    return {
                        question_id: savedQ.id,
                        choice_text: choiceText.trim(),
                        is_correct: isCorrect
                    };
                });

                const { error: cErr } = await supabase.from('assessment_choices').insert(choicesToInsert);
                if (cErr) throw cErr;
            }
        }

        const { data: { user } } = await supabase.auth.getUser();
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();

        if (!modCheck.isSafe) {
            const fullContext = `[FLAGGED ITEM: ${modCheck.offendingWord}]\n\nTITLE: ${params.title}\n\nCONTENT:\n${allTextToCheck}`;

            await supabase.from('moderation_actions').insert({
                target_user_id: dbUser?.id,
                content_type: 'assessment',
                content_id: params.assessmentId,
                violation_details: fullContext,
                reason_code: modCheck.reasonCode || 'Banned Word',
                status: 'pending'
            });

            return { success: true, id: params.assessmentId, flagged: true };
        }

        // --- AUDIT TRAIL LOGGING ---
        if (dbUser) {
            await supabase.from('audit_trails').insert({
                user_id: dbUser.id,
                resource: 'Assessment',
                action: 'UPDATE',
                status: 'SUCCESS',
                details: `Updated assessment: ${params.title}`
            });
        }

        return { success: true, id: params.assessmentId };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

async function notifyStudentsOfAssessment(courseId: number, assessmentId: number) {
    const supabase = await createClient();

    const { data: bridge } = await supabase
        .from('course_content')
        .select('section_id')
        .eq('id', courseId)
        .single();

    if (!bridge) return;

    const { data: students } = await supabase
        .from('student_class')
        .select('student(user_id)')
        .eq('class_id', bridge.section_id);

    if (students && students.length > 0) {
        const notifications = students.map((s: any) => ({
            user_id: s.student.user_id,
            type: 'assessment',
            title: 'New Assessment Posted',
            message: 'New assessment test available.',
            meta: {
                course_id: courseId,
                section_id: bridge.section_id,
                assessment_id: assessmentId
            }
        }));
        await supabase.from('notifications').insert(notifications);
    }
}

export async function fetchStudentAssessmentReview(assessmentId: number, studentId: number) {
    const supabase = await createClient();

    // 1. LOG THE INCOMING IDs
    console.log(`\n--- [DEBUG] STARTING FETCH ---`);
    console.log(`[DEBUG] Received Assessment ID: ${assessmentId}`);
    console.log(`[DEBUG] Received Student ID: ${studentId}`);

    try {
        // 2. FETCH QUESTIONS
        const { data: questions, error: qError } = await supabase
            .from('assessment_questions')
            .select(`
                id, 
                question_text, 
                assessment_choices (id, choice_text, is_correct)
            `)
            .eq('assessment_id', assessmentId)
            .order('id', { ascending: true });

        if (qError) throw qError;
        console.log(`[DEBUG] Successfully fetched ${questions?.length || 0} questions.`);

        // 3. FETCH ANSWERS
        const { data: answers, error: aError } = await supabase
            .from('student_answers')
            .select('question_id, choice_id, text_answer')
            .eq('assessment_id', assessmentId)
            .eq('student_id', studentId); // We are querying exactly what the URL passed

        if (aError) throw aError;
        
        console.log(`[DEBUG] Successfully fetched ${answers?.length || 0} answers for student_id = ${studentId}`);
        
        if (answers && answers.length > 0) {
            // console.log(`[DEBUG] Sample Answer Data:`, answers[0]);
        } else {
            // console.log(`[DEBUG] 🚨 WARNING: 0 answers found for student_id = ${studentId}. (Did you mean 43?)`);
            
            // EMERGENCY FALLBACK CHECK: Let's see if 43 was stored under user_id by mistake
            const { data: fallbackAnswers } = await supabase
                .from('student_answers')
                .select('question_id')
                .eq('assessment_id', assessmentId)
                .limit(1);
                
            if (fallbackAnswers && fallbackAnswers.length > 0) {
                // console.log(`[DEBUG] Note: There ARE answers for this assessment in the DB, just not for student_id = ${studentId}.`);
            }
        }

        // 4. MERGE DATA
        const mergedData = (questions || []).map(q => {
            const matchingAnswers = (answers || []).filter(a => a.question_id === q.id);
            return {
                ...q,
                student_answers: matchingAnswers
            };
        });

        return { success: true, data: mergedData };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function fetchPastQuestionsForWordBank() {
    const supabase = await createClient();

    try {
        // 1. Get the current logged-in teacher
        const { data: { user } } = await supabase.auth.getUser();
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();
        if (!dbUser) return { success: false, data: [] };

        // 2. Fetch all classes taught by this teacher (Using 'class' and 'adviser_id' from your schema)
        const { data: sections } = await supabase
            .from('class') 
            .select('id')
            .eq('adviser_id', dbUser.id);
            
        const sectionIds = sections?.map(s => s.id) || [];

        if (sectionIds.length === 0) return { success: true, data: [] };

        // 3. Find all course_content records linked to those classes
        const { data: courseContents } = await supabase
            .from('course_content')
            .select('id')
            .in('section_id', sectionIds);
            
        const courseContentIds = courseContents?.map(cc => cc.id) || [];

        if (courseContentIds.length === 0) return { success: true, data: [] };

        // 4. Fetch ALL assessments from ALL of those courses!
        const { data: assessments, error } = await supabase
            .from('assessment_created')
            .select(`
                title,
                assessment_questions (
                    id, question_text,
                    assessment_choices ( id, choice_text, is_correct )
                )
            `)
            .in('course_id', courseContentIds) 
            .order('created_at', { ascending: false });

        if (error) throw error;

        // NEW: Create a tracker to count how many times a title appears
        const titleCounts: Record<string, number> = {};

        // 5. Transform the DB data into your Word Bank JSON format!
        const dynamicBank = assessments.map(ass => {
            const mappedQuestions = ass.assessment_questions.map((dbQ: any) => {
                let rawText = dbQ.question_text;
                
                // Strip the type out of the question text
                const qMatch = rawText.match(/^\[(.*?)\]\s*(.*)$/);
                const type = qMatch ? qMatch[1] : 'Multiple Choice';
                const cleanQuestion = qMatch ? qMatch[2].split(' ||| ')[0] : rawText.split(' ||| ')[0];

                let points = 1;
                const choices: string[] = [];
                const correctAnswers: string[] = [];

                dbQ.assessment_choices?.forEach((dbC: any) => {
                    const cMatch = dbC.choice_text.match(/^\[(\d+(?:\.\d+)?)\s*pts\]\s*(.*)$/i);
                    let cleanChoice = dbC.choice_text;
                    if (cMatch) { 
                        points = parseFloat(cMatch[1]); 
                        cleanChoice = cMatch[2].trim(); 
                    }
                    choices.push(cleanChoice);
                    if (dbC.is_correct) correctAnswers.push(cleanChoice);
                });

                return {
                    type,
                    question: cleanQuestion,
                    choices: choices.length > 0 ? choices : [''],
                    correctAnswers,
                    points
                };
            });

            // NEW: Check if we've seen this title before and append a number if we have
            const baseTitle = ass.title;
            titleCounts[baseTitle] = (titleCounts[baseTitle] || 0) + 1;
            
            const displayTitle = titleCounts[baseTitle] > 1 
                ? `${baseTitle} (${titleCounts[baseTitle]})` 
                : baseTitle;

            return {
                topic: `Past Test: ${displayTitle}`, 
                questions: mappedQuestions
            };
        }).filter(bank => bank.questions.length > 0); 

        return { success: true, data: dynamicBank };
    } catch (e: any) {
        console.error("Fetch Error: ", e);
        return { success: false, data: [] };
    }
}