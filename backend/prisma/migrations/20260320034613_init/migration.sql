-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AUDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "userId" TEXT,
    "inputData" JSONB NOT NULL,
    "outputDecision" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "cognitiveConsistency" DOUBLE PRECISION NOT NULL,
    "transparencyIndex" DOUBLE PRECISION NOT NULL,
    "ethicalComplianceRate" DOUBLE PRECISION NOT NULL,
    "adaptationSpeed" DOUBLE PRECISION NOT NULL,
    "selfRepairEfficiency" DOUBLE PRECISION NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReasoningStep" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "layer" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputValue" TEXT NOT NULL,
    "outputValue" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "isInterpretable" BOOLEAN NOT NULL DEFAULT true,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReasoningStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiasFlag" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "biasType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "corrected" BOOLEAN NOT NULL DEFAULT false,
    "correctionNote" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BiasFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EthicsCheck" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EthicsCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceRule" (
    "id" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GovernanceRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ReasoningStep_decisionId_idx" ON "ReasoningStep"("decisionId");

-- CreateIndex
CREATE INDEX "BiasFlag_decisionId_idx" ON "BiasFlag"("decisionId");

-- CreateIndex
CREATE INDEX "EthicsCheck_decisionId_idx" ON "EthicsCheck"("decisionId");

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AiSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReasoningStep" ADD CONSTRAINT "ReasoningStep_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiasFlag" ADD CONSTRAINT "BiasFlag_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EthicsCheck" ADD CONSTRAINT "EthicsCheck_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EthicsCheck" ADD CONSTRAINT "EthicsCheck_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "GovernanceRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceRule" ADD CONSTRAINT "GovernanceRule_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AiSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
