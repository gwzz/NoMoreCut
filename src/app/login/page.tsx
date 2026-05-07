import { LoginLanding } from "@/components/auth/login-landing";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
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
    <LoginLanding
      initialError={params?.error}
      initialMessage={params?.message}
      nextPath={nextPath}
    />
  );
}
