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

  if (!profile || profile.roles !== 'Teacher') {
    await supabase.auth.signOut();
    const msg = encodeURIComponent("Access Denied: The web portal is available only for Teachers.");
    redirect(`/login?msg=${msg}`);
  }

  return <ClassManagerClient profile={profile} />;
}