import { createClient } from "@/lib/supabase/server";

/**
 * Revised to fetch details using section_id 
 * as the primary lookup.
 */
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
        .eq('section_id', numericSectionId) // Querying by the Class ID from the URL
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Return a clean object so the Page doesn't need to do .class[0]
    return {
        id: data.id, // This is the real course_id used for lessons
        section_name: (data as any)?.class?.class_name || "Classroom"
    };
}

/**
 * Revised to fetch the bridge ID (course_content.id) first, 
 * then query lessons and assessments using that ID.
 */
export async function fetchClassFeed(sectionId: string) {
    const supabase = await createClient();
    const numericSectionId = parseInt(sectionId, 10);

    if (isNaN(numericSectionId)) return [];

    // 1. Get the bridge record (course_content) for this section
    const { data: bridge } = await supabase
        .from('course_content')
        .select('id')
        .eq('section_id', numericSectionId)
        .single();

    if (!bridge) {
        console.error("No course_content found for section:", numericSectionId);
        return [];
    }

    const realCourseId = bridge.id;

    // 2. Fetch Lessons and Assessments using the bridge ID (realCourseId)
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