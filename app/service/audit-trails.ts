'use server'
import { createClient } from "@/lib/supabase/server";

export async function logAuditTrail(
  userId: number | null, 
  resource: string, 
  action: string, 
  status: string, 
  details: string
) {
  const supabase = await createClient();
  return await supabase.from('audit_trails').insert({
    user_id: userId,
    resource: resource,
    action: action,
    status: status,
    details: details
  });
}


export async function getAllAuditTrails() {
    const supabase = await createClient();
    
    // Fetch audit trails and join the user table to get the name
    const { data, error } = await supabase
        .from('audit_trails')
        .select(`
            id,
            timestamp,
            resource,
            action,
            details,
            status,
            user:user_id ( first_name, last_name )
        `)
        .order('timestamp', { ascending: false }); // Newest first

    if (error) {
        console.error("Error fetching audit trails:", error.message);
        return [];
    }

    return data;
}