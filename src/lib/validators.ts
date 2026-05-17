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
  managerId: z.string().optional(),
  position: z.string().optional(),
  squad: z.string().optional(),
  jerseyNo: z.coerce.number().int().min(1).max(99).optional(),
});

export const updatePlayerSchema = z.object({
  position: z.string().optional(),
  squad: z.string().optional(),
  jerseyNo: z.coerce.number().int().min(1).max(99).optional().nullable(),
});

export const assignQuestionSchema = z.object({
  playerIds: z.array(z.string()).min(1),
  questionId: z.string().optional(),
  customText: z.string().min(5).max(500).optional(),
  dueDate: z.string().optional(),
});

export const answerSchema = z.object({
  text: z.string().min(1).max(2000),
});

export const customQuestionSchema = z.object({
  text: z.string().min(5).max(500),
  category: z.string().max(50).optional(),
});
