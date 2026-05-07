import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { requireUser } from "@/lib/auth";
import { getGoalProgress } from "@/services/analytics-service";
import { listAssets } from "@/services/asset-service";
import { listCategories } from "@/services/category-service";
import { getDashboardSummary } from "@/services/portfolio-service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const [categories, assets, summary] = await Promise.all([
    listCategories(user.id),
    listAssets(user.id, { includeArchived: true }),
    getDashboardSummary(user.id)
  ]);
  const goals = await getGoalProgress(user.id, summary);

  return <SettingsWorkspace categories={categories} assets={assets} goals={goals} summary={summary} />;
}
