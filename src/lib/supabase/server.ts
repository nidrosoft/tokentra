import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from './types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client with the service role key for admin operations
 * Only use this in server-side code where you need to bypass RLS
 * 
 * Falls back to anon key in development if service role key is not set
 */
export function createServiceClient() {
  // Dynamic import to avoid bundling issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use service role key if available, otherwise fall back to anon key for development
  const key = serviceRoleKey || anonKey;
  
  if (!serviceRoleKey && process.env.NODE_ENV === 'development') {
    console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY not set, using anon key. Some operations may fail due to RLS.');
  }
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  ) as ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;
}
