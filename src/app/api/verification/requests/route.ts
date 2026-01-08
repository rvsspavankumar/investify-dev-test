import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, VerificationStatus, LaneType } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const auth = await requireRole([Role.APPLICANT]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);

  const desiredLanes = (body?.desiredLanes ?? []) as LaneType[];
  const note = (body?.note ?? "") as string;
  const evidence = (body?.evidence ?? []) as { url: string; label?: string }[];

  if (!Array.isArray(desiredLanes) || desiredLanes.length === 0) {
    return NextResponse.json({ error: "desiredLanes is required" }, { status: 400 });
  }
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return NextResponse.json({ error: "At least one evidence link is required" }, { status: 400 });
  }

  const vr = await prisma.verificationRequest.create({
    data: {
      applicantUserId: auth.user.id,
      status: VerificationStatus.PENDING_REVIEW,
      note,
      desiredLanes,
      evidence: {
        create: evidence.map((e) => ({
          url: e.url,
          label: e.label ?? null,
        })),
      },
      // Create first history event: UNVERIFIED -> PENDING_REVIEW
      events: {
        create: {
          actorUserId: auth.user.id,
          fromStatus: VerificationStatus.UNVERIFIED,
          toStatus: VerificationStatus.PENDING_REVIEW,
          reasonCode: "SUBMITTED",
          notes: note || null,
        },
      },
    },
    include: { evidence: true, events: true },
  });

  await writeAuditLog({
    actorUserId: auth.user.id,
    action: "VERIFICATION_SUBMITTED",
    entityType: "VerificationRequest",
    entityId: vr.id,
    metadata: { desiredLanes, evidenceCount: evidence.length },
  });

  return NextResponse.json({ ok: true, verificationRequest: vr });
}
