"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

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

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage("账号已创建，请检查邮箱并完成确认。");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
      <div>
        <p className="label">Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">
          {mode === "sign-in" ? "登录 NoMoreCut" : "创建账户"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">登录后每个账户只会看到自己的资产、交易和目标。</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={clsx(
            "inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition",
            mode === "sign-in" ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink hover:text-ink"
          )}
        >
          <LogIn className="h-4 w-4" aria-hidden />
          登录
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={clsx(
            "inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition",
            mode === "sign-up" ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink hover:text-ink"
          )}
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          注册
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label className="label" htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            className="field mt-2"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            密码
          </label>
          <input
            id="password"
            className="field mt-2"
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? <p className="rounded-md bg-loss/10 px-3 py-2 text-sm text-loss">{error}</p> : null}
        {message ? <p className="rounded-md bg-gain/10 px-3 py-2 text-sm text-gain">{message}</p> : null}

        <button className="primary-button w-full" type="submit" disabled={isSubmitting}>
          {mode === "sign-in" ? <LogIn className="h-4 w-4" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
          {isSubmitting ? "处理中" : mode === "sign-in" ? "登录" : "注册"}
        </button>
      </form>
    </section>
  );
}
