import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Reset every demo case to a fresh start: removes all answers, people and
 * staged data, and re-opens the agreement gate. Organisations and cases are
 * kept (same URLs keep working). Dev/demo tool — never part of the app.
 *
 * Run: npm run db:reset-demo
 */
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

async function main() {
  // FK order: DataSets reference CaseUsers (assignee), so they go first.
  const dataSets = await prisma.dataSet.deleteMany();
  const steps = await prisma.stepInstance.deleteMany();
  const users = await prisma.caseUser.deleteMany();
  const cases = await prisma.onboardingCase.updateMany({
    data: { status: "active", agreementConfirmedAt: null, submittedAt: null },
  });

  console.log(
    `Reset ${cases.count} case(s): removed ${dataSets.count} dataset(s), ` +
      `${steps.count} step answer(s), ${users.count} user(s).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
