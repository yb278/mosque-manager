-- CreateTable
CREATE TABLE "OutcomeProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "outcomeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "completePct" REAL NOT NULL DEFAULT 0,
    "reasonForDelay" TEXT,
    "notes" TEXT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutcomeProgress_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Milestone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "outcomeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Milestone_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("description", "id", "outcomeId", "targetDate") SELECT "description", "id", "outcomeId", "targetDate" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
CREATE TABLE "new_Outcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "focusAreaId" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "benefit" TEXT,
    "startingPoint" TEXT,
    "department" TEXT,
    "reportedToOpex" TEXT,
    "riskLevel" TEXT,
    "riskIfNot" TEXT,
    "targetDate" TEXT,
    "desiredOutcome" TEXT,
    "milestoneCount" INTEGER,
    "actions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "reasonForDelay" TEXT,
    "completePct" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Outcome_focusAreaId_fkey" FOREIGN KEY ("focusAreaId") REFERENCES "FocusArea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Outcome" ("actions", "archived", "benefit", "completePct", "department", "desiredOutcome", "focusAreaId", "id", "isValid", "milestoneCount", "notes", "reasonForDelay", "reportedToOpex", "riskIfNot", "riskLevel", "startingPoint", "status", "targetDate", "title") SELECT "actions", "archived", "benefit", "completePct", "department", "desiredOutcome", "focusAreaId", "id", "isValid", "milestoneCount", "notes", "reasonForDelay", "reportedToOpex", "riskIfNot", "riskLevel", "startingPoint", "status", "targetDate", "title" FROM "Outcome";
DROP TABLE "Outcome";
ALTER TABLE "new_Outcome" RENAME TO "Outcome";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "id", "mustChangePassword", "name", "passwordHash", "role") SELECT "createdAt", "email", "id", "mustChangePassword", "name", "passwordHash", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "OutcomeProgress_outcomeId_createdAt_idx" ON "OutcomeProgress"("outcomeId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
