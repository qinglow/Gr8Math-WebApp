import { createClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/errorHandler";


async function generateUniqueClassCode() {
    const supabase = await createClient();
    const allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    let exists = true;

    // Keep generating until we find a code that isn't in the database
    while (exists) {
        // Generate a random 6-character string
        code = Array.from({ length: 6 }, () => 
            allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))
        ).join("");

        // Check if this code already exists in the 'class' table
        const { count, error } = await supabase
            .from('class')
            .select('id', { count: 'exact', head: true })
            .eq('class_code', code);

        if (error) {
            console.error("Error checking code uniqueness:", error);
            // Break to prevent infinite loop if database is down
            break; 
        }

        // If count is 0, the code is unique and we can stop the loop
        exists = (count ?? 0) > 0;
    }

    return code;
}

function convertToDbTime(timeStr: string) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12' && modifier === 'AM') hours = '00';
    if (modifier === 'PM' && hours !== '12') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}:00`;
}

export async function fetchTeacherClasses(userId: string, searchQuery?: string) {
    const supabase = await createClient();
    let query = supabase
        .from('class')
        .select(`
            id, class_name, arrival_time, dismissal_time, class_size, grade_level, class_code,
            course_content(id, section_id)
        `)
        .eq('adviser_id', userId);

    if (searchQuery) {
        query = query.ilike('class_name', `%${searchQuery}%`);
    }

    const { data, error } = await query.order('class_name', { ascending: true });
    if (error) throw error;
    return data;
}

export async function fetchSearchHistory(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('search_history')
        .select('search_term')
        .eq('user_id', userId)
        .order('searched_at', { ascending: false })
        .limit(5);

    if (error) return [];
    return data.map(d => d.search_term).filter(Boolean);
}

export async function insertSearchHistory(userId: string, term: string) {
    const supabase = await createClient();
    await supabase.from('search_history').insert({ 
        user_id: userId, 
        search_term: term.trim() 
    });
}

export async function insertClass(userId: string, className: string, size: number, start: string, end: string) {
    const supabase = await createClient();

    // 1. Check if the class name already exists for this specific user
    const { count, error: checkError } = await supabase
        .from('class')
        .select('id', { count: 'exact', head: true })
        .eq('adviser_id', userId)
        .ilike('class_name', className);

    if (checkError) {
        // console.error("Error checking class name:", checkError);
        throw checkError;
    }

    if ((count ?? 0) > 0) {
        throw new Error("You already have a class with this name.");
    }

    const classCode = await generateUniqueClassCode();

    const { data: insertedClass, error: classError } = await supabase
        .from('class')
        .insert({
            class_name: className,
            class_size: size,
            arrival_time: convertToDbTime(start),
            dismissal_time: convertToDbTime(end),
            adviser_id: userId,
            class_code: classCode, 
            grade_level: 8 
        })
        .select() 
        .single();

    if (classError) {
        // console.error("Error inserting class:", classError);
        throw classError;
    }

    const { error: contentError } = await supabase
        .from('course_content')
        .insert({
            section_id: insertedClass.id
        });

    if (contentError) {
        // console.error("Error inserting course_content:", contentError);
        throw contentError;
    }

    return { data: insertedClass, classCode };
}


export async function updateClass(classId: string, className: string, size: number, start: string, end: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('class')
        .update({
            class_name: className,
            class_size: size,
            arrival_time: convertToDbTime(start),
            dismissal_time: convertToDbTime(end),
        })
        .eq('id', classId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteClass(classId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('class')
        .delete()
        .eq('id', classId);

    if (error) throw error;
    return { success: true };
}