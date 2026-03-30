import { createClient } from "@/lib/supabase/server";

// ============================================================================
// 1. SAVE DLL LOGIC
// ============================================================================
export async function createDllRecord(payload: any) {
    const supabase = await createClient();

    // 0. Find the actual course_content ID using the class.id passed from the frontend
    const { data: courseData, error: courseError } = await supabase
        .from('course_content')
        .select('id')
        .eq('section_id', payload.courseId) 
        .single();

    if (courseError || !courseData) {
        console.error("Error finding course_content:", courseError);
        throw new Error("Could not find the course content linked to this class.");
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

    if (mainError) {
        console.error("Error inserting dll_main:", mainError);
        throw mainError;
    }

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

        if (dailyError) {
            console.error(`Error inserting daily entry for ${entry.entry_date}:`, dailyError);
            throw dailyError;
        }

        // 3. Filter references for THIS specific day, map them to the DB schema
        const dailyRefs = payload.references
            .filter((ref: any) => ref.date === entry.entry_date)
            .map((ref: any) => ({
                daily_entry_id: dailyData.id,
                reference_title: ref.reference_title,
                reference_text: ref.reference_text
            }));

        // Only try to insert if there are actually references for this day
        if (dailyRefs.length > 0) {
            const { error: refError } = await supabase
                .from('dll_references')
                .insert(dailyRefs);

            if (refError) {
                console.error("Error inserting references:", refError);
                throw refError;
            }
        }
    }

    return mainId;
}

// ============================================================================
// 2. FETCH DLL LOGIC
// ============================================================================
export async function fetchDllRecords(courseId: string | number) {
    const supabase = await createClient();

    // 1. Find the actual course_content ID using the class id (courseId)
    const { data: courseData, error: courseError } = await supabase
        .from('course_content')
        .select('id')
        .eq('section_id', courseId) 
        .single();

    if (courseError || !courseData) {
        console.error("Error finding course_content:", courseError);
        return []; // Return empty if no course content exists yet
    }

    // 2. Fetch the DLLs with their nested daily entries and references
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

    if (error) {
        console.error("Error fetching DLLs:", error);
        return [];
    }

    return data;
}