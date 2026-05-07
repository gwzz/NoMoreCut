"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Pencil, RotateCcw, Save, Trash2 } from "lucide-react";
import clsx from "clsx";
import { TRANSACTION_TYPES, transactionTypeLabels } from "@/lib/constants";
import { formatCurrency, formatDate, getTransactionTypeLabel } from "@/lib/format";
import type { AssetOption, InvestmentListItem } from "@/types/domain";

type FormState = {
  assetId: string;
  type: string;
  tradeDate: string;
  amount: string;
  quantity: string;
  price: string;
  fee: string;
  note: string;
};

const today = () => new Date().toISOString().slice(0, 10);

function createEmptyForm(assetId = ""): FormState {
  return {
    assetId,
    type: "BUY",
    tradeDate: today(),
    amount: "",
    quantity: "",
    price: "",
    fee: "",
    note: ""
  };
}

function formFromTransaction(transaction: InvestmentListItem): FormState {
  return {
    assetId: transaction.assetId,
    type: transaction.type,
    tradeDate: transaction.tradeDate.slice(0, 10),
    amount: String(transaction.amount),
    quantity: transaction.quantity === null ? "" : String(transaction.quantity),
    price: transaction.price === null ? "" : String(transaction.price),
    fee: transaction.fee === null ? "" : String(transaction.fee),
    note: transaction.note ?? ""
  };
}

