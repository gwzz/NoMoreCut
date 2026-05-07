import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { CategoryInput } from "@/lib/validations/category";
import type { CategoryOption } from "@/types/domain";

function mapCategory(category: {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
}): CategoryOption {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    description: category.description
  };
}

export async function listCategories(userId: string) {
  const categories = await prisma.assetCategory.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  return categories.map(mapCategory);
}

export async function createCategory(userId: string, input: CategoryInput) {
  const category = await prisma.assetCategory.create({
    data: {
      ...input,
      userId
    }
  });

  return mapCategory(category);
}

export async function updateCategory(userId: string, id: string, input: CategoryInput) {
  const category = await prisma.assetCategory.update({
    where: { id_userId: { id, userId } },
    data: input
  });

  return mapCategory(category);
}

export async function deleteCategory(userId: string, id: string) {
  try {
    await prisma.assetCategory.delete({ where: { id_userId: { id, userId } } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new ApiError("该分类下仍有关联资产，无法删除", 409);
    }

    throw error;
  }
}
