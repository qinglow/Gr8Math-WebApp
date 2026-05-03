import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/app/service/auth';
import { redirect } from 'next/navigation';
import ClassManagerClient from './class-manager-client';
import { Suspense } from 'react'; 

export default async function ClassManagerPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect('/auth/login');
  }

  const { data: profile, error: profileError } = await getUserProfile(user.email);

  if (profileError || !profile) {
    redirect('/auth/login?msg=Profile%20not%20found');
  }


  return (
    <Suspense fallback={<div className="min-h-screen bg-[#E2E7E9]" />}>
      <ClassManagerClient profile={profile} />
    </Suspense>
  );
}