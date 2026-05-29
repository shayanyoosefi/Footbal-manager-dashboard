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

  try {
    if (data.role === Role.PLAYER) {
      const coach = await prisma.user.findFirst({
        where: { id: data.coachId, role: Role.COACH },
        select: { id: true },
      });

      if (!coach) {
        return { error: { coachId: ["Select a valid coach"] } };
      }
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
  } catch (error) {
    console.error("Failed to create user", {
      email: data.email.toLowerCase(),
      role: data.role,
      error,
    });
    return { error: "Could not create user. The server log has more details." };
  }

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

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        _count: {
          select: {
            coachedPlayers: true,
            assignmentsSent: true,
          },
        },
      },
    });

    if (!user) return { error: "User not found" };

    if (
      user.role === Role.COACH &&
      (user._count.coachedPlayers > 0 || user._count.assignmentsSent > 0)
    ) {
      const blockers = [
        user._count.coachedPlayers > 0
          ? `${user._count.coachedPlayers} assigned player(s)`
          : null,
        user._count.assignmentsSent > 0
          ? `${user._count.assignmentsSent} sent assignment(s)`
          : null,
      ].filter(Boolean);

      return {
        error: `Cannot delete this coach while they have ${blockers.join(
          " and ",
        )}. Reassign players or keep the coach account to preserve assignment history.`,
      };
    }

    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    console.error("Failed to delete user", { userId, error });
    return { error: "Could not delete user. The server log has more details." };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/responses");
  revalidatePath("/coach");
  revalidatePath("/coach/players");
  revalidatePath("/coach/responses");
  revalidatePath("/coach/statistics");
  revalidatePath("/player");
  return { success: true };
}
