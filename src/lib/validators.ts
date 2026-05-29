import { z } from "zod";
import { Role } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(Role),
  coachId: z.string().optional(),
  position: z.string().optional(),
  squad: z.string().optional(),
  jerseyNo: z.coerce.number().int().min(1).max(99).optional(),
});

export const updatePlayerSchema = z.object({
  position: z.string().optional(),
  squad: z.string().optional(),
  jerseyNo: z.coerce.number().int().min(1).max(99).optional().nullable(),
});

export const assignPlayerCoachSchema = z.object({
  playerProfileId: z.string().min(1),
  coachId: z.string().min(1),
});

const optionField = z.string().min(1, "Required").max(200);

export const questionOptionsSchema = z.object({
  text: z.string().min(5).max(500),
  category: z.string().max(50).optional(),
  optionA: optionField,
  optionB: optionField,
  optionC: optionField,
  optionD: optionField,
});

export const assignQuestionSchema = z.object({
  playerIds: z.array(z.string()).min(1),
  questionId: z.string().optional(),
  customText: z.string().min(5).max(500).optional(),
  optionA: optionField.optional(),
  optionB: optionField.optional(),
  optionC: optionField.optional(),
  optionD: optionField.optional(),
  dueDate: z.string().optional(),
});

export const answerSchema = z.object({
  selectedOption: z.coerce.number().int().min(0).max(3),
});
