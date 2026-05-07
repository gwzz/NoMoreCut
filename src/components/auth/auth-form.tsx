"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, MailCheck, UserPlus } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  initialError?: string;
  initialMessage?: string;
  nextPath: string;
};

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "邮箱还没有确认。请先打开确认邮件，或切换到注册后重新发送确认邮件。";
  }

  if (normalized.includes("invalid login credentials")) {
    return "邮箱或密码不正确；如果刚注册，请先确认邮箱后再登录。";
  }

  if (normalized.includes("signup") && normalized.includes("disabled")) {
    return "当前 Supabase 项目没有开启邮箱注册，请在 Authentication 设置里启用 Email signups。";
  }

  if (normalized.includes("already registered")) {
    return "这个邮箱已经注册过，请直接登录；如果还没确认邮箱，可以重新发送确认邮件。";
  }

  if (normalized.includes("rate limit")) {
    return "请求太频繁了，请稍等一会儿再试。";
  }

  return message;
}

function getSignUpState(data: {
  session: unknown;
  user: {
    identities?: unknown[];
  } | null;
}) {
  if (data.session) {
    return "signed-in";
  }

  if (!data.user) {
    return "missing-user";
  }

  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return "existing-user";
  }

  return "confirmation-required";
}

export function AuthForm({ initialError, initialMessage, nextPath }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(initialMessage ?? null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const result =
        mode === "sign-in"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: callbackUrl
              }
            });

      if (result.error) {
        setError(getAuthErrorMessage(result.error.message));
        return;
      }

      if (mode === "sign-up") {
        const signUpState = getSignUpState(result.data);

        if (signUpState === "missing-user") {
          setError("注册请求没有创建用户。请确认 Supabase 环境变量指向当前项目，并在 Supabase Auth 中启用邮箱注册。");
          return;
        }

        if (signUpState === "existing-user") {
          setError("这个邮箱可能已经注册过。请直接登录；如果还没确认邮箱，可以重新发送确认邮件。");
          return;
        }

        if (signUpState === "confirmation-required") {
          setMessage("账号已创建。请打开确认邮件完成验证，然后回到这里登录。");
          return;
        }
      }

      if (mode === "sign-up" && !result.data.session) {
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? getAuthErrorMessage(authError.message) : "登录服务暂时不可用。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendConfirmation() {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: callbackUrl
        }
      });

      if (resendError) {
        setError(getAuthErrorMessage(resendError.message));
        return;
      }

      setMessage("确认邮件已重新发送，请检查邮箱。");
    } catch (authError) {
      setError(authError instanceof Error ? getAuthErrorMessage(authError.message) : "确认邮件发送失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="spotlight-card relative w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-white/10 bg-slate-950/72 p-5 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:max-w-full sm:p-6">
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Secure access</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white">
              {mode === "sign-in" ? "登录 NoMoreCut" : "创建账户"}
            </h2>
          </div>
          <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
            Supabase
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          每个账户都由独立会话隔离，登录后只会看到自己的资产、交易和目标。
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={clsx(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition",
              mode === "sign-in" ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/10" : "text-slate-400 hover:text-white"
            )}
          >
            <LogIn className="h-4 w-4" aria-hidden />
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={clsx(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition",
              mode === "sign-up" ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/10" : "text-slate-400 hover:text-white"
            )}
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            注册
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" htmlFor="email">
              邮箱
            </label>
            <input
              id="email"
              className="mt-2 h-12 w-full rounded-md border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              className="mt-2 h-12 w-full rounded-md border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm leading-6 text-rose-100">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm leading-6 text-emerald-100">
              {message}
            </p>
          ) : null}

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-300 px-4 text-sm font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {mode === "sign-in" ? <LogIn className="h-4 w-4" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
            {isSubmitting ? "处理中" : mode === "sign-in" ? "登录" : "注册"}
          </button>

          {mode === "sign-up" ? (
            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isSubmitting || !email}
              onClick={resendConfirmation}
            >
              <MailCheck className="h-4 w-4" aria-hidden />
              重新发送确认邮件
            </button>
          ) : null}
        </form>
      </div>
    </section>
  );
}
