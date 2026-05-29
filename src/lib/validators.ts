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
function isValidDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const optionalOptionField = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  optionField.optional(),
);
const optionalDateField = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .refine((value) => isValidDateInput(value), {
      message: "Use a valid date",
    })
    .optional(),
);

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
  questionId: z.string().min(1).optional(),
  customText: z.string().min(5).max(500).optional(),
  optionA: optionalOptionField,
  optionB: optionalOptionField,
  optionC: optionalOptionField,
  optionD: optionalOptionField,
  dueDate: optionalDateField,
});

export const answerSchema = z.object({
  selectedOption: z.coerce.number().int().min(0).max(3),
});
