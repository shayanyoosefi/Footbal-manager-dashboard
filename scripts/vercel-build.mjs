import { execSync } from "node:child_process";

/** Neon / Vercel Storage may use a custom prefix instead of DATABASE_URL */
function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const candidates = [
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "POSTGRES_URL_NON_POOLING",
    "STORAGE_URL",
    "NEON_DATABASE_URL",
  ];

  for (const key of candidates) {
    if (process.env[key]) {
      console.log(`Using ${key} as DATABASE_URL for Prisma`);
      return process.env[key];
    }
  }

  return null;
}

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl) {
  console.error(
    [
      "No database URL found for build.",
      "In Vercel → Settings → Environment Variables, set DATABASE_URL to your Neon connection string,",
      "or use Custom Prefix DATABASE when connecting Neon (creates DATABASE_URL).",
    ].join("\n"),
  );
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

run("npx prisma generate");
run("npx prisma db push");
run("npx next build");
