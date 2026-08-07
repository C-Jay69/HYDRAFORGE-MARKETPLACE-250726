// lib/db.ts
// Supabase client configuration for HydraForge Marketplace
// This file provides the database connection for server-side operations

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/public access (uses anon key)
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Client for server-side operations (uses service role key)
// WARNING: Never expose this to the browser!
export const createSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// For Drizzle ORM (if using postgres connection string)
// Uncomment and configure if you're using Drizzle
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// const sql = postgres(process.env.DATABASE_URL!);
// export const db = drizzle(sql);

// Type exports for TypeScript
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
export type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;