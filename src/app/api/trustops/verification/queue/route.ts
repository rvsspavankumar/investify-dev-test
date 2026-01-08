import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role, VerificationStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireRole([Role.TRUST_OPS_ADMIN]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const items = await prisma.verificationRequest.findMany({
    where: { status: VerificationStatus.PENDING_REVIEW },
    orderBy: { submittedAt: "asc" },
    include: {
      applicant: { include: { profile: true } },
      evidence: true,
      events: { orderBy: { timestamp: "asc" } },
    },
  });

  return NextResponse.json({ ok: true, items });
}
