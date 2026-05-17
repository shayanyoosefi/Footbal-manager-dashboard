"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createUserSchema, updatePlayerSchema } from "@/lib/validators";

export async function createPlayer(formData: FormData) {
  const session = await requireRole(Role.MANAGER, Role.ADMIN);

  const managerId =
    session.user.role === Role.ADMIN
      ? (formData.get("managerId") as string)
      : session.user.id;

  if (!managerId) return { error: "Manager is required" };

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: Role.PLAYER,
    managerId,
    position: formData.get("position") || undefined,
    squad: formData.get("squad") || undefined,
    jerseyNo: formData.get("jerseyNo") || undefined,
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) return { error: { email: ["Email already in use"] } };

  const passwordHash = await hash(data.password, 12);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: Role.PLAYER,
      playerProfile: {
        create: {
          managerId,
          position: data.position,
          squad: data.squad,
          jerseyNo: data.jerseyNo ?? undefined,
        },
      },
    },
  });

  revalidatePath("/manager/players");
  return { success: true };
}

export async function updatePlayer(playerProfileId: string, formData: FormData) {
  const session = await requireRole(Role.MANAGER, Role.ADMIN);

  const parsed = updatePlayerSchema.safeParse({
    position: formData.get("position") || undefined,
    squad: formData.get("squad") || undefined,
    jerseyNo: formData.get("jerseyNo") || undefined,
  });
  if (!parsed.success) return { error: "Invalid data" };

  const profile = await prisma.playerProfile.findFirst({
    where: {
      id: playerProfileId,
      ...(session.user.role === Role.MANAGER ? { managerId: session.user.id } : {}),
    },
  });
  if (!profile) return { error: "Player not found" };

  await prisma.playerProfile.update({
    where: { id: playerProfileId },
    data: {
      position: parsed.data.position,
      squad: parsed.data.squad,
      jerseyNo: parsed.data.jerseyNo ?? undefined,
    },
  });

  revalidatePath("/manager/players");
  return { success: true };
}
