import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/app/service/auth';
import { redirect } from 'next/navigation';
import ClassManagerClient from './class-manager-client';

export default async function ClassManagerPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect('/login');
  }

  const { data: profile } = await getUserProfile(user.email);

  return <ClassManagerClient profile={profile} />;
}