'use server'
import { createClient } from "@/lib/supabase/server";
import { checkContentModeration } from "@/app/service/moderation";

export async function saveLessonWithNotifications(
    sectionId: number,
    weekNumber: number,
    lessonTitle: string,
    lessonContent: string
) {
    const supabase = await createClient();

    try {
        let { data: courseContent } = await supabase
            .from('course_content')
            .select('id')
            .eq('section_id', sectionId)
            .single();

        if (!courseContent) {
            const { data: newContent, error: createErr } = await supabase
                .from('course_content')
                .insert({ section_id: sectionId })
                .select('id')
                .single();

            if (createErr) throw createErr;
            courseContent = newContent;
        }

        const realCourseId = courseContent.id;

        const modCheck = await checkContentModeration(lessonTitle + " " + lessonContent);
        const status = modCheck.isSafe ? 'approved' : 'pending';

        // 3. Insert Lesson using the CORRECT realCourseId
        const { data: newLesson, error: lessonError } = await supabase
            .from('lesson')
            .insert({
                course_id: realCourseId,
                week_number: weekNumber,
                lesson_title: lessonTitle,
                lesson_content: lessonContent,
                status: status
            })
            .select()
            .single();

        if (lessonError) throw lessonError;

        if (!modCheck.isSafe) {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();

            // --- NEW: CAPTURE THE WHOLE CONTENT FOR CONTEXT ---
            const fullContext = `[FLAGGED ITEM: ${modCheck.offendingWord}]\n\nTITLE: ${lessonTitle}\n\nCONTENT:\n${lessonContent}`;

            await supabase.from('moderation_actions').insert({
                target_user_id: dbUser?.id,
                content_type: 'lesson',
                content_id: newLesson.id,
                violation_details: fullContext, // <--- SAVES FULL CONTEXT HERE
                reason_code: modCheck.reasonCode || 'Banned Word', // Ensures accurate reason
                status: 'pending'
            });

            return { success: true, lesson: newLesson, flagged: true }; // Stop here, do not notify students
        }

        // 4. Notification Logic
        const { data: students } = await supabase
            .from('student_class')
            .select('student(user_id)')
            .eq('class_id', sectionId);

        if (students && students.length > 0) {
            const notifications = students.map((s: any) => ({
                user_id: s.student.user_id,
                type: 'lesson',
                title: 'New Lesson Posted',
                message: 'New lesson available.',
                meta: {
                    course_id: realCourseId,
                    lesson_id: newLesson.id,
                    section_id: sectionId
                }
            }));

            await supabase.from('notifications').insert(notifications);
        }

        const { data: { user } } = await supabase.auth.getUser();
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();

        if (dbUser) {
            await supabase.from('audit_trails').insert({
                user_id: dbUser.id,
                resource: 'Lesson',
                action: 'CREATE',
                status: 'SUCCESS',
                details: `Created new lesson: ${lessonTitle}`
            });
        }

        return { success: true, lesson: newLesson };
    } catch (error: any) {
        console.error("Error adding lesson:", error.message);
        return { success: false, error: error.message };
    }
}

export async function updateLesson(
    lessonId: number,
    weekNumber: number,
    lessonTitle: string,
    lessonContent: string
) {
    const supabase = await createClient();

    // --- MODERATION CHECK ---
    const modCheck = await checkContentModeration(lessonTitle + " " + lessonContent);
    const status = modCheck.isSafe ? 'approved' : 'pending';

    const { data, error } = await supabase
        .from('lesson')
        .update({
            week_number: weekNumber,
            lesson_title: lessonTitle,
            lesson_content: lessonContent,
            status: status
        })
        .eq('id', lessonId)
        .select()
        .single();

    if (error) throw error;

    const { data: { user } } = await supabase.auth.getUser();
    let dbUser = null;
    if (user && user.email) {
        const result = await supabase.from('user').select('id').eq('email_add', user.email).single();
        dbUser = result.data;
    }

    if (!modCheck.isSafe) {
        const fullContext = `[FLAGGED ITEM: ${modCheck.offendingWord}]\n\nTITLE: ${lessonTitle}\n\nCONTENT:\n${lessonContent}`;
        if (dbUser) {
            await supabase.from('moderation_actions').insert({
                target_user_id: dbUser.id,
                content_type: 'lesson',
                content_id: lessonId,
                violation_details: fullContext,
                reason_code: modCheck.reasonCode || 'Banned Word',
                status: 'pending'
            });
        }
        return { ...data, flagged: true };
    }
    
    if (dbUser) {
        await supabase.from('audit_trails').insert({
            user_id: dbUser.id, // Fixed: use dbUser.id directly
            resource: 'Lesson',
            action: 'UPDATE',
            status: 'SUCCESS',
            details: `Updated lesson: ${lessonTitle}`
        });
    }

    return data;
}