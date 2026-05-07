import { ApiError } from "@/lib/api";
import {
  createId,
  nowIso,
  requireRecord,
  tables,
  throwSupabaseError,
  type AssetCategoryRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import type { CategoryInput } from "@/lib/validations/category";
import type { CategoryOption } from "@/types/domain";

function nullable<T>(value: T | undefined) {
  return value ?? null;
}

function mapCategory(category: AssetCategoryRecord): CategoryOption {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    description: category.description
  };
}

export async function listCategories(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.assetCategories)
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: true });

  throwSupabaseError(error);

  return ((data ?? []) as AssetCategoryRecord[]).map(mapCategory);
}

export async function createCategory(userId: string, input: CategoryInput) {
  const supabase = await createClient();
  const now = nowIso();
  const { data, error } = await supabase
    .from(tables.assetCategories)
    .insert({
      id: createId(),
      userId,
      name: input.name,
      color: nullable(input.color),
      description: nullable(input.description),
      createdAt: now,
      updatedAt: now
    })
    .select("*")
    .single();

  return mapCategory(requireRecord(data as AssetCategoryRecord | null, error));
}

export async function updateCategory(userId: string, id: string, input: CategoryInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.assetCategories)
    .update({
      name: input.name,
      color: nullable(input.color),
      description: nullable(input.description),
      updatedAt: nowIso()
    })
    .eq("id", id)
    .eq("userId", userId)
    .select("*")
    .maybeSingle();

  return mapCategory(requireRecord(data as AssetCategoryRecord | null, error));
}

export async function deleteCategory(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.assetCategories)
    .delete()
    .eq("id", id)
    .eq("userId", userId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    throw new ApiError("该分类下仍有关联资产，无法删除", 409);
  }

  requireRecord(data as Pick<AssetCategoryRecord, "id"> | null, error);
}
