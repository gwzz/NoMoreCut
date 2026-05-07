"use client";

import clsx from "clsx";
import { BarChart3, ListPlus, Settings2, UserRound, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LogoMark } from "@/components/brand/logo-mark";

const navItems = [
  { href: "/", label: "看板", icon: WalletCards },
  { href: "/transactions", label: "记一笔", icon: ListPlus },
  { href: "/analytics", label: "统计", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings2 },
  { href: "/account", label: "账户", icon: UserRound }
];

export function AppShell({ children, userEmail }: { children: ReactNode; userEmail?: string | null }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell pb-20 text-ink md:pb-0">
      <div className="ambient-mesh" aria-hidden />
      <div className="app-grid" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="NoMoreCut 首页">
            <LogoMark className="h-9 w-9 shadow-[0_0_42px_rgba(103,232,249,0.14)]" />
            <span>
              <span className="block text-sm font-semibold leading-tight text-white">NoMoreCut</span>
              <span className="block text-xs text-slate-500">Investment Ledger</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition",
                    active
                      ? "bg-white text-slate-950 shadow-[0_12px_40px_rgba(103,232,249,0.12)]"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            {userEmail ? (
              <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3">
                <Link href="/account" className="max-w-36 truncate text-xs text-slate-400 transition hover:text-white" title={userEmail}>
                  {userEmail}
                </Link>
                <SignOutButton compact />
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/88 backdrop-blur-xl md:hidden" aria-label="移动端导航">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition",
                  active ? "text-cyan-100" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
