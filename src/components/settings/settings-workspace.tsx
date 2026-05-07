"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Check, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { STRATEGY_ROLES, strategyRoleLabels } from "@/lib/constants";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { AssetOption, CategoryOption, DashboardSummary, GoalProgress } from "@/types/domain";
import { ProgressBar } from "@/components/ui/progress-bar";

type AssetForm = {
  name: string;
  symbol: string;
  categoryId: string;
  strategyRole: string;
  estimatedValue: string;
  targetWeight: string;
  note: string;
};

function emptyAssetForm(categoryId = ""): AssetForm {
  return {
    name: "",
    symbol: "",
    categoryId,
    strategyRole: "CORE",
    estimatedValue: "",
    targetWeight: "",
    note: ""
  };
}

function assetToForm(asset: AssetOption): AssetForm {
  return {
    name: asset.name,
    symbol: asset.symbol ?? "",
    categoryId: asset.categoryId,
    strategyRole: asset.strategyRole,
    estimatedValue: asset.estimatedValue ? String(asset.estimatedValue) : "",
    targetWeight: asset.targetWeight === null ? "" : String(asset.targetWeight),
    note: asset.note ?? ""
  };
}

export function SettingsWorkspace({
  categories,
  assets,
  goals,
  summary
}: {
  categories: CategoryOption[];
  assets: AssetOption[];
  goals: GoalProgress[];
  summary: DashboardSummary;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", color: "#67e8f9", description: "" });
  const [assetForm, setAssetForm] = useState<AssetForm>(() => emptyAssetForm(categories[0]?.id));
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    name: "",
    startDate: "2026-01-01",
    targetDate: "2030-12-31",
    targetAmount: ""
  });
  const [snapshotForm, setSnapshotForm] = useState({
    snapshotDate: new Date().toISOString().slice(0, 10),
    totalValue: String(summary.totalValue),
    principal: String(summary.principal),
    profit: String(summary.profit),
    roi: String(summary.roi),
    note: ""
  });

  async function request(path: string, init: RequestInit, onSuccess: () => void) {
    setError(null);
    setIsSubmitting(true);
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers
      }
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "操作失败");
      return;
    }

    onSuccess();
    router.refresh();
  }

  function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void request(
      "/api/categories",
      {
        method: "POST",
        body: JSON.stringify(categoryForm)
      },
      () => setCategoryForm({ name: "", color: "#67e8f9", description: "" })
    );
  }

  function deleteCategory(id: string) {
    if (!window.confirm("确认删除这个分类吗？")) return;
    void request(`/api/categories/${id}`, { method: "DELETE" }, () => undefined);
  }

  function saveAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const categoryId = assetForm.categoryId || categories[0]?.id || "";
    void request(
      editingAssetId ? `/api/assets/${editingAssetId}` : "/api/assets",
      {
        method: editingAssetId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...assetForm,
          categoryId,
          estimatedValue: assetForm.estimatedValue || undefined,
          targetWeight: assetForm.targetWeight || undefined,
          isArchived: false
        })
      },
      () => {
        setEditingAssetId(null);
        setAssetForm(emptyAssetForm(categories[0]?.id));
      }
    );
  }

  function editAsset(asset: AssetOption) {
    setEditingAssetId(asset.id);
    setAssetForm(assetToForm(asset));
    setError(null);
  }

  function deleteAsset(id: string) {
    if (!window.confirm("确认删除或归档这个资产吗？")) return;
    void request(`/api/assets/${id}`, { method: "DELETE" }, () => {
      if (editingAssetId === id) {
        setEditingAssetId(null);
        setAssetForm(emptyAssetForm(categories[0]?.id));
      }
    });
  }

  function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void request(
      "/api/goals",
      {
        method: "POST",
        body: JSON.stringify(goalForm)
      },
      () => setGoalForm({ name: "", startDate: "2026-01-01", targetDate: "2030-12-31", targetAmount: "" })
    );
  }

  function deleteGoal(id: string) {
    if (!window.confirm("确认删除这个目标吗？")) return;
    void request(`/api/goals/${id}`, { method: "DELETE" }, () => undefined);
  }

  function saveSnapshot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void request(
      "/api/snapshots",
      {
        method: "POST",
        body: JSON.stringify(snapshotForm)
      },
      () => setSnapshotForm((current) => ({ ...current, note: "" }))
    );
  }

  return (
    <div className="space-y-4">
      <section className="panel rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Settings</p>
            <h1 className="gradient-text mt-2 text-2xl font-semibold tracking-normal">账本设置</h1>
            <p className="mt-2 text-sm text-muted">维护分类、资产估值、周期目标和组合快照。</p>
          </div>
          {error ? <p className="rounded-md bg-loss/10 px-3 py-2 text-sm text-loss">{error}</p> : null}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="panel rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Assets</p>
              <h2 className="mt-2 text-xl font-semibold tracking-normal text-ink">资产管理</h2>
            </div>
            {editingAssetId ? (
              <button
                type="button"
                className="icon-button"
                title="取消编辑"
                onClick={() => {
                  setEditingAssetId(null);
                  setAssetForm(emptyAssetForm(categories[0]?.id));
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>

          <form className="mt-5 grid gap-3 lg:grid-cols-2" onSubmit={saveAsset}>
            <input
              className="field"
              placeholder="资产名称"
              value={assetForm.name}
              onChange={(event) => setAssetForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              className="field"
              placeholder="代码/简称"
              value={assetForm.symbol}
              onChange={(event) => setAssetForm((current) => ({ ...current, symbol: event.target.value }))}
            />
            <select
              className="field"
              value={assetForm.categoryId || categories[0]?.id || ""}
              onChange={(event) => setAssetForm((current) => ({ ...current, categoryId: event.target.value }))}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="field"
              value={assetForm.strategyRole}
              onChange={(event) => setAssetForm((current) => ({ ...current, strategyRole: event.target.value }))}
            >
              {STRATEGY_ROLES.map((role) => (
                <option key={role} value={role}>
                  {strategyRoleLabels[role]}
                </option>
              ))}
            </select>
            <input
              className="field"
              type="number"
              min="0"
              step="0.01"
              placeholder="当前估值"
              value={assetForm.estimatedValue}
              onChange={(event) => setAssetForm((current) => ({ ...current, estimatedValue: event.target.value }))}
            />
            <input
              className="field"
              type="number"
              min="0"
              max="1"
              step="0.01"
              placeholder="目标权重，例如 0.25"
              value={assetForm.targetWeight}
              onChange={(event) => setAssetForm((current) => ({ ...current, targetWeight: event.target.value }))}
            />
            <input
              className="field lg:col-span-2"
              placeholder="备注"
              value={assetForm.note}
              onChange={(event) => setAssetForm((current) => ({ ...current, note: event.target.value }))}
            />
            <button className="primary-button lg:col-span-2" type="submit" disabled={isSubmitting || categories.length === 0}>
              <Check className="h-4 w-4" aria-hidden />
              {editingAssetId ? "保存资产" : "新增资产"}
            </button>
          </form>

          <div className="mt-6 divide-y divide-line">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{asset.name}</p>
                    {asset.isArchived ? <Archive className="h-4 w-4 text-muted" aria-label="已归档" /> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {asset.categoryName} · {asset.strategyRole} · {formatCurrency(asset.estimatedValue)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="icon-button" type="button" title="编辑资产" onClick={() => editAsset(asset)}>
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button className="icon-button" type="button" title="删除资产" onClick={() => deleteAsset(asset.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="panel rounded-lg p-5">
            <p className="label">Categories</p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal text-ink">分类标签</h2>
            <form className="mt-5 space-y-3" onSubmit={createCategory}>
              <input
                className="field"
                placeholder="分类名称"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <div className="grid grid-cols-[64px_1fr] gap-3">
                <input
                  className="field h-11 p-1"
                  type="color"
                  value={categoryForm.color}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))}
                  aria-label="分类颜色"
                />
                <input
                  className="field"
                  placeholder="描述"
                  value={categoryForm.description}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <button className="secondary-button w-full" type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4" aria-hidden />
                新增分类
              </button>
            </form>
            <div className="mt-5 space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 rounded-sm shadow-[0_0_18px_currentColor]" style={{ backgroundColor: category.color ?? "#67e8f9", color: category.color ?? "#67e8f9" }} aria-hidden />
                    <span className="truncate text-sm font-medium text-ink">{category.name}</span>
                  </div>
                  <button className="icon-button h-8 w-8" type="button" title="删除分类" onClick={() => deleteCategory(category.id)}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel rounded-lg p-5">
            <p className="label">Snapshots</p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal text-ink">组合估值快照</h2>
            <form className="mt-5 space-y-3" onSubmit={saveSnapshot}>
              <input
                className="field"
                type="date"
                value={snapshotForm.snapshotDate}
                onChange={(event) => setSnapshotForm((current) => ({ ...current, snapshotDate: event.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="总资产"
                  value={snapshotForm.totalValue}
                  onChange={(event) => setSnapshotForm((current) => ({ ...current, totalValue: event.target.value }))}
                  required
                />
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="本金"
                  value={snapshotForm.principal}
                  onChange={(event) => setSnapshotForm((current) => ({ ...current, principal: event.target.value }))}
                  required
                />
                <input
                  className="field"
                  type="number"
                  step="0.01"
                  placeholder="收益"
                  value={snapshotForm.profit}
                  onChange={(event) => setSnapshotForm((current) => ({ ...current, profit: event.target.value }))}
                  required
                />
                <input
                  className="field"
                  type="number"
                  step="0.0001"
                  placeholder="ROI"
                  value={snapshotForm.roi}
                  onChange={(event) => setSnapshotForm((current) => ({ ...current, roi: event.target.value }))}
                  required
                />
              </div>
              <input
                className="field"
                placeholder="备注"
                value={snapshotForm.note}
                onChange={(event) => setSnapshotForm((current) => ({ ...current, note: event.target.value }))}
              />
              <button className="secondary-button w-full" type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4" aria-hidden />
                记录快照
              </button>
            </form>
          </section>
        </div>
      </div>

      <section className="panel rounded-lg p-5">
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="label">Goals</p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal text-ink">投资周期目标</h2>
            <form className="mt-5 space-y-3" onSubmit={saveGoal}>
              <input
                className="field"
                placeholder="目标名称"
                value={goalForm.name}
                onChange={(event) => setGoalForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="field"
                  type="date"
                  value={goalForm.startDate}
                  onChange={(event) => setGoalForm((current) => ({ ...current, startDate: event.target.value }))}
                  required
                />
                <input
                  className="field"
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(event) => setGoalForm((current) => ({ ...current, targetDate: event.target.value }))}
                  required
                />
              </div>
              <input
                className="field"
                type="number"
                min="0"
                step="0.01"
                placeholder="目标金额"
                value={goalForm.targetAmount}
                onChange={(event) => setGoalForm((current) => ({ ...current, targetAmount: event.target.value }))}
                required
              />
              <button className="secondary-button w-full" type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4" aria-hidden />
                新增目标
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {goals.map((goal) => (
              <article key={goal.id} className="rounded-md border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{goal.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(goal.startDate)} 至 {formatDate(goal.targetDate)}
                    </p>
                  </div>
                  <button className="icon-button" type="button" title="删除目标" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex justify-between text-xs text-muted">
                      <span>金额进度</span>
                      <span>{formatPercent(goal.amountProgress)}</span>
                    </div>
                    <ProgressBar value={goal.amountProgress} tone="gain" />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-xs text-muted">
                      <span>时间进度</span>
                      <span>{formatPercent(goal.timeProgress)}</span>
                    </div>
                    <ProgressBar value={goal.timeProgress} tone="brass" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted">
                  当前 {formatCurrency(goal.currentValue)} / 目标 {formatCurrency(goal.targetAmount)}，剩余{" "}
                  {formatCurrency(goal.remainingAmount)}
                </p>
              </article>
            ))}

            {goals.length === 0 ? <p className="text-sm text-muted">还没有周期目标。</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
