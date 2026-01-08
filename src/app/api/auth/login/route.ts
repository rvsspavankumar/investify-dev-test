import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true, user });

  // Cookie-based "mock login" for take-home
  res.cookies.set("uid", user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // secure: true, // enable in production
    // i will add maxAge in Project
    // and will use signed JWT ( JSON Web Tokens) in cookies for production level
  });

  return res;
}
