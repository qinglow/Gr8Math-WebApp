import { createClient } from '@/lib/supabase/server';

export async function getModeratorProfile() {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();
    if (authError || !user || !user.email) throw new Error("Not authenticated or missing email");

    const { data, error } = await (await supabase)
        .from('user') 
        .select('*')
        .eq('email_add', user.email)
        .single();

    if (error) throw error;
    return data;
}

export async function updateModeratorProfile(updates: {
    first_name?: string;
    last_name?: string;
    gender?: string;
    birthdate?: string;
    profile_pic?: string; 
}) {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();
    if (authError || !user || !user.email) throw new Error("Not authenticated or missing email");

    const { error } = await (await supabase)
        .from('user')
        .update(updates)
        .eq('email_add', user.email);

    if (error) throw error;
    return { success: true };
}