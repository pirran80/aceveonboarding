-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legalName" TEXT NOT NULL,
    "prefix" TEXT,
    "orgNumber" TEXT,
    "invoiceAddress" TEXT,
    "country" TEXT NOT NULL DEFAULT 'SE',
    "language" TEXT NOT NULL DEFAULT 'sv',
    "sfAccountId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OnboardingCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisationId" TEXT NOT NULL,
    "registryFlow" TEXT NOT NULL,
    "boundProduct" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "agreementConfirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingCase_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "inviteState" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseUser_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OnboardingCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    "completedAt" DATETIME,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StepInstance_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OnboardingCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "assigneeId" TEXT,
    "method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "stagedRowsJson" TEXT,
    "sourceFileName" TEXT,
    "detectedSchema" TEXT,
    "validationJson" TEXT,
    "customerApprovedAt" DATETIME,
    "aceveApprovedAt" DATETIME,
    "importReceiptJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DataSet_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OnboardingCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DataSet_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "CaseUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MappingEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legacySystem" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "sourceColumn" TEXT NOT NULL,
    "approvedCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "CaseUser_caseId_idx" ON "CaseUser"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "StepInstance_caseId_stepId_key" ON "StepInstance"("caseId", "stepId");

-- CreateIndex
CREATE INDEX "DataSet_caseId_idx" ON "DataSet"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSet_caseId_moduleId_version_key" ON "DataSet"("caseId", "moduleId", "version");

-- CreateIndex
CREATE INDEX "MappingEntry_legacySystem_moduleId_idx" ON "MappingEntry"("legacySystem", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "MappingEntry_legacySystem_moduleId_fieldId_sourceColumn_key" ON "MappingEntry"("legacySystem", "moduleId", "fieldId", "sourceColumn");
