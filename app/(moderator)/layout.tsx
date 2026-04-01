import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/app/service/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect('/auth/login'); 
  }

  const { data: profile } = await getUserProfile(user.email);

  if (profile?.roles === 'Teacher') {
    redirect('/class-manager');
  }

  if (!profile || profile.roles === 'Student') {
    await supabase.auth.signOut();
    redirect('/auth/access-denied');
  }

  if (profile?.roles === 'Admin') {
    return <>{children}</>;
  }

  redirect('/auth/login');
}