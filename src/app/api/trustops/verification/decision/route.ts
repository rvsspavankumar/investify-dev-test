import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, VerificationStatus } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const auth = await requireRole([Role.TRUST_OPS_ADMIN]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const verificationRequestId = body?.verificationRequestId as string | undefined;
  const toStatus = body?.toStatus as VerificationStatus | undefined;
  const reasonCode = (body?.reasonCode ?? "REVIEWED") as string;
  const notes = (body?.notes ?? "") as string;

  if (!verificationRequestId) {
    return NextResponse.json({ error: "verificationRequestId is required" }, { status: 400 });
  }
  if (!toStatus) {
    return NextResponse.json({ error: "toStatus is required" }, { status: 400 });
  }

  const existing = await prisma.verificationRequest.findUnique({
    where: { id: verificationRequestId },
  });
  if (!existing) {
    return NextResponse.json({ error: "VerificationRequest not found" }, { status: 404 });
  }

  // Update request + append event (history)
  const updated = await prisma.verificationRequest.update({
    where: { id: verificationRequestId },
    data: {
      status: toStatus,
      events: {
        create: {
          actorUserId: auth.user.id,
          fromStatus: existing.status,
          toStatus,
          reasonCode,
          notes: notes || null,
        },
      },
    },
    include: { evidence: true, events: { orderBy: { timestamp: "asc" } } },
  });

  // Optionally also update the applicant Profile badge to reflect status
  await prisma.profile.updateMany({
    where: { userId: existing.applicantUserId },
    data: { verificationStatus: toStatus },
  });

  await writeAuditLog({
    actorUserId: auth.user.id,
    action: "VERIFICATION_DECISION",
    entityType: "VerificationRequest",
    entityId: verificationRequestId,
    metadata: { toStatus, reasonCode },
  });

  return NextResponse.json({ ok: true, verificationRequest: updated });
}
