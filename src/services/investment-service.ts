import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/number";
import type { InvestmentInput } from "@/lib/validations/investment";
import type { InvestmentListItem } from "@/types/domain";

const investmentInclude = {
  asset: {
    include: {
      category: true
    }
  }
} satisfies Prisma.InvestmentInclude;

type InvestmentWithAsset = Prisma.InvestmentGetPayload<{ include: typeof investmentInclude }>;

function decimalOrNull(value: number | undefined) {
  return value === undefined ? undefined : new Prisma.Decimal(value);
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
    tradeDate: investment.tradeDate.toISOString(),
    amount: toNumber(investment.amount),
    quantity: investment.quantity === null ? null : toNumber(investment.quantity),
    price: investment.price === null ? null : toNumber(investment.price),
    fee: investment.fee === null ? null : toNumber(investment.fee),
    note: investment.note
  };
}

export async function listInvestments(userId: string, options?: { limit?: number }) {
  const investments = await prisma.investment.findMany({
    where: { userId },
    include: investmentInclude,
    orderBy: [{ tradeDate: "desc" }, { createdAt: "desc" }],
    take: options?.limit
  });

  return investments.map(mapInvestment);
}

export async function listRawInvestments(userId: string) {
  return prisma.investment.findMany({
    where: { userId },
    orderBy: { tradeDate: "asc" }
  });
}

export async function createInvestment(userId: string, input: InvestmentInput) {
  const investment = await prisma.investment.create({
    data: {
      userId,
      assetId: input.assetId,
      type: input.type,
      tradeDate: new Date(input.tradeDate),
      amount: new Prisma.Decimal(input.amount),
      quantity: decimalOrNull(input.quantity),
      price: decimalOrNull(input.price),
      fee: decimalOrNull(input.fee),
      note: input.note
    },
    include: investmentInclude
  });

  return mapInvestment(investment);
}

export async function updateInvestment(userId: string, id: string, input: InvestmentInput) {
  const investment = await prisma.investment.update({
    where: { id_userId: { id, userId } },
    data: {
      assetId: input.assetId,
      type: input.type,
      tradeDate: new Date(input.tradeDate),
      amount: new Prisma.Decimal(input.amount),
      quantity: decimalOrNull(input.quantity),
      price: decimalOrNull(input.price),
      fee: decimalOrNull(input.fee),
      note: input.note
    },
    include: investmentInclude
  });

  return mapInvestment(investment);
}

export async function deleteInvestment(userId: string, id: string) {
  await prisma.investment.delete({ where: { id_userId: { id, userId } } });
}
