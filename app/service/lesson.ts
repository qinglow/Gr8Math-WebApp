'use server'
import { createClient } from "@/lib/supabase/server";

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

        // 3. Insert Lesson using the CORRECT realCourseId
        const { data: newLesson, error: lessonError } = await supabase
            .from('lesson')
            .insert({
                course_id: realCourseId, 
                week_number: weekNumber,
                lesson_title: lessonTitle,
                lesson_content: lessonContent
            })
            .select()
            .single();

        if (lessonError) throw lessonError;

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

    const { data, error } = await supabase
        .from('lesson')
        .update({
            week_number: weekNumber,
            lesson_title: lessonTitle,
            lesson_content: lessonContent
        })
        .eq('id', lessonId)
        .select()
        .single();

    if (error) throw error;
    return data;
}