import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/number";
import type { GoalInput } from "@/lib/validations/goal";

export async function createGoal(userId: string, input: GoalInput) {
  const goal = await prisma.investmentGoal.create({
    data: {
      userId,
      name: input.name,
      startDate: new Date(input.startDate),
      targetDate: new Date(input.targetDate),
      targetAmount: new Prisma.Decimal(input.targetAmount)
    }
  });

  return {
    ...goal,
    targetAmount: toNumber(goal.targetAmount),
    startDate: goal.startDate.toISOString(),
    targetDate: goal.targetDate.toISOString()
  };
}

export async function updateGoal(userId: string, id: string, input: GoalInput) {
  const goal = await prisma.investmentGoal.update({
    where: { id_userId: { id, userId } },
    data: {
      name: input.name,
      startDate: new Date(input.startDate),
      targetDate: new Date(input.targetDate),
      targetAmount: new Prisma.Decimal(input.targetAmount)
    }
  });

  return {
    ...goal,
    targetAmount: toNumber(goal.targetAmount),
    startDate: goal.startDate.toISOString(),
    targetDate: goal.targetDate.toISOString()
  };
}

export async function deleteGoal(userId: string, id: string) {
  await prisma.investmentGoal.delete({ where: { id_userId: { id, userId } } });
}
