import Link from "next/link";
import { Settings2 } from "lucide-react";
import { TransactionsWorkspace } from "@/components/transactions/transactions-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { listAssets } from "@/services/asset-service";
import { listInvestments } from "@/services/investment-service";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await requireUser();
  const [assets, transactions] = await Promise.all([listAssets(user.id), listInvestments(user.id)]);

  if (assets.length === 0) {
    return (
      <EmptyState
        title="请先在设置页创建至少一个资产"
        action={
          <Link href="/settings" className="primary-button">
            <Settings2 className="h-4 w-4" aria-hidden />
            去设置
          </Link>
        }
      />
    );
  }

  return <TransactionsWorkspace assets={assets} transactions={transactions} />;
}
