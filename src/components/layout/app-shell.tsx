"use client";

import clsx from "clsx";
import { BarChart3, ListPlus, PieChart, Settings2, UserRound, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

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
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="NoMoreCut 首页">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
              <PieChart className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">NoMoreCut</span>
              <span className="block text-xs text-muted">Investment Ledger</span>
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
                    active ? "bg-ink text-white" : "text-muted hover:bg-white hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            {userEmail ? (
              <div className="ml-2 flex items-center gap-2 border-l border-line pl-3">
                <Link href="/account" className="max-w-36 truncate text-xs text-muted" title={userEmail}>
                  {userEmail}
                </Link>
                <SignOutButton compact />
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/94 backdrop-blur-xl md:hidden" aria-label="移动端导航">
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
                  active ? "text-ink" : "text-muted"
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
