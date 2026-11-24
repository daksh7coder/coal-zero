-- CreateTable
CREATE TABLE "Mine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "mineType" TEXT NOT NULL,
    "workerCount" INTEGER NOT NULL,
    "existingAfforestationHa" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mineId" INTEGER NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "coalProducedTonnes" REAL NOT NULL,
    "excavationDieselL" REAL NOT NULL,
    "transportDieselL" REAL NOT NULL,
    "equipmentDieselL" REAL NOT NULL,
    "electricityKwh" REAL NOT NULL,
    "explosivesTonnes" REAL NOT NULL,
    "totalEmissionsTco2" REAL NOT NULL,
    "perCapitaTco2" REAL NOT NULL,
    "existingSinkTco2" REAL NOT NULL,
    "netGapTco2" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mineId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "evShiftPct" REAL NOT NULL DEFAULT 0,
    "renewablePct" REAL NOT NULL DEFAULT 0,
    "methaneCapturePct" REAL NOT NULL DEFAULT 0,
    "creditPriceInr" REAL NOT NULL DEFAULT 1200,
    "reducedTco2" REAL NOT NULL,
    "remainingGapTco2" REAL NOT NULL,
    "requiredLandHa" REAL NOT NULL,
    "requiredTrees" INTEGER NOT NULL,
    "creditValueInr" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Simulation_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
