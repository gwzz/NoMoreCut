import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/services/user-service";

function normalizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

function redirectToLogin(origin: string, message: string) {
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", message);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");
  const nextPath = normalizeNextPath(requestUrl.searchParams.get("next"));

  if (authError) {
    return redirectToLogin(requestUrl.origin, authError);
  }

  if (!code) {
    return redirectToLogin(requestUrl.origin, "认证链接缺少登录凭证，请重新登录。");
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirectToLogin(requestUrl.origin, exchangeError.message);
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirectToLogin(requestUrl.origin, userError?.message ?? "邮箱已确认，但登录会话没有创建成功。");
  }

  try {
    await ensureUserProfile({
      id: user.id,
      email: user.email ?? null
    });
  } catch {
    return redirectToLogin(requestUrl.origin, "登录已完成，但用户资料初始化失败。请确认 supabase/schema.sql 已在 Supabase 执行。");
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
