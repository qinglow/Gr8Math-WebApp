'use server'
import { createClient } from "@/lib/supabase/server";

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

        const { data: assessment, error: aErr } = await supabase
            .from('assessment_created')
            .insert({
                course_id: cc.id, 
                title: params.title,
                start_time: params.startTime,
                end_time: params.endTime,
                assessment_items: params.questions.length,
                assessment_number: params.assessmentNumber,
                assessment_quarter: params.assessmentQuarter
            })
            .select()
            .single();

        if (aErr) throw aErr;

        // 3. Loop through Questions
        for (const q of params.questions) {
            const rawQuestionText = q.question || q.questionText || ''; 
            const formattedQuestionText = `[${q.type}] ${rawQuestionText.trim()}`;

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
                    
                    // Prefix the choice with points
                    const formattedChoiceText = `[${pts} pts] ${cleanChoiceText}`;
                    
                    // Match against the correctAnswers array
                    const correctArray = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
                    const isCorrect = correctArray.some((ans: string) => ans.trim() === cleanChoiceText);

                    return {
                        question_id: savedQ.id,
                        choice_text: formattedChoiceText,
                        is_correct: isCorrect
                    };
                });

                const { error: cErr } = await supabase.from('assessment_choices').insert(choicesToInsert);
                if (cErr) throw cErr;
            }
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
        // 1. Update Main Info
        const { error: aErr } = await supabase
            .from('assessment_created')
            .update({
                title: params.title,
                start_time: params.startTime,
                end_time: params.endTime,
                assessment_items: params.questions.length,
                assessment_number: params.assessmentNumber,
                assessment_quarter: params.assessmentQuarter
            })
            .eq('id', params.assessmentId);

        if (aErr) throw aErr;

        // 2. Wipe old questions
        await supabase.from('assessment_questions').delete().eq('assessment_id', params.assessmentId);

        // 3. Re-insert Edited Questions
        for (const q of params.questions) {
            const rawQuestionText = q.question || q.questionText || ''; 
            const formattedQuestionText = `[${q.type}] ${rawQuestionText.trim()}`;
            
            const { data: savedQ, error: qErr } = await supabase
                .from('assessment_questions')
                .insert({ assessment_id: params.assessmentId, question_text: formattedQuestionText })
                .select().single();

            if (qErr) throw qErr;

            if (q.choices && q.choices.length > 0) {
                const choicesToInsert = q.choices.map((choiceText: string) => {
                    const cleanChoiceText = choiceText.trim();
                    const pts = q.points !== undefined ? q.points : 1;
                    const formattedChoiceText = `[${pts} pts] ${cleanChoiceText}`;
                    
                    // FIX: Safe array check mapping
                    const correctArray = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
                    const isCorrect = correctArray.some((ans: string) => ans.trim() === cleanChoiceText);

                    return { question_id: savedQ.id, choice_text: formattedChoiceText, is_correct: isCorrect };
                });

                const { error: cErr } = await supabase.from('assessment_choices').insert(choicesToInsert);
                if (cErr) throw cErr;
            }
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