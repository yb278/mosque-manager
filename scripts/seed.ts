import "dotenv/config";
import * as XLSX from "xlsx";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as path from "path";
import { hash } from "bcryptjs";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const dbUrl = `file:${dbPath}`;
process.env.DATABASE_URL = dbUrl;
console.log("DB URL:", dbUrl);
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const FOCUS_AREA_MAP: Record<string, { name: string; sltLead: string }> = {
  "Financial Stability": { name: "Financial Stability", sltLead: "Shaffiq" },
  "Youth Succession Planning": { name: "Youth Succession Planning", sltLead: "Avais" },
  "Wider Community Engagement": { name: "Wider Community Engagement", sltLead: "Matiur" },
  "Building Teams & Leadership": { name: "Building Teams & Leadership", sltLead: "Amer" },
  "Community Activities": { name: "Community Activities", sltLead: "Avais" },
  "Spiritual Focus": { name: "Spiritual Focus", sltLead: "Omar Taha" },
};

const FOCUS_AREA_IDS: Record<string, string> = {
  "Financial Stability": "FS",
  "Youth Succession Planning": "YS",
  "Wider Community Engagement": "WC",
  "Building Teams & Leadership": "BT",
  "Community Activities": "CA",
  "Spiritual Focus": "SF",
};

function parseStatus(s: string | undefined) {
  if (!s) return "not_started";
  const v = s.trim().toLowerCase().replace(/\s+/g, "_");
  if (v === "complete" || v === "completed") return "complete";
  if (v === "in_progress" || v === "in progress") return "in_progress";
  if (v === "delayed") return "delayed";
  if (v === "not_started" || v === "not started") return "not_started";
  return "not_started";
}

function parseBool(s: string | undefined) {
  if (!s) return true;
  return s.trim().toUpperCase() === "YES";
}

function parsePct(s: string | undefined | number) {
  if (s === undefined || s === null || s === "") return 0;
  const n = typeof s === "number" ? s : parseFloat(s as string);
  if (isNaN(n)) return 0;
  return n;
}

