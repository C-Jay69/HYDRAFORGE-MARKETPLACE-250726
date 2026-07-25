import { createClient } from "./supabase/server";

export interface SessionUser {
  id: string;
  email: string | null;
}

// Returns the current authenticated user, or null if not signed in.
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}
