"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className={compact ? "icon-button" : "secondary-button"}
      onClick={signOut}
      disabled={isSigningOut}
      title="退出登录"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      {compact ? null : isSigningOut ? "退出中" : "退出"}
    </button>
  );
}
