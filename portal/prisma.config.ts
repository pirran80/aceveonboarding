import { defineConfig } from "prisma/config";

// Prisma 7 CLI configuration. The runtime connection lives in src/lib/db.ts
// (driver adapter) — this file is what `prisma migrate` etc. read.
try {
  process.loadEnvFile();
} catch {
  // no .env file — fall back to the environment as-is
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
