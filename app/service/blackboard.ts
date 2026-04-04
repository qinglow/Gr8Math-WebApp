import { createClient } from "@/lib/supabase/server";

export async function getBlackboardsBySection(sectionId: number) {
    const supabase = await createClient();
    return await supabase
        .from('virtual_blackboard')
        .select('id, session_name, drawing_data')
        .eq('section_id', sectionId)
        .order('id', { ascending: true });
}

export async function insertBlackboard(sectionId: number, sessionName: string) {
    const supabase = await createClient();
    return await supabase
        .from('virtual_blackboard')
        .insert({
            section_id: sectionId,
            session_name: sessionName,
            drawing_data: { currentFrame: null } 
        })
        .select()
        .single();
}

export async function updateBlackboardData(boardId: number, drawingData: any, sessionName: string) {
    const supabase = await createClient();
    return await supabase
        .from('virtual_blackboard')
        .update({ 
            drawing_data: drawingData,
            session_name: sessionName
        })
        .eq('id', boardId);
}

export async function getBlackboardById(boardId: number) {
    const supabase = await createClient();
    return await supabase
        .from('virtual_blackboard')
        .select('id, session_name, drawing_data')
        .eq('id', boardId)
        .single();
}