export function TransactionsWorkspace({
  assets,
  transactions
}: {
  assets: AssetOption[];
  transactions: InvestmentListItem[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => createEmptyForm(assets[0]?.id));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === form.assetId), [assets, form.assetId]);
  const computedAmount = useMemo(() => {
    const quantity = Number(form.quantity);
    const price = Number(form.price);
    if (!Number.isFinite(quantity) || !Number.isFinite(price) || quantity <= 0 || price <= 0) return null;
    return Math.round(quantity * price * 100) / 100;
  }, [form.price, form.quantity]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      assetId: form.assetId,
      type: form.type,
      tradeDate: form.tradeDate,
      amount: form.amount || computedAmount,
      quantity: form.quantity || undefined,
      price: form.price || undefined,
      fee: form.fee || undefined,
      note: form.note || undefined
    };

    setIsSubmitting(true);
    const response = await fetch(selectedId ? `/api/investments/${selectedId}` : "/api/investments", {
      method: selectedId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "保存失败");
      return;
    }

    setSelectedId(null);
    setForm(createEmptyForm(assets[0]?.id));
    router.refresh();
  }

  async function deleteTransaction(id: string) {
    if (!window.confirm("确认删除这笔记录吗？")) return;

    setIsSubmitting(true);
    const response = await fetch(`/api/investments/${id}`, {
      method: "DELETE"
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "删除失败");
      return;
    }

    if (selectedId === id) {
      setSelectedId(null);
      setForm(createEmptyForm(assets[0]?.id));
    }

    router.refresh();
  }

  function editTransaction(transaction: InvestmentListItem) {
    setSelectedId(transaction.id);
    setForm(formFromTransaction(transaction));
    setError(null);
  }

  function resetForm() {
    setSelectedId(null);
    setForm(createEmptyForm(assets[0]?.id));
    setError(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
      <section className="panel rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">Data Entry</p>
            <h1 className="gradient-text mt-2 text-2xl font-semibold tracking-normal">{selectedId ? "编辑记录" : "记一笔"}</h1>
          </div>
          {selectedId ? (
            <button type="button" className="icon-button" onClick={resetForm} title="取消编辑">
              <RotateCcw className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <form className="mt-6 space-y-4" onSubmit={submitForm}>
          <div>
            <label className="label" htmlFor="type">
              操作类型
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("type", type)}
                  className={clsx(
                    "h-10 rounded-md border text-sm font-medium transition",
                    form.type === type
                      ? "border-cyan-300/60 bg-white text-slate-950 shadow-[0_12px_40px_rgba(103,232,249,0.12)]"
                      : "border-white/10 bg-white/[0.045] text-slate-400 hover:border-cyan-300/40 hover:text-white"
                  )}
                >
                  {transactionTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div>
              <label className="label" htmlFor="tradeDate">
                交易日期
              </label>
              <input
                id="tradeDate"
                type="date"
                className="field mt-2"
                value={form.tradeDate}
                onChange={(event) => updateField("tradeDate", event.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="assetId">
                资产
              </label>
              <select
                id="assetId"
                className="field mt-2"
                value={form.assetId}
                onChange={(event) => updateField("assetId", event.target.value)}
                required
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div>
              <label className="label" htmlFor="amount">
                金额
              </label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                className="field mt-2"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                placeholder={computedAmount ? String(computedAmount) : "0.00"}
                required={!computedAmount}
              />
            </div>

            <div>
              <label className="label" htmlFor="quantity">
                份额
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                step="0.000001"
                className="field mt-2"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                placeholder="选填"
              />
            </div>

            <div>
              <label className="label" htmlFor="price">
                单价
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.000001"
                className="field mt-2"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="选填"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[140px_1fr] lg:grid-cols-1 xl:grid-cols-[140px_1fr]">
            <div>
              <label className="label" htmlFor="fee">
                手续费
              </label>
              <input
                id="fee"
                type="number"
                min="0"
                step="0.01"
                className="field mt-2"
                value={form.fee}
                onChange={(event) => updateField("fee", event.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="label" htmlFor="note">
                投资逻辑备注
              </label>
              <input
                id="note"
                className="field mt-2"
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="选填，例如：定投、再平衡、止盈"
              />
            </div>
          </div>

          {computedAmount && !form.amount ? (
          <div className="flex items-center gap-2 rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-xs text-cyan-100">
              <Calculator className="h-4 w-4" aria-hidden />
              根据份额和单价估算金额：{formatCurrency(computedAmount)}
            </div>
          ) : null}

          {selectedAsset ? (
            <p className="text-xs text-muted">
              当前资产：{selectedAsset.categoryName} · {selectedAsset.strategyRole}
            </p>
          ) : null}

          {error ? <p className="rounded-md bg-loss/10 px-3 py-2 text-sm text-loss">{error}</p> : null}

          <button className="primary-button w-full" type="submit" disabled={isSubmitting || assets.length === 0}>
            <Save className="h-4 w-4" aria-hidden />
            {isSubmitting ? "保存中" : selectedId ? "保存修改" : "保存记录"}
          </button>
        </form>
      </section>

      <section className="panel rounded-lg p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label">Transactions</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-ink">交易流水</h2>
          </div>
          <p className="text-sm text-muted">共 {transactions.length} 笔</p>
        </div>

          <div className="mt-5 hidden overflow-hidden rounded-md border border-white/10 md:block">
            <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.045] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">资产</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 text-right font-medium">金额</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-white/[0.025]">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3 text-muted">{formatDate(transaction.tradeDate)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{transaction.assetName}</p>
                    <p className="text-xs text-muted">{transaction.categoryName}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{getTransactionTypeLabel(transaction.type)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(transaction.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="icon-button" type="button" title="编辑" onClick={() => editTransaction(transaction)}>
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button className="icon-button" type="button" title="删除" onClick={() => deleteTransaction(transaction.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 space-y-3 md:hidden">
          {transactions.map((transaction) => (
            <article key={transaction.id} className="rounded-md border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{transaction.assetName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(transaction.tradeDate)} · {getTransactionTypeLabel(transaction.type)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-ink">{formatCurrency(transaction.amount)}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="secondary-button flex-1" type="button" onClick={() => editTransaction(transaction)}>
                  <Pencil className="h-4 w-4" aria-hidden />
                  编辑
                </button>
                <button className="secondary-button flex-1" type="button" onClick={() => deleteTransaction(transaction.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>

        {transactions.length === 0 ? <p className="mt-6 text-sm text-muted">还没有记录，先从左侧保存第一笔投资开始。</p> : null}
      </section>
    </div>
  );
}
