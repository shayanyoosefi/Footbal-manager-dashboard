const FALLBACK_KEYS = [
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "STORAGE_URL",
  "NEON_DATABASE_URL",
] as const;

/** Map Vercel/Neon integration env names to Prisma's DATABASE_URL */
export function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  for (const key of FALLBACK_KEYS) {
    const value = process.env[key];
    if (value) {
      process.env.DATABASE_URL = value;
      return value;
    }
  }

  return undefined;
}

ensureDatabaseUrl();
