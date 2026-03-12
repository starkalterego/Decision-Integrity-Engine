-- AlterTable
ALTER TABLE "CapacityDemand" ADD COLUMN     "roleId" TEXT;

-- AlterTable
ALTER TABLE "Initiative" ADD COLUMN     "capexCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "costOfDelay" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "lifecycleState" TEXT NOT NULL DEFAULT 'IDEA',
ADD COLUMN     "objectiveId" TEXT,
ADD COLUMN     "opexCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "strategyScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "StrategicObjective" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategicObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleCapacity" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "availableUnits" INTEGER NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitiativeRisk" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "impact" DOUBLE PRECISION NOT NULL,
    "exposure" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InitiativeRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioMetrics" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCapex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOpex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCapacity" INTEGER NOT NULL DEFAULT 0,
    "avgRiskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fundedCount" INTEGER NOT NULL DEFAULT 0,
    "pausedCount" INTEGER NOT NULL DEFAULT 0,
    "stoppedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrategicObjective_portfolioId_idx" ON "StrategicObjective"("portfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "RoleCapacity_portfolioId_idx" ON "RoleCapacity"("portfolioId");

-- CreateIndex
CREATE INDEX "RoleCapacity_roleId_idx" ON "RoleCapacity"("roleId");

-- CreateIndex
CREATE INDEX "InitiativeRisk_initiativeId_idx" ON "InitiativeRisk"("initiativeId");

-- CreateIndex
CREATE INDEX "InitiativeRisk_status_idx" ON "InitiativeRisk"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioMetrics_scenarioId_key" ON "ScenarioMetrics"("scenarioId");

-- CreateIndex
CREATE INDEX "CapacityDemand_initiativeId_idx" ON "CapacityDemand"("initiativeId");

-- CreateIndex
CREATE INDEX "CapacityDemand_roleId_idx" ON "CapacityDemand"("roleId");

-- CreateIndex
CREATE INDEX "GovernanceDecisionRecord_portfolioId_idx" ON "GovernanceDecisionRecord"("portfolioId");

-- CreateIndex
CREATE INDEX "GovernanceDecisionRecord_actionType_idx" ON "GovernanceDecisionRecord"("actionType");

-- CreateIndex
CREATE INDEX "GovernanceDecisionRecord_createdAt_idx" ON "GovernanceDecisionRecord"("createdAt");

-- CreateIndex
CREATE INDEX "Initiative_portfolioId_idx" ON "Initiative"("portfolioId");

-- CreateIndex
CREATE INDEX "Initiative_priorityScore_idx" ON "Initiative"("priorityScore");

-- CreateIndex
CREATE INDEX "Initiative_isComplete_idx" ON "Initiative"("isComplete");

-- CreateIndex
CREATE INDEX "Initiative_lifecycleState_idx" ON "Initiative"("lifecycleState");

-- CreateIndex
CREATE INDEX "Initiative_objectiveId_idx" ON "Initiative"("objectiveId");

-- CreateIndex
CREATE INDEX "Portfolio_userId_idx" ON "Portfolio"("userId");

-- CreateIndex
CREATE INDEX "Portfolio_status_idx" ON "Portfolio"("status");

-- CreateIndex
CREATE INDEX "Portfolio_createdAt_idx" ON "Portfolio"("createdAt");

-- CreateIndex
CREATE INDEX "Scenario_portfolioId_idx" ON "Scenario"("portfolioId");

-- CreateIndex
CREATE INDEX "Scenario_isFinalized_idx" ON "Scenario"("isFinalized");

-- CreateIndex
CREATE INDEX "Scenario_isRecommended_idx" ON "Scenario"("isRecommended");

-- AddForeignKey
ALTER TABLE "StrategicObjective" ADD CONSTRAINT "StrategicObjective_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "StrategicObjective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCapacity" ADD CONSTRAINT "RoleCapacity_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCapacity" ADD CONSTRAINT "RoleCapacity_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityDemand" ADD CONSTRAINT "CapacityDemand_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeRisk" ADD CONSTRAINT "InitiativeRisk_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioMetrics" ADD CONSTRAINT "ScenarioMetrics_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
