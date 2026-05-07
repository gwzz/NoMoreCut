import { toNumber } from "@/lib/number";
import {
  createId,
  nowIso,
  requireRecord,
  tables,
  throwSupabaseError,
  toDbTimestamp,
  toIsoTimestamp,
  type InvestmentGoalRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import type { GoalInput } from "@/lib/validations/goal";

function mapGoal(goal: InvestmentGoalRecord) {
  return {
    ...goal,
    targetAmount: toNumber(goal.targetAmount),
    startDate: toIsoTimestamp(goal.startDate),
    targetDate: toIsoTimestamp(goal.targetDate)
  };
}

export async function listGoals(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.investmentGoals)
    .select("*")
    .eq("userId", userId)
    .order("targetDate", { ascending: true });

  throwSupabaseError(error);

  return ((data ?? []) as InvestmentGoalRecord[]).map(mapGoal);
}

export async function createGoal(userId: string, input: GoalInput) {
  const supabase = await createClient();
  const now = nowIso();
  const { data, error } = await supabase
    .from(tables.investmentGoals)
    .insert({
      id: createId(),
      userId,
      name: input.name,
      startDate: toDbTimestamp(input.startDate),
      targetDate: toDbTimestamp(input.targetDate),
      targetAmount: input.targetAmount,
      createdAt: now,
      updatedAt: now
    })
    .select("*")
    .single();

  return mapGoal(requireRecord(data as InvestmentGoalRecord | null, error));
}

export async function updateGoal(userId: string, id: string, input: GoalInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.investmentGoals)
    .update({
      name: input.name,
      startDate: toDbTimestamp(input.startDate),
      targetDate: toDbTimestamp(input.targetDate),
      targetAmount: input.targetAmount,
      updatedAt: nowIso()
    })
    .eq("id", id)
    .eq("userId", userId)
    .select("*")
    .maybeSingle();

  return mapGoal(requireRecord(data as InvestmentGoalRecord | null, error));
}

export async function deleteGoal(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(tables.investmentGoals)
    .delete()
    .eq("id", id)
    .eq("userId", userId)
    .select("id")
    .maybeSingle();

  requireRecord(data as Pick<InvestmentGoalRecord, "id"> | null, error);
}
