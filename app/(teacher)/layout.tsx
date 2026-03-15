import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/app/service/auth';
import { redirect } from 'next/navigation';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect('/auth/login');
  }

  const { data: profile } = await getUserProfile(user.email);

  if (profile?.roles === 'Admin') {
    redirect('/admin-dashboard'); 
  }

  if (!profile || profile.roles === 'Student') {
    await supabase.auth.signOut();
    redirect('/auth/access-denied');
  }

 
  return <>{children}</>;
}