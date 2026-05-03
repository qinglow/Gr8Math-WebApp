import { createClient } from "@/lib/supabase/server";
import { logAuditTrail } from "./audit-trails";
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { handleActionError } from "@/lib/utils/errorHandler";

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

function getAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase Admin environment variables. Please check your .env file and restart your server.");
  }
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}


export async function generateMasterBackupCode(userId: string) {
  const supabaseAdmin = getAdminClient();
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rawString = Array.from({ length: 12 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  
  const singleBackupCode = `${rawString.slice(0, 4)}-${rawString.slice(4, 8)}-${rawString.slice(8, 12)}`;
  await supabaseAdmin.from('mfa_backup_codes').insert({ user_id: userId, code: singleBackupCode });

  return singleBackupCode;
}


export async function verifyAndConsumeBackupCode(userId: string, backupCode: string) {
  const supabaseAdmin = getAdminClient();

  // 1. Verify if the code matches this exact user
  const { data: matchedCode } = await supabaseAdmin
    .from('mfa_backup_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', backupCode)
    .single();

  if (!matchedCode) return { error: "Invalid backup code." };

  // 2. Burn the code so it can't be reused
  await supabaseAdmin.from('mfa_backup_codes').delete().eq('id', matchedCode.id);

  // 3. Reset MFA for the user (Delete all Authenticator factors)
  const { data: factorsData } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId });
  for (const factor of (factorsData?.factors || [])) {
    await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId, id: factor.id });
  }

  return { success: true };
}