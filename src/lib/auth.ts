import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

const UID_COOKIE = "uid";

export async function getCurrentUser() {
  const uid = (await cookies()).get(UID_COOKIE)?.value;
  if (!uid) return null;

  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { profile: true },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, status: 401 as const, message: "Not logged in" };
  }
  return { ok: true as const, user };
}

export async function requireRole(allowed: Role[]) {
  const res = await requireUser();
  if (!res.ok) return res;

  if (!allowed.includes(res.user.role)) {
    return { ok: false as const, status: 403 as const, message: "Forbidden" };
  }
  return { ok: true as const, user: res.user };
}
