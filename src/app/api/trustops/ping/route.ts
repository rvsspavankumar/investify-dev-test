import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  const res = await requireRole([Role.TRUST_OPS_ADMIN]);
  if (!res.ok) {
    return NextResponse.json({ error: res.message }, { status: res.status });
  }

  return NextResponse.json({
    ok: true,
    message: "Trust Ops access granted",
    user: { id: res.user.id, email: res.user.email, role: res.user.role },
  });
}
