import { AuthForm } from "@/components/auth/auth-form";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

function normalizeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params?.next);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthForm nextPath={nextPath} />
    </main>
  );
}
