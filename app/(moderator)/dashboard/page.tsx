import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/app/service/auth';
import { redirect } from 'next/navigation';
import ModeratorClient from './moderator-client';
import { Suspense } from 'react';

export default function ModeratorDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ModeratorDashboardContent />
    </Suspense>
  );
}

async function ModeratorDashboardContent() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect('/auth/login');
  }

  const { data: profile, error: profileError } = await getUserProfile(user!.email!);

  if (profileError || !profile) {
    redirect('/auth/login?msg=Profile%20not%20found');
  }

  return <ModeratorClient profile={profile} />;
}