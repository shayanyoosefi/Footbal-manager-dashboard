"use server";

import { revalidatePath } from "next/cache";
import { AssignmentStatus, QuestionType, Role, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  assignQuestionSchema,
  answerSchema,
  questionOptionsSchema,
} from "@/lib/validators";
import { getSelectedOptionText, parseOptionsFromFormData } from "@/lib/questions";

function revalidateCoachPaths() {
  revalidatePath("/coach");
  revalidatePath("/coach/questions");
  revalidatePath("/coach/responses");
  revalidatePath("/coach/statistics");
  revalidatePath("/player");
}

function getFirstValidationError(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  const fieldErrors = error.flatten().fieldErrors;
  for (const messages of Object.values(fieldErrors)) {
    const message = messages?.[0];
    if (message) return message;
  }

  return "Invalid assignment data";
}

function parseDueDate(value?: string) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000Z`);
}

export async function assignQuestions(formData: FormData) {
  const session = await requireRole(Role.COACH, Role.ADMIN);

  const playerIdsRaw = formData.get("playerIds");
  const playerIds =
    typeof playerIdsRaw === "string" ? playerIdsRaw.split(",").filter(Boolean) : [];

  const options = parseOptionsFromFormData(formData);

  const raw = {
    playerIds,
    questionId: formData.get("questionId") || undefined,
    customText: formData.get("customText") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    ...options,
  };

  const parsed = assignQuestionSchema.safeParse(raw);
  if (!parsed.success) return { error: getFirstValidationError(parsed.error) };

  const { questionId, customText, dueDate } = parsed.data;
  const coachId = session.user.id;

  try {
    let finalQuestionId = questionId;

    if (customText) {
      const opts = questionOptionsSchema.safeParse({
        text: customText,
        category: "Custom",
        ...options,
      });
      if (!opts.success) return { error: "Custom questions need all 4 answer options" };

      const custom = await prisma.questionTemplate.create({
        data: {
          text: opts.data.text,
          category: opts.data.category ?? "Custom",
          optionA: opts.data.optionA,
          optionB: opts.data.optionB,
          optionC: opts.data.optionC,
          optionD: opts.data.optionD,
          type: QuestionType.CUSTOM,
          authorId: coachId,
        },
      });
      finalQuestionId = custom.id;
    }

    if (!finalQuestionId) {
      return { error: "Select a question or create a custom one with 4 options" };
    }

    const questionWhere: Prisma.QuestionTemplateWhereInput = {
      id: finalQuestionId,
      isActive: true,
      ...(session.user.role === Role.COACH && !customText
        ? {
            OR: [{ type: QuestionType.PREDEFINED }, { authorId: coachId }],
          }
        : {}),
    };

    const question = await prisma.questionTemplate.findFirst({
      where: questionWhere,
      select: { id: true },
    });

    if (!question) {
      return { error: "Question not found or not available to you" };
    }

    const players = await prisma.playerProfile.findMany({
      where: {
        id: { in: parsed.data.playerIds },
        ...(session.user.role === Role.COACH ? { coachId } : {}),
      },
    });

    if (players.length !== parsed.data.playerIds.length) {
      return { error: "Some players were not found or not in your squad" };
    }

    await prisma.questionAssignment.createMany({
      data: players.map((p) => ({
        coachId: session.user.role === Role.ADMIN ? p.coachId : coachId,
        playerId: p.id,
        questionId: finalQuestionId,
        dueDate: parseDueDate(dueDate),
      })),
    });

    revalidateCoachPaths();
    revalidatePath("/admin/assignments");
    revalidatePath("/admin/responses");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign questions", {
      userId: session.user.id,
      role: session.user.role,
      playerCount: parsed.data.playerIds.length,
      questionId,
      hasCustomText: Boolean(customText),
      error,
    });
    return { error: "Could not send the question. The server log has more details." };
  }
}

export async function submitAnswer(assignmentId: string, formData: FormData) {
  const session = await requireRole(Role.PLAYER);

  const parsed = answerSchema.safeParse({
    selectedOption: formData.get("selectedOption"),
  });
  if (!parsed.success) return { error: "Please select an option" };

  const profile = await prisma.playerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { error: "Player profile not found" };

  const assignment = await prisma.questionAssignment.findFirst({
    where: { id: assignmentId, playerId: profile.id },
    include: { question: true },
  });
  if (!assignment) return { error: "Assignment not found" };

  const selectedOption = parsed.data.selectedOption;
  const text = getSelectedOptionText(assignment.question, selectedOption);

  await prisma.$transaction([
    prisma.answer.upsert({
      where: { assignmentId },
      create: { assignmentId, selectedOption, text },
      update: { selectedOption, text },
    }),
    prisma.questionAssignment.update({
      where: { id: assignmentId },
      data: { status: AssignmentStatus.ANSWERED },
    }),
  ]);

  revalidateCoachPaths();
  return { success: true };
}

export async function createPredefinedQuestion(formData: FormData) {
  await requireRole(Role.ADMIN);

  const parsed = questionOptionsSchema.safeParse({
    text: formData.get("text"),
    category: formData.get("category") || undefined,
    ...parseOptionsFromFormData(formData),
  });
  if (!parsed.success) return { error: "Invalid question — need text, category, and 4 options" };

  await prisma.questionTemplate.create({
    data: {
      ...parsed.data,
      category: parsed.data.category ?? "General",
      type: QuestionType.PREDEFINED,
    },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/coach/questions");
  return { success: true };
}

export async function saveCustomQuestionTemplate(formData: FormData) {
  const session = await requireRole(Role.COACH);

  const parsed = questionOptionsSchema.safeParse({
    text: formData.get("text"),
    category: formData.get("category") || undefined,
    ...parseOptionsFromFormData(formData),
  });
  if (!parsed.success) return { error: "Invalid question — need 4 answer options" };

  await prisma.questionTemplate.create({
    data: {
      ...parsed.data,
      category: parsed.data.category ?? "Custom",
      type: QuestionType.CUSTOM,
      authorId: session.user.id,
    },
  });

  revalidatePath("/coach/questions");
  return { success: true };
}