async function main() {
  console.log("Reading spreadsheet...");
  const workbook = XLSX.readFile("07__AEC_Strategy_2025-2026_Tracker.xlsx");

  // --- Clear existing data ---
  await prisma.opexReview.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.outcome.deleteMany();
  await prisma.focusArea.deleteMany();
  await prisma.user.deleteMany();

  // --- Seed focus areas ---
  console.log("Seeding focus areas...");
  for (const fa of Object.values(FOCUS_AREA_MAP)) {
    await prisma.focusArea.create({
      data: {
        id: FOCUS_AREA_IDS[fa.name],
        name: fa.name,
        sltLead: fa.sltLead,
      },
    });
  }

  // --- Seed users from Data sheet ---
  console.log("Seeding users...");
  const dataSheet = workbook.Sheets["Data (Master Table)"];
  const dataRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(dataSheet, {
    header: ["_id", "focusArea", "isValid", "title", "benefit", "startingPoint", "department", "reportedToOpex", "responsiblePerson", "riskLevel", "riskIfNot", "targetDate", "desiredOutcome", "milestoneCount", "milestones", "milestoneDates", "actions", "status", "reasonForDelay", "completePct", "notes"],
    defval: "",
    range: 1,
  });

  const userSet = new Set<string>();
  const userRows: { name: string; email: string }[] = [];
  for (const row of dataRows) {
    const persons = String(row.responsiblePerson || "").split("/").map(s => s.trim()).filter(Boolean);
    for (const person of persons) {
      if (person && !userSet.has(person)) {
        userSet.add(person);
        const email = `${person.toLowerCase().replace(/\s+/g, ".")}@aec.org`;
        userRows.push({ name: person, email });
      }
    }
  }

  // Add an admin user
  const adminPassword = await hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@aec.org",
      passwordHash: adminPassword,
      role: "admin",
      mustChangePassword: true,
    },
  });

  for (const u of userRows) {
    const pw = await hash("changeme123", 12);
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: pw,
        role: "editor",
        mustChangePassword: true,
      },
    });
  }

  // Build user lookup
  const allUsers = await prisma.user.findMany();
  const userByEmail = new Map(allUsers.map((u) => [u.email, u]));

  // --- Seed outcomes ---
  console.log("Seeding outcomes...");
  const outcomeAssignments: { outcomeId: string; email: string }[] = [];
  for (const row of dataRows) {
    const focusAreaName = String(row.focusArea || "").trim();
    if (!focusAreaName || !FOCUS_AREA_IDS[focusAreaName]) continue;

    const rawId = String(row._id || "").trim();
    if (!rawId) continue;

    const outcomeId = rawId;
    const persons = String(row.responsiblePerson || "").split("/").map(s => s.trim()).filter(Boolean);

    for (const person of persons) {
      const email = `${person.toLowerCase().replace(/\s+/g, ".")}@aec.org`;
      outcomeAssignments.push({ outcomeId, email });
    }

    await prisma.outcome.create({
      data: {
        id: outcomeId,
        focusAreaId: FOCUS_AREA_IDS[focusAreaName],
        isValid: parseBool(String(row.isValid)),
        title: String(row.title || "").trim() || outcomeId,
        benefit: String(row.benefit || "").trim() || null,
        startingPoint: String(row.startingPoint || "").trim() || null,
        department: String(row.department || "").trim() || null,
        reportedToOpex: String(row.reportedToOpex || "").trim() || null,
        riskLevel: String(row.riskLevel || "").trim() || null,
        riskIfNot: String(row.riskIfNot || "").trim() || null,
        targetDate: String(row.targetDate || "").trim() || null,
        desiredOutcome: String(row.desiredOutcome || "").trim() || null,
        milestoneCount: row.milestoneCount ? Number(row.milestoneCount) || null : null,
        actions: String(row.actions || "").trim() || null,
        status: parseStatus(String(row.status)),
        reasonForDelay: String(row.reasonForDelay || "").trim() || null,
        completePct: parsePct(row.completePct as string | number | undefined),
        notes: String(row.notes || "").trim() || null,
      },
    });
  }

  console.log("Seeding outcome assignments...");
  for (const { outcomeId, email } of outcomeAssignments) {
    const user = userByEmail.get(email);
    if (user) {
      await prisma.outcomeAssignment.create({
        data: { outcomeId, userId: user.id },
      }).catch(() => {});
    }
  }

  // --- Seed milestones from the focus area sheets ---
  console.log("Seeding milestones...");
  const focusAreaNames = Object.keys(FOCUS_AREA_IDS);
  for (const faName of focusAreaNames) {
    const sheet = workbook.Sheets[faName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      header: ["isValid", "title", "benefit", "startingPoint", "department", "reportedToOpex", "responsiblePerson", "riskLevel", "riskIfNot", "targetDate", "desiredOutcome", "milestoneCount", "milestones", "milestoneDates", "actions", "status", "reasonForDelay", "completePct", "notes"],
      defval: "",
      range: 2,
    });

    for (const row of rows) {
      const title = String(row.title || "").trim();
      if (!title) continue;
      const rawMilestones = String(row.milestones || "").trim();
      const rawDates = String(row.milestoneDates || "").trim();
      if (!rawMilestones) continue;

      const prefix = FOCUS_AREA_IDS[faName];
      const outcome = await prisma.outcome.findFirst({
        where: { focusAreaId: prefix, title },
      });
      if (!outcome) continue;

      const milestoneLines = rawMilestones.split("\n").map((s) => s.trim()).filter(Boolean);
      const dateLines = rawDates.split("\n").map((s) => s.trim()).filter(Boolean);

      for (let i = 0; i < milestoneLines.length; i++) {
        const desc = milestoneLines[i].replace(/^\d+\.\s*/, "");
        const date = i < dateLines.length ? dateLines[i] : null;
        const dateClean = date ? date.replace(/^\d+\.\s*/, "").trim() : null;
        await prisma.milestone.create({
          data: {
            outcomeId: outcome.id,
            description: desc,
            targetDate: dateClean || null,
          },
        });
      }
    }
  }

  // --- Seed OPEX reviews ---
  console.log("Seeding OPEX reviews...");
  const opexSheet = workbook.Sheets["OPEX Review Log"];
  if (opexSheet) {
    const opexRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(opexSheet, {
      header: ["focusArea", "stream", "reviewDate", "reviewedBy", "keyDiscussionPoints", "actionsAgreed", "nextSteps", "personResponsible", "dateClosed", "opexSignOff"],
      defval: "",
      range: 1,
    });

    for (const row of opexRows) {
      const fa = String(row.focusArea || "").trim();
      if (!fa) continue;
      await prisma.opexReview.create({
        data: {
          focusArea: fa,
          stream: String(row.stream || "").trim() || null,
          reviewDate: String(row.reviewDate || "").trim() || null,
          reviewedBy: String(row.reviewedBy || "").trim() || null,
          keyDiscussionPoints: String(row.keyDiscussionPoints || "").trim() || null,
          actionsAgreed: String(row.actionsAgreed || "").trim() || null,
          nextSteps: String(row.nextSteps || "").trim() || null,
          personResponsible: String(row.personResponsible || "").trim() || null,
          dateClosed: String(row.dateClosed || "").trim() || null,
          opexSignOff: String(row.opexSignOff || "").trim() || null,
        },
      });
    }
  }

  console.log("Seed complete!");
  console.log(`  Focus Areas: ${focusAreaNames.length}`);
  console.log(`  Users: ${allUsers.length}`);
  console.log(`  Outcomes: ${await prisma.outcome.count()}`);
  console.log(`  Milestones: ${await prisma.milestone.count()}`);
  console.log(`  OPEX Reviews: ${await prisma.opexReview.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
