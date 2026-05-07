import { ApiError } from "@/lib/api";
import { toNumber } from "@/lib/number";
import {
  createId,
  nowIso,
  requireRecord,
  tables,
  throwSupabaseError,
  toDbTimestamp,
  toIsoTimestamp,
  type AssetCategoryRecord,
  type AssetRecord,
  type InvestmentRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import type { InvestmentInput } from "@/lib/validations/investment";
import { listRawAssets } from "@/services/asset-service";
import type { InvestmentListItem } from "@/types/domain";

type AssetWithCategory = AssetRecord & { category: AssetCategoryRecord };
type InvestmentWithAsset = InvestmentRecord & { asset: AssetWithCategory };

function nullable<T>(value: T | undefined) {
  return value ?? null;
}

async function attachAssets(userId: string, investments: InvestmentRecord[]) {
  const assets = await listRawAssets(userId);
  const assetById = new Map<string, AssetWithCategory>(assets.map((asset) => [asset.id, asset]));

  return investments.map((investment) => {
    const asset = assetById.get(investment.assetId);

    if (!asset) {
      throw new ApiError("交易关联资产不存在或无权访问", 404);
    }

    return {
      ...investment,
      asset
    };
  });
}

export function mapInvestment(investment: InvestmentWithAsset): InvestmentListItem {
  return {
    id: investment.id,
    assetId: investment.assetId,
    assetName: investment.asset.name,
    categoryName: investment.asset.category.name,
    categoryColor: investment.asset.category.color,
    strategyRole: investment.asset.strategyRole,
    type: investment.type,
    tradeDate: toIsoTimestamp(investment.tradeDate),
    amount: toNumber(investment.amount),
    quantity: investment.quantity === null ? null : toNumber(investment.quantity),
    price: investment.price === null ? null : toNumber(investment.price),
    fee: investment.fee === null ? null : toNumber(investment.fee),
    note: investment.note
  };
}

export async function listInvestments(userId: string, options?: { limit?: number }) {
  const supabase = await createClient();
  let query = supabase
    .from(tables.investments)
    .select("*")
    .eq("userId", userId)
    .order("tradeDate", { ascending: false })
    .order("createdAt", { ascending: false });

  if (options?.limit !== undefined) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  throwSupabaseError(error);

  const investments = await attachAssets(userId, (data ?? []) as InvestmentRecord[]);
  return investments.map(mapInvestment);
}

export async function listRawInvestments(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.investments)
    .select("*")
    .eq("userId", userId)
    .order("tradeDate", { ascending: true });

  throwSupabaseError(error);

  return (data ?? []) as InvestmentRecord[];
}

export async function createInvestment(userId: string, input: InvestmentInput) {
  const supabase = await createClient();
  const now = nowIso();
  const { data, error } = await supabase
    .from(tables.investments)
    .insert({
      id: createId(),
      userId,
      assetId: input.assetId,
      type: input.type,
      tradeDate: toDbTimestamp(input.tradeDate),
      amount: input.amount,
      quantity: nullable(input.quantity),
      price: nullable(input.price),
      fee: nullable(input.fee),
      note: nullable(input.note),
      createdAt: now,
      updatedAt: now
    })
    .select("*")
    .single();

  const investment = requireRecord(data as InvestmentRecord | null, error);
  const [investmentWithAsset] = await attachAssets(userId, [investment]);

  return mapInvestment(investmentWithAsset);
}

export async function updateInvestment(userId: string, id: string, input: InvestmentInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.investments)
    .update({
      assetId: input.assetId,
      type: input.type,
      tradeDate: toDbTimestamp(input.tradeDate),
      amount: input.amount,
      quantity: nullable(input.quantity),
      price: nullable(input.price),
      fee: nullable(input.fee),
      note: nullable(input.note),
      updatedAt: nowIso()
    })
    .eq("id", id)
    .eq("userId", userId)
    .select("*")
    .maybeSingle();

  const investment = requireRecord(data as InvestmentRecord | null, error);
  const [investmentWithAsset] = await attachAssets(userId, [investment]);

  return mapInvestment(investmentWithAsset);
}

export async function deleteInvestment(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.investments)
    .delete()
    .eq("id", id)
    .eq("userId", userId)
    .select("id")
    .maybeSingle();

  requireRecord(data as Pick<InvestmentRecord, "id"> | null, error);
}
