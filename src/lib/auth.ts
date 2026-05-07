import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile, type AuthenticatedUser } from "@/services/user-service";

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await ensureUserProfile(user);
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("请先登录", 401);
  }

  await ensureUserProfile(user);
  return user;
}
