import { Router } from 'express';
import {
  EMISSION_FACTORS,
  STATE_AFFORESTATION,
  METHODOLOGY_SOURCES,
} from '../constants/emissionFactors.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    emissionFactors: EMISSION_FACTORS,
    states: Object.entries(STATE_AFFORESTATION).map(([name, profile]) => ({
      name,
      ...profile,
    })),
    sources: METHODOLOGY_SOURCES,
  });
});

export default router;