let databaseUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  "";

if (databaseUrl.includes("channel_binding=")) {
  const url = new URL(databaseUrl);
  url.searchParams.delete("channel_binding");
  databaseUrl = url.toString();
}

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  console.error(`
Invalid DATABASE_URL for local seed.

Use the postgresql:// string from Vercel → Settings → Environment Variables → DATABASE_URL.

If local seed fails with "Can't reach database server", seed from production instead:
  1. Add SETUP_SECRET in Vercel env vars
  2. Open https://your-app.vercel.app/api/setup/seed?secret=YOUR_SECRET
`);
  process.exit(1);
}

if (databaseUrl.includes("-pooler.")) {
  databaseUrl = databaseUrl.replace("-pooler.", ".");
  console.log("Using direct Neon host for seed (non-pooler)");
}

process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = databaseUrl;

async function main() {
  const [{ prisma }, { seedDatabase }] = await Promise.all([
    import("../src/lib/prisma"),
    import("../src/lib/seed-database"),
  ]);

  const result = await seedDatabase();
  console.log("Seed complete:");
  for (const a of result.accounts) {
    console.log(`  ${a.role}: ${a.email} / ${a.password}`);
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
