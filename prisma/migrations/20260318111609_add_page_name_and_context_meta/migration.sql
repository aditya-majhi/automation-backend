-- CreateEnum
CREATE TYPE "VariableKind" AS ENUM ('input', 'output');

-- CreateEnum
CREATE TYPE "VariableContext" AS ENUM ('formField', 'table', 'modal', 'sidebar', 'navbar', 'accordion', 'card', 'toolbar', 'footer', 'tabPanel', 'dropdown');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('string', 'text', 'number', 'boolean', 'email', 'url', 'phone', 'date', 'datetime', 'time', 'password', 'color', 'file', 'enum');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "variables" JSONB DEFAULT '[]',
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "VariableKind" NOT NULL,
    "context" "VariableContext" NOT NULL DEFAULT 'formField',
    "dataType" "DataType" NOT NULL DEFAULT 'string',
    "selectorCss" TEXT,
    "selectorXpath" TEXT,
    "selectorRelativeXpath" TEXT,
    "value" TEXT,
    "tableRowIndex" INTEGER,
    "tableColumnIndex" INTEGER,
    "tableColumnHeader" TEXT,
    "enumValues" JSONB,
    "targetTag" TEXT,
    "inputType" TEXT,
    "pageUrl" TEXT,
    "pageTitle" TEXT,
    "pageName" TEXT,
    "contextMeta" JSONB,
    "testCaseId" TEXT NOT NULL,
    "recordingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "selectorCss" TEXT,
    "selectorXpath" TEXT,
    "selectorRelativeXpath" TEXT,
    "value" TEXT,
    "targetTag" TEXT,
    "timestamp" BIGINT,
    "stepOrder" INTEGER NOT NULL DEFAULT 0,
    "pageUrl" TEXT,
    "pageTitle" TEXT,
    "pageName" TEXT,
    "contextMeta" JSONB,
    "recordingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Variable_testCaseId_idx" ON "Variable"("testCaseId");

-- CreateIndex
CREATE INDEX "Variable_recordingId_idx" ON "Variable"("recordingId");

-- CreateIndex
CREATE INDEX "Variable_kind_idx" ON "Variable"("kind");

-- CreateIndex
CREATE INDEX "Step_recordingId_idx" ON "Step"("recordingId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording"("id") ON DELETE CASCADE ON UPDATE CASCADE;
