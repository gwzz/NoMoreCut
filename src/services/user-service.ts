import {
  nowIso,
  requireRecord,
  tables,
  throwSupabaseError,
  type UserProfileRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export async function ensureUserProfile(user: AuthenticatedUser) {
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from(tables.userProfiles)
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  throwSupabaseError(existingError);

  if (!existing) {
    const now = nowIso();
    const { data, error } = await supabase
      .from(tables.userProfiles)
      .insert({
        id: user.id,
        email: user.email,
        displayName: null,
        createdAt: now,
        updatedAt: now
      })
      .select("*")
      .single();

    return requireRecord(data as UserProfileRecord | null, error);
  }

  const profile = existing as UserProfileRecord;

  if (profile.email !== user.email) {
    const { data, error } = await supabase
      .from(tables.userProfiles)
      .update({
        email: user.email,
        updatedAt: nowIso()
      })
      .eq("id", user.id)
      .select("*")
      .maybeSingle();

    return requireRecord(data as UserProfileRecord | null, error);
  }

  return profile;
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.userProfiles)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  throwSupabaseError(error);

  return data as UserProfileRecord | null;
}

export async function updateUserProfile(user: AuthenticatedUser, input: { displayName: string | null }) {
  const supabase = await createClient();
  const now = nowIso();
  const { data, error } = await supabase
    .from(tables.userProfiles)
    .upsert(
      {
        id: user.id,
        email: user.email,
        displayName: input.displayName,
        updatedAt: now
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  return requireRecord(data as UserProfileRecord | null, error);
}
