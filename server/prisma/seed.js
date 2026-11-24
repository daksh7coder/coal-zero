import prisma from '../src/lib/prisma.js';
import {
  calculateEmissions,
  simulateNeutralityPathway,
} from '../src/utils/carbonCalculator.js';

const SAMPLE_MINES = [
  {
    name: 'Gevra Open-Cast Project (SECL)',
    state: 'Chhattisgarh',
    mineType: 'OPEN_CAST',
    workerCount: 2400,
    existingAfforestationHa: 650,
    log: {
      periodLabel: 'FY 2025-26',
      coalProducedTonnes: 1200000,
      excavationDieselL: 1850000,
      transportDieselL: 2600000,
      equipmentDieselL: 720000,
      electricityKwh: 14500000,
      explosivesTonnes: 3400,
    },
    sim: {
      name: '2030 EV Haulage + Solar Plan',
      evShiftPct: 50,
      renewablePct: 65,
      methaneCapturePct: 30,
      creditPriceInr: 1250,
    },
  },
  {
    name: 'Moonidih Underground Mine (BCCL)',
    state: 'Jharkhand',
    mineType: 'UNDERGROUND',
    workerCount: 1650,
    existingAfforestationHa: 180,
    log: {
      periodLabel: 'FY 2025-26',
      coalProducedTonnes: 380000,
      excavationDieselL: 190000,
      transportDieselL: 310000,
      equipmentDieselL: 240000,
      electricityKwh: 11200000,
      explosivesTonnes: 420,
    },
    sim: {
      name: 'Coal-Bed Methane Capture Priority',
      evShiftPct: 30,
      renewablePct: 50,
      methaneCapturePct: 70,
      creditPriceInr: 1400,
    },
  },
  {
    name: 'Talcher Coalfield Block-B (MCL)',
    state: 'Odisha',
    mineType: 'OPEN_CAST',
    workerCount: 1300,
    existingAfforestationHa: 420,
    log: {
      periodLabel: 'FY 2025-26',
      coalProducedTonnes: 750000,
      excavationDieselL: 1100000,
      transportDieselL: 1550000,
      equipmentDieselL: 410000,
      electricityKwh: 8900000,
      explosivesTonnes: 1950,
    },
    sim: {
      name: 'Balanced Green Transition',
      evShiftPct: 40,
      renewablePct: 75,
      methaneCapturePct: 35,
      creditPriceInr: 1200,
    },
  },
];

async function main() {
  const existingCount = await prisma.mine.count();
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} mine(s). Skipping seed.`);
    return;
  }

  for (const item of SAMPLE_MINES) {
    const mine = await prisma.mine.create({
      data: {
        name: item.name,
        state: item.state,
        mineType: item.mineType,
        workerCount: item.workerCount,
        existingAfforestationHa: item.existingAfforestationHa,
      },
    });

    const emissions = calculateEmissions({
      mineType: mine.mineType,
      state: mine.state,
      workerCount: mine.workerCount,
      existingAfforestationHa: mine.existingAfforestationHa,
      ...item.log,
    });

    await prisma.activityLog.create({
      data: {
        mineId: mine.id,
        ...item.log,
        totalEmissionsTco2: emissions.totalEmissionsTco2,
        perCapitaTco2: emissions.perCapitaTco2,
        existingSinkTco2: emissions.existingSinkTco2,
        netGapTco2: emissions.netGapTco2,
      },
    });

    const simResult = simulateNeutralityPathway(emissions, {
      state: mine.state,
      ...item.sim,
    });

    await prisma.simulation.create({
      data: {
        mineId: mine.id,
        ...item.sim,
        reducedTco2: simResult.reductions.totalReducedTco2,
        remainingGapTco2: simResult.remainingGapTco2,
        requiredLandHa: simResult.afforestationPlan.requiredLandHa,
        requiredTrees: simResult.afforestationPlan.requiredTrees,
        creditValueInr: simResult.carbonCredits.estimatedValueInr,
      },
    });
  }

  console.log('Seeded 3 Indian coal mines with activity logs and baseline simulations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());