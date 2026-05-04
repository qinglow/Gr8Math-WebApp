import { createClient } from "@/lib/supabase/server";

// ============================================================================
// 1. SAVE DLL LOGIC
// ============================================================================
export async function createDllRecord(payload: any) {
    const supabase = await createClient();

    try {
        // 0. Find the actual course_content ID
        const { data: courseData, error: courseError } = await supabase
            .from('course_content')
            .select('id')
            .eq('section_id', payload.courseId) 
            .single();

        // If the bridge is missing, the class is effectively gone
        if (courseError || !courseData) {
            throw new Error("CLASS_DELETED_FLAG");
        }

        const actualCourseId = courseData.id;

        // 1. Insert the Main DLL Record
        const { data: mainData, error: mainError } = await supabase
            .from('dll_main')
            .insert({
                course_id: actualCourseId, 
                quarter_number: payload.quarterNumber,
                week_number: payload.weekNumber,
                available_from: payload.availableFrom,
                available_until: payload.availableUntil
            })
            .select('id')
            .single();

        if (mainError) throw mainError;

        const mainId = mainData.id;

        // 2. Loop through each day and insert the daily entries
        for (const entry of payload.dailyEntries) {
            const { data: dailyData, error: dailyError } = await supabase
                .from('dll_daily_entry')
                .insert({
                    main_id: mainId,
                    entry_date: entry.entry_date,
                    content_standard: entry.content_standard,
                    performance_standard: entry.performance_standard,
                    learning_comp: entry.learning_comp,
                    review: entry.review,
                    purpose: entry.purpose,
                    example: entry.example,
                    discussion_proper: entry.discussion_proper, 
                    developing_mastery: entry.developing_mastery,
                    application: entry.application,
                    generalization: entry.generalization,
                    evaluation: entry.evaluation,
                    additional_act: entry.additional_act,
                    remark: entry.remark,
                    reflection: entry.reflection
                })
                .select('id')
                .single();

            if (dailyError) throw dailyError;

            // 3. Handle References
            const dailyRefs = payload.references
                .filter((ref: any) => ref.date === entry.entry_date)
                .map((ref: any) => ({
                    daily_entry_id: dailyData.id,
                    reference_title: ref.reference_title,
                    reference_text: ref.reference_text
                }));

            if (dailyRefs.length > 0) {
                const { error: refError } = await supabase
                    .from('dll_references')
                    .insert(dailyRefs);

                if (refError) throw refError;
            }
        }

        return mainId;

    } catch (error: any) {
        console.error("DLL Save Error:", error.message);

        // Standardize the fatal error flag
        if (
            error.message === "CLASS_DELETED_FLAG" ||
            error.message?.includes('foreign key constraint') || 
            error.message?.includes('violates')
        ) {
            throw new Error("CLASS_DELETED_FLAG");
        }

        throw new Error(error.message || "Failed to save DLL record.");
    }
}

// ============================================================================
// 2. FETCH DLL LOGIC
// ============================================================================
export async function fetchDllRecords(courseId: string | number) {
    const supabase = await createClient();

    try {
        const { data: courseData, error: courseError } = await supabase
            .from('course_content')
            .select('id')
            .eq('section_id', courseId) 
            .single();

        if (courseError || !courseData) {
            return []; 
        }

        const { data, error } = await supabase
            .from('dll_main')
            .select(`
                id, available_from, available_until,
                dll_daily_entry (
                    entry_date, content_standard, performance_standard, learning_comp,
                    review, purpose, example, discussion_proper, developing_mastery,
                    application, generalization, evaluation, additional_act, remark, reflection,
                    dll_references (
                        reference_title, reference_text
                    )
                )
            `)
            .eq('course_id', courseData.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;

    } catch (error) {
        console.error("Error fetching DLLs:", error);
        return [];
    }
}