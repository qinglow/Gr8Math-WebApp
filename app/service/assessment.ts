'use server'
import { createClient } from "@/lib/supabase/server";
import { checkContentModeration } from "@/app/service/moderation";

export async function publishAssessmentAction(params: {
    courseId: number;
    title: string;
    startTime: string;
    endTime: string;
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

        const totalPoints = params.questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0);

        const { data: assessment, error: aErr } = await supabase
            .from('assessment_created')
            .insert({
                course_id: cc.id,
                title: params.title,
                start_time: params.startTime,
                end_time: params.endTime,
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
                const choicesToInsert = q.choices.map((choiceText: string) => {
                    const cleanChoiceText = choiceText.trim();
                    const pts = q.points !== undefined ? q.points : 1;

                    // 1. Match against the correctAnswers array FIRST
                    const correctArray = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
                    const isCorrect = correctArray.some((ans: string) => ans.trim() === cleanChoiceText);

                    // 2. ONLY prefix the choice with points if it is correct!
                    const finalChoiceText = isCorrect ? `[${pts} pts] ${cleanChoiceText}` : cleanChoiceText;

                    return {
                        question_id: savedQ.id,
                        choice_text: finalChoiceText,
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

        const totalPoints = params.questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0);

        // 1. Update Main Info
        const { error: aErr } = await supabase
            .from('assessment_created')
            .update({
                title: params.title,
                start_time: params.startTime,
                end_time: params.endTime,
                assessment_items: params.questions.length,
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
                const choicesToInsert = q.choices.map((choiceText: string) => {
                    const cleanChoiceText = choiceText.trim();
                    const pts = q.points !== undefined ? q.points : 1;
                    const correctArray = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
                    const isCorrect = correctArray.some((ans: string) => ans.trim() === cleanChoiceText);
                    const finalChoiceText = isCorrect ? `[${pts} pts] ${cleanChoiceText}` : cleanChoiceText;

                    return { question_id: savedQ.id, choice_text: finalChoiceText, is_correct: isCorrect };
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