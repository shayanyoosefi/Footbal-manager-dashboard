"use server";

import { revalidatePath } from "next/cache";
import { AssignmentStatus, QuestionType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { assignQuestionSchema, answerSchema, customQuestionSchema } from "@/lib/validators";

export async function assignQuestions(formData: FormData) {
  const session = await requireRole(Role.MANAGER, Role.ADMIN);

  const playerIdsRaw = formData.get("playerIds");
  const playerIds =
    typeof playerIdsRaw === "string"
      ? playerIdsRaw.split(",").filter(Boolean)
      : [];

  const raw = {
    playerIds,
    questionId: formData.get("questionId") || undefined,
    customText: formData.get("customText") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  };

  const parsed = assignQuestionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid assignment data" };
  }

  const { questionId, customText, dueDate } = parsed.data;
  const managerId = session.user.id;

  let finalQuestionId = questionId;

  if (customText) {
    const custom = await prisma.questionTemplate.create({
      data: {
        text: customText,
        type: QuestionType.CUSTOM,
        authorId: managerId,
        category: "Custom",
      },
    });
    finalQuestionId = custom.id;
  }

  if (!finalQuestionId) {
    return { error: "Select a question or enter custom text" };
  }

  const players = await prisma.playerProfile.findMany({
    where: {
      id: { in: parsed.data.playerIds },
      ...(session.user.role === Role.MANAGER ? { managerId } : {}),
    },
  });

  if (players.length !== parsed.data.playerIds.length) {
    return { error: "Some players were not found or not in your squad" };
  }

  await prisma.questionAssignment.createMany({
    data: players.map((p) => ({
      managerId: session.user.role === Role.ADMIN ? p.managerId : managerId,
      playerId: p.id,
      questionId: finalQuestionId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })),
  });

  revalidatePath("/manager");
  revalidatePath("/manager/questions");
  revalidatePath("/manager/responses");
  revalidatePath("/player");
  return { success: true };
}

export async function submitAnswer(assignmentId: string, formData: FormData) {
  const session = await requireRole(Role.PLAYER);

  const parsed = answerSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success) return { error: "Answer is required" };

  const profile = await prisma.playerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { error: "Player profile not found" };

  const assignment = await prisma.questionAssignment.findFirst({
    where: { id: assignmentId, playerId: profile.id },
  });
  if (!assignment) return { error: "Assignment not found" };

  await prisma.$transaction([
    prisma.answer.upsert({
      where: { assignmentId },
      create: { assignmentId, text: parsed.data.text },
      update: { text: parsed.data.text },
    }),
    prisma.questionAssignment.update({
      where: { id: assignmentId },
      data: { status: AssignmentStatus.ANSWERED },
    }),
  ]);

  revalidatePath("/player");
  revalidatePath("/manager/responses");
  return { success: true };
}

export async function createPredefinedQuestion(formData: FormData) {
  await requireRole(Role.ADMIN);

  const parsed = customQuestionSchema.safeParse({
    text: formData.get("text"),
    category: formData.get("category") || undefined,
  });
  if (!parsed.success) return { error: "Invalid question" };

  await prisma.questionTemplate.create({
    data: {
      text: parsed.data.text,
      category: parsed.data.category ?? "General",
      type: QuestionType.PREDEFINED,
    },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/manager/questions");
  return { success: true };
}

export async function saveCustomQuestionTemplate(formData: FormData) {
  const session = await requireRole(Role.MANAGER);

  const parsed = customQuestionSchema.safeParse({
    text: formData.get("text"),
    category: formData.get("category") || undefined,
  });
  if (!parsed.success) return { error: "Invalid question" };

  await prisma.questionTemplate.create({
    data: {
      text: parsed.data.text,
      category: parsed.data.category ?? "Custom",
      type: QuestionType.CUSTOM,
      authorId: session.user.id,
    },
  });

  revalidatePath("/manager/questions");
  return { success: true };
}
