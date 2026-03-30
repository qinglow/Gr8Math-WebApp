import { createClient } from "@/lib/supabase/server";

export async function getStudentsFromDb(classId: number) {
    const supabase = await createClient();

    const { data: rawList, error: studentError } = await supabase
        .from('student_class')
        .select(`
            student (
                id,
                user:user_id (
                    first_name,
                    last_name,
                    email_add
                )
            )
        `)
        .eq('class_id', classId);

    if (studentError || !rawList) {
        console.error("Error fetching students:", studentError);
        return [];
    }

    return rawList.map((item: any, index: number) => {
        const studentObj = Array.isArray(item.student) ? item.student[0] : item.student;
        const user = Array.isArray(studentObj?.user) ? studentObj.user[0] : studentObj?.user;
        
        return {
            id: studentObj?.id,
            name: user ? `${user.last_name}, ${user.first_name}` : 'Unknown Student',
            email: user?.email_add,
            rank: index + 1 
        };
    });
}

export async function getStudentScoresFromDb(classId: number, studentId: number) {
    const supabase = await createClient();

    const { data: courseData } = await supabase
        .from('course_content')
        .select('id')
        .eq('section_id', classId)
        .single();

    if (!courseData) return [];

    const { data, error } = await supabase
        .from('assessment_record')
        .select(`
            score,
            date_accomplished,
            assessment:assessment_id!inner (
                id,
                title,
                assessment_number,
                assessment_items,
                course_id
            )
        `)
        .eq('student_id', studentId)
        .eq('assessment.course_id', courseData.id);

    if (error) {
        console.error("Score fetch error:", error);
        return [];
    }

    return data.map((item: any) => {
        const ass = item.assessment;
        const score = Number(item.score);
        const total = Number(ass.assessment_items) || 1;
        
        // Create a Date object from the timestamp
        const dateObj = new Date(item.date_accomplished);

        return {
            no: ass.assessment_number,
            title: ass.title,
            score: score,
            items: total,
            percentage: Math.round((score / total) * 100) + '%',
            
            // Format 1: Date (e.g., Mar 30, 2026)
            date_accomplished: dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            
            // Format 2: Time (e.g., 8:05 PM)
            time_accomplished: dateObj.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            })
        };
    });
}