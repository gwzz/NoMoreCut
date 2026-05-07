"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function AccountWorkspace({
  email,
  userId,
  displayName
}: {
  email: string | null;
  userId: string;
  displayName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ displayName: name })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "保存失败");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">Profile</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">账户管理</h1>
            <p className="mt-2 text-sm text-muted">你的账本数据会按 Supabase 用户 ID 隔离保存。</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gain text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <form className="mt-6 max-w-xl space-y-4" onSubmit={saveProfile}>
          <div>
            <label className="label" htmlFor="displayName">
              显示名称
            </label>
            <input
              id="displayName"
              className="field mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：长期投资账户"
            />
          </div>

          <div>
            <p className="label">登录邮箱</p>
            <p className="mt-2 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink">{email ?? "未提供邮箱"}</p>
          </div>

          {error ? <p className="rounded-md bg-loss/10 px-3 py-2 text-sm text-loss">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" aria-hidden />
            {isSubmitting ? "保存中" : "保存资料"}
          </button>
        </form>
      </section>

      <aside className="panel rounded-lg p-5">
        <p className="label">Security</p>
        <h2 className="mt-2 text-xl font-semibold tracking-normal text-ink">登录状态</h2>
        <p className="mt-3 break-all text-xs leading-5 text-muted">User ID: {userId}</p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </aside>
    </div>
  );
}
