import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as path from "path";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const dbUrl = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const outcomes = await prisma.outcome.findMany();
  let created = 0;
  for (const o of outcomes) {
    const existing = await prisma.outcomeProgress.findFirst({
      where: { outcomeId: o.id },
    });
    if (existing) continue;
    await prisma.outcomeProgress.create({
      data: {
        outcomeId: o.id,
        status: o.status,
        completePct: o.completePct,
        reasonForDelay: o.reasonForDelay,
        notes: o.notes,
        userId: null,
      },
    });
    created++;
  }
  console.log(`Backfilled baseline progress snapshots for ${created} outcomes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
