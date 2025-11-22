import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Root page redirects to landing or app based on auth state
export default async function RootPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
  
  if (isDemoMode) {
    // Demo mode: always show landing
    redirect('/landing');
  }
  
  // Check auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Authenticated: go to app
    redirect('/app');
  } else {
    // Not authenticated: show landing
    redirect('/landing');
  }
}
