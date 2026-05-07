import { prisma } from "@/lib/prisma";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export async function ensureUserProfile(user: AuthenticatedUser) {
  const existing = await prisma.userProfile.findUnique({
    where: { id: user.id }
  });

  if (!existing) {
    return prisma.userProfile.create({
      data: {
        id: user.id,
        email: user.email
      }
    });
  }

  if (existing.email !== user.email) {
    return prisma.userProfile.update({
      where: { id: user.id },
      data: { email: user.email }
    });
  }

  return existing;
}

export async function getUserProfile(userId: string) {
  return prisma.userProfile.findUnique({
    where: { id: userId }
  });
}

export async function updateUserProfile(user: AuthenticatedUser, input: { displayName: string | null }) {
  return prisma.userProfile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
      displayName: input.displayName
    },
    update: {
      email: user.email,
      displayName: input.displayName
    }
  });
}
