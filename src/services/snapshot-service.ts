import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/number";
import type { SnapshotInput } from "@/lib/validations/snapshot";

function mapSnapshot(snapshot: {
  id: string;
  snapshotDate: Date;
  totalValue: Prisma.Decimal;
  principal: Prisma.Decimal;
  profit: Prisma.Decimal;
  roi: Prisma.Decimal;
  note: string | null;
}) {
  return {
    id: snapshot.id,
    snapshotDate: snapshot.snapshotDate.toISOString(),
    totalValue: toNumber(snapshot.totalValue),
    principal: toNumber(snapshot.principal),
    profit: toNumber(snapshot.profit),
    roi: toNumber(snapshot.roi),
    note: snapshot.note
  };
}

export async function createSnapshot(userId: string, input: SnapshotInput) {
  const snapshotDate = new Date(input.snapshotDate);
  const snapshot = await prisma.portfolioSnapshot.upsert({
    where: {
      userId_snapshotDate: {
        userId,
        snapshotDate
      }
    },
    create: {
      userId,
      snapshotDate,
      totalValue: new Prisma.Decimal(input.totalValue),
      principal: new Prisma.Decimal(input.principal),
      profit: new Prisma.Decimal(input.profit),
      roi: new Prisma.Decimal(input.roi),
      note: input.note
    },
    update: {
      snapshotDate,
      totalValue: new Prisma.Decimal(input.totalValue),
      principal: new Prisma.Decimal(input.principal),
      profit: new Prisma.Decimal(input.profit),
      roi: new Prisma.Decimal(input.roi),
      note: input.note
    }
  });

  return mapSnapshot(snapshot);
}
