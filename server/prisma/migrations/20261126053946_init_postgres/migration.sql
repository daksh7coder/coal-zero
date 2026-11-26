-- CreateTable
CREATE TABLE "Mine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "mineType" TEXT NOT NULL,
    "workerCount" INTEGER NOT NULL,
    "existingAfforestationHa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "mineId" INTEGER NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "coalProducedTonnes" DOUBLE PRECISION NOT NULL,
    "excavationDieselL" DOUBLE PRECISION NOT NULL,
    "transportDieselL" DOUBLE PRECISION NOT NULL,
    "equipmentDieselL" DOUBLE PRECISION NOT NULL,
    "electricityKwh" DOUBLE PRECISION NOT NULL,
    "explosivesTonnes" DOUBLE PRECISION NOT NULL,
    "totalEmissionsTco2" DOUBLE PRECISION NOT NULL,
    "perCapitaTco2" DOUBLE PRECISION NOT NULL,
    "existingSinkTco2" DOUBLE PRECISION NOT NULL,
    "netGapTco2" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" SERIAL NOT NULL,
    "mineId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "evShiftPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "renewablePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "methaneCapturePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditPriceInr" DOUBLE PRECISION NOT NULL DEFAULT 1200,
    "reducedTco2" DOUBLE PRECISION NOT NULL,
    "remainingGapTco2" DOUBLE PRECISION NOT NULL,
    "requiredLandHa" DOUBLE PRECISION NOT NULL,
    "requiredTrees" INTEGER NOT NULL,
    "creditValueInr" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
