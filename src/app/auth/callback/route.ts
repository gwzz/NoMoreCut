import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/services/user-service";

function normalizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = normalizeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      await ensureUserProfile({
        id: user.id,
        email: user.email ?? null
      });
    }
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
