import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Client for browser/frontend use
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 