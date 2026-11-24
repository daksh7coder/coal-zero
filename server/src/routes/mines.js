import { Router } from 'express';
import prisma from '../lib/prisma.js';
import {
  calculateEmissions,
  simulateNeutralityPathway,
} from '../utils/carbonCalculator.js';

const router = Router();

const attachBreakdown = (mine, log) => {
  const calc = calculateEmissions({
    mineType: mine.mineType,
    state: mine.state,
    workerCount: mine.workerCount,
    existingAfforestationHa: mine.existingAfforestationHa,
    coalProducedTonnes: log.coalProducedTonnes,
    excavationDieselL: log.excavationDieselL,
    transportDieselL: log.transportDieselL,
    equipmentDieselL: log.equipmentDieselL,
    electricityKwh: log.electricityKwh,
    explosivesTonnes: log.explosivesTonnes,
  });
  return { ...log, breakdown: calc.breakdown, stateProfile: calc.stateProfile };
};

// GET /api/mines — List all mines with latest log summary
router.get('/', async (req, res) => {
  try {
    const mines = await prisma.mine.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        logs: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { logs: true, simulations: true } },
      },
    });
    res.json(mines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mines', details: err.message });
  }
});

// POST /api/mines — Register a new coal mine
router.post('/', async (req, res) => {
  try {
    const { name, state, mineType, workerCount, existingAfforestationHa = 0 } = req.body;

    if (!name || !state || !mineType || !workerCount) {
      return res.status(400).json({ error: 'name, state, mineType, and workerCount are required' });
    }

    const mine = await prisma.mine.create({
      data: {
        name: name.trim(),
        state,
        mineType: mineType === 'UNDERGROUND' ? 'UNDERGROUND' : 'OPEN_CAST',
        workerCount: Number(workerCount),
        existingAfforestationHa: Number(existingAfforestationHa) || 0,
      },
    });

    res.status(201).json(mine);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mine', details: err.message });
  }
});

// GET /api/mines/:id — Get full mine profile, enriched logs, and saved simulations
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid mine ID' });

    const mine = await prisma.mine.findUnique({
      where: { id },
      include: {
        logs: { orderBy: { createdAt: 'desc' } },
        simulations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!mine) return res.status(404).json({ error: 'Mine not found' });

    const enrichedLogs = mine.logs.map((log) => attachBreakdown(mine, log));
    res.json({ ...mine, logs: enrichedLogs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mine', details: err.message });
  }
});

// DELETE /api/mines/:id — Delete a mine and its logs/simulations
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid mine ID' });

    await prisma.mine.delete({ where: { id } });
    res.json({ deleted: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mine', details: err.message });
  }
});

// POST /api/mines/:id/logs — Log mining activity and compute emissions + gap
router.post('/:id/logs', async (req, res) => {
  try {
    const mineId = Number(req.params.id);
    const mine = await prisma.mine.findUnique({ where: { id: mineId } });
    if (!mine) return res.status(404).json({ error: 'Mine not found' });

    const payload = {
      periodLabel: req.body.periodLabel || 'FY 2025-26',
      coalProducedTonnes: Number(req.body.coalProducedTonnes) || 0,
      excavationDieselL: Number(req.body.excavationDieselL) || 0,
      transportDieselL: Number(req.body.transportDieselL) || 0,
      equipmentDieselL: Number(req.body.equipmentDieselL) || 0,
      electricityKwh: Number(req.body.electricityKwh) || 0,
      explosivesTonnes: Number(req.body.explosivesTonnes) || 0,
    };

    const result = calculateEmissions({
      mineType: mine.mineType,
      state: mine.state,
      workerCount: mine.workerCount,
      existingAfforestationHa: mine.existingAfforestationHa,
      ...payload,
    });

    const log = await prisma.activityLog.create({
      data: {
        mineId,
        ...payload,
        totalEmissionsTco2: result.totalEmissionsTco2,
        perCapitaTco2: result.perCapitaTco2,
        existingSinkTco2: result.existingSinkTco2,
        netGapTco2: result.netGapTco2,
      },
    });

    res.status(201).json({
      ...log,
      breakdown: result.breakdown,
      stateProfile: result.stateProfile,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save activity log', details: err.message });
  }
});

// POST /api/mines/:id/simulate — Simulate pathway (optionally save with save: true)
router.post('/:id/simulate', async (req, res) => {
  try {
    const mineId = Number(req.params.id);
    const mine = await prisma.mine.findUnique({
      where: { id: mineId },
      include: { logs: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!mine) return res.status(404).json({ error: 'Mine not found' });
    if (mine.logs.length === 0) {
      return res.status(400).json({ error: 'Add an activity log before running a simulation' });
    }

    const latestLog = mine.logs[0];
    const emissionResult = calculateEmissions({
      mineType: mine.mineType,
      state: mine.state,
      workerCount: mine.workerCount,
      existingAfforestationHa: mine.existingAfforestationHa,
      coalProducedTonnes: latestLog.coalProducedTonnes,
      excavationDieselL: latestLog.excavationDieselL,
      transportDieselL: latestLog.transportDieselL,
      equipmentDieselL: latestLog.equipmentDieselL,
      electricityKwh: latestLog.electricityKwh,
      explosivesTonnes: latestLog.explosivesTonnes,
    });

    const evShiftPct = Number(req.body.evShiftPct) || 0;
    const renewablePct = Number(req.body.renewablePct) || 0;
    const methaneCapturePct = Number(req.body.methaneCapturePct) || 0;
    const creditPriceInr = Number(req.body.creditPriceInr) || 1200;

    const simulation = simulateNeutralityPathway(emissionResult, {
      state: mine.state,
      evShiftPct,
      renewablePct,
      methaneCapturePct,
      creditPriceInr,
    });

    let savedRecord = null;
    if (req.body.save) {
      savedRecord = await prisma.simulation.create({
        data: {
          mineId,
          name: req.body.name?.trim() || 'Net-Zero Scenario',
          evShiftPct,
          renewablePct,
          methaneCapturePct,
          creditPriceInr,
          reducedTco2: simulation.reductions.totalReducedTco2,
          remainingGapTco2: simulation.remainingGapTco2,
          requiredLandHa: simulation.afforestationPlan.requiredLandHa,
          requiredTrees: simulation.afforestationPlan.requiredTrees,
          creditValueInr: simulation.carbonCredits.estimatedValueInr,
        },
      });
    }

    res.status(req.body.save ? 201 : 200).json({
      baseline: emissionResult,
      simulation,
      savedRecord,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run simulation', details: err.message });
  }
});

export default router;