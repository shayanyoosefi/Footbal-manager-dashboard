import { PrismaClient, Role, QuestionType } from "@prisma/client";
import { hash } from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  console.error(`
Invalid DATABASE_URL for seeding production.

You need the Postgres connection string from Vercel or Neon, for example:
  postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

Do NOT use the Neon website URL (https://console.neon.tech/...).

Steps:
  1. Vercel → Project → Settings → Environment Variables → DATABASE_URL → copy value
  2. export DATABASE_URL="postgresql://..."
  3. npm run db:seed
`);
  process.exit(1);
}

const prisma = new PrismaClient();

const PREDEFINED_QUESTIONS = [
  { text: "How did you feel during today's training session?", category: "Wellbeing" },
  { text: "Rate your energy level from 1–10 after the match.", category: "Fitness" },
  { text: "What was your main focus area in training this week?", category: "Development" },
  { text: "Did you experience any pain or discomfort?", category: "Health" },
  { text: "What is one skill you want to improve before next week?", category: "Goals" },
  { text: "How many hours of sleep did you get last night?", category: "Recovery" },
  { text: "Describe your nutrition before today's session.", category: "Nutrition" },
  { text: "What tactical instruction was hardest to apply?", category: "Tactics" },
  { text: "How confident do you feel about your role in the team?", category: "Mindset" },
  { text: "Any feedback for the coaching staff?", category: "Feedback" },
];

async function main() {
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

  const manager = await prisma.user.create({
    data: {
      email: "manager@academy.com",
      name: "Alex Coach",
      passwordHash,
      role: Role.MANAGER,
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
          managerId: manager.id,
          position: "Forward",
          squad: "U18",
          jerseyNo: 9,
        },
      },
    },
  });

  const player2User = await prisma.user.create({
    data: {
      email: "player2@academy.com",
      name: "Sam Midfielder",
      passwordHash,
      role: Role.PLAYER,
      playerProfile: {
        create: {
          managerId: manager.id,
          position: "Midfielder",
          squad: "U18",
          jerseyNo: 8,
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

  const wellbeingQ = await prisma.questionTemplate.findFirst({
    where: { category: "Wellbeing" },
  });

  const playerProfile = await prisma.playerProfile.findUnique({
    where: { userId: playerUser.id },
  });

  if (wellbeingQ && playerProfile) {
    await prisma.questionAssignment.create({
      data: {
        managerId: manager.id,
        playerId: playerProfile.id,
        questionId: wellbeingQ.id,
        status: "PENDING",
      },
    });
  }

  console.log("Seed complete:");
  console.log("  Admin:   admin@academy.com / password123");
  console.log("  Manager: manager@academy.com / password123");
  console.log("  Player:  player@academy.com / password123");
  console.log("  Player2: player2@academy.com / password123");
  console.log(`  Admin ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
