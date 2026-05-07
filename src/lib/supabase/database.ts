import type { PostgrestError } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api";

export const tables = {
  userProfiles: "UserProfile",
  assetCategories: "AssetCategory",
  assets: "Asset",
  investments: "Investment",
  portfolioSnapshots: "PortfolioSnapshot",
  investmentGoals: "InvestmentGoal"
} as const;

export type NumericValue = number | string | null;

export type UserProfileRecord = {
  id: string;
  email: string | null;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetCategoryRecord = {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetRecord = {
  id: string;
  userId: string;
  name: string;
  symbol: string | null;
  categoryId: string;
  strategyRole: string;
  estimatedValue: NumericValue;
  targetWeight: NumericValue;
  note: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InvestmentRecord = {
  id: string;
  userId: string;
  assetId: string;
  type: string;
  tradeDate: string;
  amount: NumericValue;
  quantity: NumericValue;
  price: NumericValue;
  fee: NumericValue;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioSnapshotRecord = {
  id: string;
  userId: string;
  snapshotDate: string;
  totalValue: NumericValue;
  principal: NumericValue;
  profit: NumericValue;
  roi: NumericValue;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvestmentGoalRecord = {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  targetDate: string;
  targetAmount: NumericValue;
  createdAt: string;
  updatedAt: string;
};

export function createId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}

export function toDbTimestamp(value: string) {
  return new Date(value).toISOString();
}

export function toIsoTimestamp(value: string) {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`).toISOString();
}

export function isSupabaseErrorCode(error: unknown, code: string) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === code
  );
}

export function throwSupabaseError(error: PostgrestError | null, fallbackMessage = "Supabase request failed") {
  if (!error) return;

  if (error.code === "23505") {
    throw new ApiError("记录已存在，请检查唯一字段", 409);
  }

  if (error.code === "23503") {
    throw new ApiError("关联数据不存在或无法删除", 409);
  }

  if (error.code === "PGRST116") {
    throw new ApiError("记录不存在或无权访问", 404);
  }

  throw new Error(error.message || fallbackMessage);
}

export function requireRecord<T>(
  data: T | null,
  error: PostgrestError | null,
  message = "记录不存在或无权访问"
) {
  throwSupabaseError(error);

  if (!data) {
    throw new ApiError(message, 404);
  }

  return data;
}
