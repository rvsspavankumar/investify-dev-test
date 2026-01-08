import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const res = await requireUser();
  if (!res.ok) {
    return NextResponse.json({ error: res.message }, { status: res.status });
  }

  return NextResponse.json({
    id: res.user.id,
    email: res.user.email,
    role: res.user.role,
    profile: res.user.profile,
  });
}
