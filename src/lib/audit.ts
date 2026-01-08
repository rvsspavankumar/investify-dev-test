import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditLog(params: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue; // ✅ JSON-safe
}) {
  const { actorUserId, action, entityType, entityId, metadata } = params;

  await prisma.auditLog.create({
    data: {
      actorUserId,
      action,
      entityType,
      entityId,
      ...(metadata !== undefined ? { metadata } : {}),
    },
  });
}
