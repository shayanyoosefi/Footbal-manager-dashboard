"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createUserSchema } from "@/lib/validators";

export async function createUser(formData: FormData) {
  await requireRole(Role.ADMIN);

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    coachId: formData.get("coachId") || undefined,
    position: formData.get("position") || undefined,
    squad: formData.get("squad") || undefined,
    jerseyNo: formData.get("jerseyNo") || undefined,
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  if (data.role === Role.PLAYER && !data.coachId) {
    return { error: { coachId: ["Coach is required for players"] } };
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    return { error: { email: ["Email already in use"] } };
  }

  const passwordHash = await hash(data.password, 12);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      ...(data.role === Role.PLAYER && data.coachId
        ? {
            playerProfile: {
              create: {
                coachId: data.coachId,
                position: data.position,
                squad: data.squad,
                jerseyNo: data.jerseyNo ?? undefined,
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/assignments");
  revalidatePath("/coach");
  revalidatePath("/coach/players");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await requireRole(Role.ADMIN);
  if (session.user.id === userId) {
    return { error: "Cannot delete your own account" };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { success: true };
}
