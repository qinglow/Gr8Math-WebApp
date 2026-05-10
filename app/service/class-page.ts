'use server'
import { createClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/errorHandler";

export async function fetchClassDetails(sectionId: string) {
    const supabase = await createClient();
    const numericSectionId = parseInt(sectionId, 10);

    if (isNaN(numericSectionId)) return null;
    
    const { data, error } = await supabase
        .from('course_content')
        .select(`
            id,
            class:section_id (class_name)
        `)
        .eq('section_id', numericSectionId) 
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
        id: data.id, 
        section_name: (data as any)?.class?.class_name || "Classroom"
    };
}

export async function fetchClassFeed(sectionId: string) {
    const supabase = await createClient();
    const numericSectionId = parseInt(sectionId, 10);

    if (isNaN(numericSectionId)) return [];

    const { data: bridge } = await supabase
        .from('course_content')
        .select('id')
        .eq('section_id', numericSectionId)
        .single();

    if (!bridge) {
        console.error("No course_content found for section:", numericSectionId);
        return null;
    }

    const realCourseId = bridge.id;

    const [lessonsRes, assessmentsRes] = await Promise.all([
        supabase
            .from('lesson')
            .select('*')
            .eq('course_id', realCourseId)
            .order('created_at', { ascending: false }),
        supabase
            .from('assessment_created')
            .select('*')
            .eq('course_id', realCourseId)
            .order('created_at', { ascending: false })
    ]);

    if (lessonsRes.error) throw lessonsRes.error;
    if (assessmentsRes.error) throw assessmentsRes.error;

    // 3. Process Lessons (Strip HTML/Base64)
    const lessons = (lessonsRes.data || []).map(l => ({
        ...l,
        type: 'lesson' as const,
        preview: l.lesson_content
            ?.replace(/<[^>]*>/g, '') 
            ?.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '[image]') 
            ?.substring(0, 120) + '...'
    }));

    // 4. Process Assessments
    const assessments = (assessmentsRes.data || []).map(a => ({
        ...a,
        type: 'assessment' as const,
        title: a.title || `Assessment ${a.assessment_number}`
    }));

    // 5. Combine and Sort
    return [...lessons, ...assessments].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function deleteLessonAction(lessonId: number) {
    const supabase = await createClient();
    try {
        // 1. Fetch the user for the audit trail
        const { data: { user } } = await supabase.auth.getUser();
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();

        // 2. Fetch the lesson title BEFORE deleting it so we can log it
        const { data: oldLesson } = await supabase
            .from('lesson')
            .select('lesson_title')
            .eq('id', lessonId)
            .single();

        // 3. Delete the lesson
        const { error } = await supabase.from('lesson').delete().eq('id', lessonId);
        if (error) throw error;
        
        // 4. Log to Audit Trails
        if (dbUser && oldLesson) {
            await supabase.from('audit_trails').insert({
                user_id: dbUser.id,
                resource: 'Lesson',
                action: 'DELETE',
                status: 'SUCCESS',
                details: `Deleted lesson: ${oldLesson.lesson_title}`
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete lesson:", error.message);
        return { success: false, error: error.message };
    }
}

export async function deleteAssessmentAction(assessmentId: number) {
    const supabase = await createClient();
    try {
        // 1. Fetch the user for the audit trail
        const { data: { user } } = await supabase.auth.getUser();
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user?.email).single();

        // 2. Fetch the assessment title BEFORE deleting it so we can log it
        const { data: oldAssessment } = await supabase
            .from('assessment_created')
            .select('title')
            .eq('id', assessmentId)
            .single();

        // 3. Wipe all student answers tied to this assessment
        const { error: ansErr } = await supabase
            .from('student_answers')
            .delete()
            .eq('assessment_id', assessmentId);
        if (ansErr) throw ansErr;

        // 4. Wipe all student records/scores tied to this assessment
        const { error: recErr } = await supabase
            .from('assessment_record')
            .delete()
            .eq('assessment_id', assessmentId);
        if (recErr) throw recErr;

        // 5. Wipe the assessment questions (choices should cascade automatically)
        const { error: qErr } = await supabase
            .from('assessment_questions')
            .delete()
            .eq('assessment_id', assessmentId);
        if (qErr) throw qErr;

        // 6. Finally, delete the assessment itself
        const { error: aErr } = await supabase
            .from('assessment_created')
            .delete()
            .eq('id', assessmentId);
        if (aErr) throw aErr;

        // 7. Log to Audit Trails
        if (dbUser && oldAssessment) {
            await supabase.from('audit_trails').insert({
                user_id: dbUser.id,
                resource: 'Assessment',
                action: 'DELETE',
                status: 'SUCCESS',
                details: `Deleted assessment: ${oldAssessment.title}`
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete assessment:", error.message);
        return { success: false, error: error.message };
    }
}