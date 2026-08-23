import { getPrisma } from "./prisma";

export async function logActivity(
  userId: number | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: string | null
) {
  const prisma = getPrisma();
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId: entityId ?? null,
      details: details ?? null,
    },
  });
}
