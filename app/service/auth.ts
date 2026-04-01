import { createClient } from "@/lib/supabase/server";
import { logAuditTrail } from "./audit-trails";

export async function getUserProfile(email: string) {
  const supabase = await createClient();
  return await supabase
    .from('user')
    .select('id, first_name, roles, profile_pic')
    .eq('email_add', email) 
    .limit(1)
    .maybeSingle();
}

export async function insertUser(data: any) {
  const supabase = await createClient();
  const response = await supabase.from('user').insert(data).select().single();

  // Log successful registration
  if (response.data && !response.error) {
    await logAuditTrail(
      response.data.id, 
      'Authentication', 
      'REGISTER', 
      'SUCCESS', 
      `New ${data.roles} account created for ${data.email_add}.`
    );
  }

  return response;
}

export async function insertRoleSpecificData(role: 'Student' | 'Teacher', data: any) {
  const supabase = await createClient();
  const table = role.toLowerCase();
  return await supabase.from(table).insert(data);
}

export async function checkValueExists(table: 'user' | 'student', column: string, value: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq(column, value);
  return (count || 0) > 0;
}