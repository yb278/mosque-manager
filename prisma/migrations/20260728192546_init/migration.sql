-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FocusArea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sltLead" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Outcome" (
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
    CONSTRAINT "Outcome_focusAreaId_fkey" FOREIGN KEY ("focusAreaId") REFERENCES "FocusArea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutcomeAssignment" (
    "outcomeId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("outcomeId", "userId"),
    CONSTRAINT "OutcomeAssignment_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutcomeAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "outcomeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TEXT,
    CONSTRAINT "Milestone_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "OpexReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "focusArea" TEXT NOT NULL,
    "stream" TEXT,
    "reviewDate" TEXT,
    "reviewedBy" TEXT,
    "keyDiscussionPoints" TEXT,
    "actionsAgreed" TEXT,
    "nextSteps" TEXT,
    "personResponsible" TEXT,
    "dateClosed" TEXT,
    "opexSignOff" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
