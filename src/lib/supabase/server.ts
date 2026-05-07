import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, headers) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
          void headers;
        } catch {
          // Server Components cannot set cookies. The proxy keeps auth cookies fresh.
        }
      }
    }
  });
}
