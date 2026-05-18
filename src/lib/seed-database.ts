import { hash } from "bcryptjs";
import { QuestionType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSelectedOptionText } from "@/lib/questions";

const PREDEFINED_QUESTIONS = [
  {
    text: "How did you feel during today's training session?",
    category: "Wellbeing",
    optionA: "Excellent — full of energy",
    optionB: "Good — normal effort",
    optionC: "Tired — below usual",
    optionD: "Struggling — need recovery",
  },
  {
    text: "Rate your energy level after the match.",
    category: "Fitness",
    optionA: "Very high (9–10)",
    optionB: "Moderate (6–8)",
    optionC: "Low (4–5)",
    optionD: "Very low (1–3)",
  },
  {
    text: "What was your main focus in training this week?",
    category: "Development",
    optionA: "Technical skills",
    optionB: "Tactical awareness",
    optionC: "Physical conditioning",
    optionD: "Mental / confidence",
  },
  {
    text: "Did you experience any pain or discomfort?",
    category: "Health",
    optionA: "No issues",
    optionB: "Minor soreness only",
    optionC: "Noticeable discomfort",
    optionD: "Pain — need to report",
  },
  {
    text: "How many hours of sleep did you get last night?",
    category: "Recovery",
    optionA: "8+ hours",
    optionB: "6–7 hours",
    optionC: "4–5 hours",
    optionD: "Less than 4 hours",
  },
  {
    text: "How confident do you feel about your role in the team?",
    category: "Mindset",
    optionA: "Very confident",
    optionB: "Fairly confident",
    optionC: "Unsure",
    optionD: "Not confident",
  },
];

export async function seedDatabase() {
  await prisma.answer.deleteMany();
  await prisma.questionAssignment.deleteMany();
  await prisma.questionTemplate.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@academy.com",
      name: "Academy Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const coach = await prisma.user.create({
    data: {
      email: "coach@academy.com",
      name: "Alex Coach",
      passwordHash,
      role: Role.COACH,
    },
  });

  const playerUser = await prisma.user.create({
    data: {
      email: "player@academy.com",
      name: "Jamie Striker",
      passwordHash,
      role: Role.PLAYER,
      playerProfile: {
        create: {
          coachId: coach.id,
          position: "Forward",
          squad: "U18",
          jerseyNo: 9,
        },
      },
    },
  });

  const player2 = await prisma.user.create({
    data: {
      email: "player2@academy.com",
      name: "Sam Midfielder",
      passwordHash,
      role: Role.PLAYER,
      playerProfile: {
        create: {
          coachId: coach.id,
          position: "Midfielder",
          squad: "U18",
          jerseyNo: 8,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "player3@academy.com",
      name: "Taylor Defender",
      passwordHash,
      role: Role.PLAYER,
      playerProfile: {
        create: {
          coachId: coach.id,
          position: "Defender",
          squad: "U18",
          jerseyNo: 4,
        },
      },
    },
  });

  await prisma.questionTemplate.createMany({
    data: PREDEFINED_QUESTIONS.map((q) => ({
      ...q,
      type: QuestionType.PREDEFINED,
    })),
  });

  const questions = await prisma.questionTemplate.findMany();
  const jamie = await prisma.playerProfile.findUnique({ where: { userId: playerUser.id } });
  const sam = await prisma.playerProfile.findUnique({ where: { userId: player2.id } });

  if (!jamie || !sam || questions.length === 0) {
    return buildResult(admin.id);
  }

  const wellbeingQ = questions.find((q) => q.category === "Wellbeing")!;
  const fitnessQ = questions.find((q) => q.category === "Fitness")!;
  const recoveryQ = questions.find((q) => q.category === "Recovery")!;

  // Pending question for Jamie
  await prisma.questionAssignment.create({
    data: {
      coachId: coach.id,
      playerId: jamie.id,
      questionId: wellbeingQ.id,
    },
  });

  // Answered assignments for statistics demo
  const answeredSpecs = [
    { playerId: jamie.id, question: fitnessQ, option: 1 },
    { playerId: jamie.id, question: recoveryQ, option: 0 },
    { playerId: sam.id, question: wellbeingQ, option: 2 },
    { playerId: sam.id, question: fitnessQ, option: 3 },
  ];

  for (const spec of answeredSpecs) {
    const assignment = await prisma.questionAssignment.create({
      data: {
        coachId: coach.id,
        playerId: spec.playerId,
        questionId: spec.question.id,
      },
    });
    const text = getSelectedOptionText(spec.question, spec.option);
    await prisma.answer.create({
      data: {
        assignmentId: assignment.id,
        selectedOption: spec.option,
        text,
      },
    });
  }

  return buildResult(admin.id);
}

function buildResult(adminId: string) {
  return {
    accounts: [
      { role: "admin", email: "admin@academy.com", password: "password123" },
      { role: "coach", email: "coach@academy.com", password: "password123" },
      { role: "player", email: "player@academy.com", password: "password123" },
      { role: "player", email: "player2@academy.com", password: "password123" },
      { role: "player", email: "player3@academy.com", password: "password123" },
    ],
    adminId,
  };
}
