import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  const auth = await requireRole([Role.APPLICANT]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const items = await prisma.verificationRequest.findMany({
    where: { applicantUserId: auth.user.id },
    orderBy: { submittedAt: "desc" },
    include: { evidence: true, events: { orderBy: { timestamp: "asc" } } },
  });

  return NextResponse.json({ ok: true, items });
}
