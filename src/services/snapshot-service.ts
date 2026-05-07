import { toNumber } from "@/lib/number";
import {
  createId,
  nowIso,
  requireRecord,
  tables,
  throwSupabaseError,
  toDbTimestamp,
  toIsoTimestamp,
  type PortfolioSnapshotRecord
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import type { SnapshotInput } from "@/lib/validations/snapshot";

function mapSnapshot(snapshot: PortfolioSnapshotRecord) {
  return {
    id: snapshot.id,
    snapshotDate: toIsoTimestamp(snapshot.snapshotDate),
    totalValue: toNumber(snapshot.totalValue),
    principal: toNumber(snapshot.principal),
    profit: toNumber(snapshot.profit),
    roi: toNumber(snapshot.roi),
    note: snapshot.note
  };
}

export async function createSnapshot(userId: string, input: SnapshotInput) {
  const supabase = await createClient();
  const snapshotDate = toDbTimestamp(input.snapshotDate);
  const { data: existing, error: existingError } = await supabase
    .from(tables.portfolioSnapshots)
    .select("*")
    .eq("userId", userId)
    .eq("snapshotDate", snapshotDate)
    .maybeSingle();

  throwSupabaseError(existingError);

  const payload = {
    snapshotDate,
    totalValue: input.totalValue,
    principal: input.principal,
    profit: input.profit,
    roi: input.roi,
    note: input.note ?? null,
    updatedAt: nowIso()
  };

  if (existing) {
    const { data, error } = await supabase
      .from(tables.portfolioSnapshots)
      .update(payload)
      .eq("id", (existing as PortfolioSnapshotRecord).id)
      .eq("userId", userId)
      .select("*")
      .maybeSingle();

    return mapSnapshot(requireRecord(data as PortfolioSnapshotRecord | null, error));
  }

  const now = nowIso();
  const { data, error } = await supabase
    .from(tables.portfolioSnapshots)
    .insert({
      id: createId(),
      userId,
      ...payload,
      createdAt: now,
      updatedAt: now
    })
    .select("*")
    .single();

  return mapSnapshot(requireRecord(data as PortfolioSnapshotRecord | null, error));
}
