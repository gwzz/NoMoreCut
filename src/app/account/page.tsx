import { AccountWorkspace } from "@/components/account/account-workspace";
import { requireUser } from "@/lib/auth";
import { getUserProfile } from "@/services/user-service";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);

  return (
    <AccountWorkspace
      email={user.email}
      userId={user.id}
      displayName={profile?.displayName ?? ""}
    />
  );
}
