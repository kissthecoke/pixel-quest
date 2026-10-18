'use client';
import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO } from './config';

let client: ReturnType<typeof createBrowserClient> | null = null;
export function getBrowserClient() {
  if (IS_DEMO) return null;
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
