import { createClient } from "@/lib/supabase/server";
import { handleActionError } from "@/lib/utils/errorHandler";

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
    
    // 1. Perform the Insert
    const { data: newBoard, error } = await supabase
        .from('virtual_blackboard')
        .insert({
            section_id: sectionId,
            session_name: sessionName,
            drawing_data: { currentFrame: null } 
        })
        .select()
        .single();

    if (error) throw error;

    // 2. Record Audit Trail
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user.email).single();
        if (dbUser) {
            await supabase.from('audit_trails').insert({
                user_id: dbUser.id,
                resource: 'Virtual Blackboard',
                action: 'CREATE',
                status: 'SUCCESS',
                details: `Created new blackboard: ${sessionName}`
            });
        }
    }

    return { data: newBoard, error: null };
}

export async function updateBlackboardData(boardId: number, drawingData: any, sessionName: string) {
    const supabase = await createClient();
    
    // 1. Perform the Update
    const { data: updatedBoard, error } = await supabase
        .from('virtual_blackboard')
        .update({ 
            drawing_data: drawingData,
            session_name: sessionName
        })
        .eq('id', boardId)
        .select()
        .single();

    if (error) throw error;

    // 2. Record Audit Trail
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
        const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user.email).single();
        if (dbUser) {
            await supabase.from('audit_trails').insert({
                user_id: dbUser.id,
                resource: 'Virtual Blackboard',
                action: 'UPDATE',
                status: 'SUCCESS',
                details: `Updated blackboard: ${sessionName}`
            });
        }
    }

    return { error: null };
}

export async function getBlackboardById(boardId: number) {
    const supabase = await createClient();
    return await supabase
        .from('virtual_blackboard')
        .select('id, session_name, drawing_data')
        .eq('id', boardId)
        .single();
}