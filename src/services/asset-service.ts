import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/number";
import type { AssetInput } from "@/lib/validations/asset";
import type { AssetOption } from "@/types/domain";

const assetInclude = {
  category: true
} satisfies Prisma.AssetInclude;

type AssetWithCategory = Prisma.AssetGetPayload<{ include: typeof assetInclude }>;

function decimalOrNull(value: number | undefined) {
  return value === undefined ? undefined : new Prisma.Decimal(value);
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
  const assets = await prisma.asset.findMany({
    where: {
      userId,
      ...(options?.includeArchived ? {} : { isArchived: false })
    },
    include: assetInclude,
    orderBy: [{ isArchived: "asc" }, { createdAt: "asc" }]
  });

  return assets.map(mapAsset);
}

export async function listRawAssets(userId: string) {
  return prisma.asset.findMany({
    where: { userId },
    include: assetInclude,
    orderBy: { createdAt: "asc" }
  });
}

export async function createAsset(userId: string, input: AssetInput) {
  const asset = await prisma.asset.create({
    data: {
      userId,
      name: input.name,
      symbol: input.symbol,
      categoryId: input.categoryId,
      strategyRole: input.strategyRole,
      estimatedValue: decimalOrNull(input.estimatedValue),
      targetWeight: decimalOrNull(input.targetWeight),
      note: input.note,
      isArchived: input.isArchived ?? false
    },
    include: assetInclude
  });

  return mapAsset(asset);
}

export async function updateAsset(userId: string, id: string, input: AssetInput) {
  const asset = await prisma.asset.update({
    where: { id_userId: { id, userId } },
    data: {
      name: input.name,
      symbol: input.symbol,
      categoryId: input.categoryId,
      strategyRole: input.strategyRole,
      estimatedValue: decimalOrNull(input.estimatedValue),
      targetWeight: decimalOrNull(input.targetWeight),
      note: input.note,
      isArchived: input.isArchived ?? false
    },
    include: assetInclude
  });

  return mapAsset(asset);
}

export async function deleteAsset(userId: string, id: string) {
  try {
    await prisma.asset.delete({ where: { id_userId: { id, userId } } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      await prisma.asset.update({
        where: { id_userId: { id, userId } },
        data: { isArchived: true }
      });
      return;
    }

    throw error;
  }
}
