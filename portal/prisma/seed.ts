import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Demo seed — sample customers only, never real customer data (BUILD-SPEC §12).
 * Login/identity is an open question (STATUS.md Q2); until it lands, the home
 * page lists these seeded cases as entry points.
 *
 * Idempotent per organisation: re-running adds missing demo customers and
 * leaves existing ones untouched. Two customers exist to demonstrate that
 * every onboarding is its own case in a shared database — data isolation is
 * per row (organisationId/caseId), not per database.
 */
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

const demoOrganisations = [
  {
    legalName: "Demo Bygg & Anläggning AB",
    prefix: "DEMO",
    orgNumber: "556000-0000",
    country: "SE",
    language: "sv",
    sfAccountId: "SF-DEMO-0001",
  },
  {
    legalName: "Fjällens VVS & Energi AB",
    prefix: "FJVE",
    orgNumber: "556111-1111",
    country: "SE",
    language: "sv",
    sfAccountId: "SF-DEMO-0002",
  },
];

async function main() {
  for (const org of demoOrganisations) {
    const existing = await prisma.organisation.findFirst({
      where: { sfAccountId: org.sfAccountId },
    });
    if (existing) {
      console.log(`Seed: ${org.legalName} already exists — skipped.`);
      continue;
    }
    await prisma.organisation.create({
      data: {
        ...org,
        cases: { create: { registryFlow: "next-project", status: "active" } },
      },
    });
    console.log(`Seed: created ${org.legalName} with one active onboarding case.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
