import { ApiError } from "@/lib/api";
import { toNumber } from "@/lib/number";
import {
  createId,
  nowIso,
  requireRecord,
  tables,
  throwSupabaseError,
  type AssetCategoryRecord,
  type AssetRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import type { AssetInput } from "@/lib/validations/asset";
import type { AssetOption } from "@/types/domain";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type AssetWithCategory = AssetRecord & { category: AssetCategoryRecord };

function nullable<T>(value: T | undefined) {
  return value ?? null;
}

async function getCategoryMap(
  supabase: SupabaseServerClient,
  userId: string,
  categoryIds: string[]
) {
  const ids = Array.from(new Set(categoryIds));

  if (ids.length === 0) {
    return new Map<string, AssetCategoryRecord>();
  }

  const { data, error } = await supabase
    .from(tables.assetCategories)
    .select("*")
    .eq("userId", userId)
    .in("id", ids);

  throwSupabaseError(error);

  return new Map(((data ?? []) as AssetCategoryRecord[]).map((category) => [category.id, category]));
}

function attachCategory(asset: AssetRecord, categories: Map<string, AssetCategoryRecord>) {
  const category = categories.get(asset.categoryId);

  if (!category) {
    throw new ApiError("资产分类不存在或无权访问", 404);
  }

  return {
    ...asset,
    category
  };
}

async function attachCategories(
  supabase: SupabaseServerClient,
  userId: string,
  assets: AssetRecord[]
) {
  const categories = await getCategoryMap(
    supabase,
    userId,
    assets.map((asset) => asset.categoryId)
  );

  return assets.map((asset) => attachCategory(asset, categories));
}

export function mapAsset(asset: AssetWithCategory): AssetOption {
  return {
    id: asset.id,
    name: asset.name,
    symbol: asset.symbol,
    categoryId: asset.categoryId,
    categoryName: asset.category.name,
    categoryColor: asset.category.color,
    strategyRole: asset.strategyRole,
    estimatedValue: toNumber(asset.estimatedValue),
    targetWeight: asset.targetWeight === null ? null : toNumber(asset.targetWeight),
    note: asset.note,
    isArchived: asset.isArchived
  };
}

export async function listAssets(userId: string, options?: { includeArchived?: boolean }) {
  const supabase = await createClient();
  let query = supabase
    .from(tables.assets)
    .select("*")
    .eq("userId", userId)
    .order("isArchived", { ascending: true })
    .order("createdAt", { ascending: true });

  if (!options?.includeArchived) {
    query = query.eq("isArchived", false);
  }

  const { data, error } = await query;
  throwSupabaseError(error);

  const assets = await attachCategories(supabase, userId, (data ?? []) as AssetRecord[]);
  return assets.map(mapAsset);
}

export async function listRawAssets(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.assets)
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: true });

  throwSupabaseError(error);

  return attachCategories(supabase, userId, (data ?? []) as AssetRecord[]);
}

export async function createAsset(userId: string, input: AssetInput) {
  const supabase = await createClient();
  const now = nowIso();
  const { data, error } = await supabase
    .from(tables.assets)
    .insert({
      id: createId(),
      userId,
      name: input.name,
      symbol: nullable(input.symbol),
      categoryId: input.categoryId,
      strategyRole: input.strategyRole,
      estimatedValue: nullable(input.estimatedValue),
      targetWeight: nullable(input.targetWeight),
      note: nullable(input.note),
      isArchived: input.isArchived ?? false,
      createdAt: now,
      updatedAt: now
    })
    .select("*")
    .single();

  const asset = requireRecord(data as AssetRecord | null, error);
  const categories = await getCategoryMap(supabase, userId, [asset.categoryId]);

  return mapAsset(attachCategory(asset, categories));
}

export async function updateAsset(userId: string, id: string, input: AssetInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.assets)
    .update({
      name: input.name,
      symbol: nullable(input.symbol),
      categoryId: input.categoryId,
      strategyRole: input.strategyRole,
      estimatedValue: nullable(input.estimatedValue),
      targetWeight: nullable(input.targetWeight),
      note: nullable(input.note),
      isArchived: input.isArchived ?? false,
      updatedAt: nowIso()
    })
    .eq("id", id)
    .eq("userId", userId)
    .select("*")
    .maybeSingle();

  const asset = requireRecord(data as AssetRecord | null, error);
  const categories = await getCategoryMap(supabase, userId, [asset.categoryId]);

  return mapAsset(attachCategory(asset, categories));
}

export async function deleteAsset(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.assets)
    .delete()
    .eq("id", id)
    .eq("userId", userId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    const { data: archivedAsset, error: archiveError } = await supabase
      .from(tables.assets)
      .update({
        isArchived: true,
        updatedAt: nowIso()
      })
      .eq("id", id)
      .eq("userId", userId)
      .select("id")
      .maybeSingle();

    requireRecord(archivedAsset as Pick<AssetRecord, "id"> | null, archiveError);
    return;
  }

  requireRecord(data as Pick<AssetRecord, "id"> | null, error);
}
