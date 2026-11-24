import { EMISSION_FACTORS, STATE_AFFORESTATION } from '../constants/emissionFactors.js';

const round2 = (n) => Math.round(n * 100) / 100;

export function getStateProfile(state) {
  return STATE_AFFORESTATION[state] || STATE_AFFORESTATION.Jharkhand;
}

export function calculateEmissions({
  mineType,
  state,
  workerCount,
  existingAfforestationHa = 0,
  coalProducedTonnes = 0,
  excavationDieselL = 0,
  transportDieselL = 0,
  equipmentDieselL = 0,
  electricityKwh = 0,
  explosivesTonnes = 0,
}) {
  const dieselFactor = EMISSION_FACTORS.DIESEL_KG_CO2_PER_LITRE / 1000;
  const elecFactor = EMISSION_FACTORS.ELECTRICITY_KG_CO2_PER_KWH / 1000;
  const methaneM3PerTonne =
    EMISSION_FACTORS.METHANE_M3_PER_TONNE[mineType] ??
    EMISSION_FACTORS.METHANE_M3_PER_TONNE.OPEN_CAST;

  const excavationTco2 = excavationDieselL * dieselFactor;
  const transportTco2 = transportDieselL * dieselFactor;
  const equipmentTco2 = equipmentDieselL * dieselFactor;
  const electricityTco2 = electricityKwh * elecFactor;
  const explosivesTco2 = explosivesTonnes * EMISSION_FACTORS.EXPLOSIVES_TCO2_PER_TONNE;
  const fugitiveMethaneTco2 =
    coalProducedTonnes * methaneM3PerTonne * EMISSION_FACTORS.CH4_M3_TO_TCO2E;

  const totalEmissionsTco2 =
    excavationTco2 +
    transportTco2 +
    equipmentTco2 +
    electricityTco2 +
    explosivesTco2 +
    fugitiveMethaneTco2;

  const stateProfile = getStateProfile(state);
  const existingSinkTco2 = existingAfforestationHa * stateProfile.tCO2PerHaPerYear;
  const netGapTco2 = Math.max(0, totalEmissionsTco2 - existingSinkTco2);
  const perCapitaTco2 = workerCount > 0 ? totalEmissionsTco2 / workerCount : 0;

  return {
    breakdown: {
      excavationTco2: round2(excavationTco2),
      transportTco2: round2(transportTco2),
      equipmentTco2: round2(equipmentTco2),
      electricityTco2: round2(electricityTco2),
      explosivesTco2: round2(explosivesTco2),
      fugitiveMethaneTco2: round2(fugitiveMethaneTco2),
    },
    totalEmissionsTco2: round2(totalEmissionsTco2),
    perCapitaTco2: round2(perCapitaTco2),
    existingSinkTco2: round2(existingSinkTco2),
    netGapTco2: round2(netGapTco2),
    stateProfile,
  };
}

export function simulateNeutralityPathway(emissionResult, {
  state,
  evShiftPct = 0,
  renewablePct = 0,
  methaneCapturePct = 0,
  creditPriceInr = EMISSION_FACTORS.DEFAULT_CREDIT_PRICE_INR,
}) {
  const { breakdown, totalEmissionsTco2, existingSinkTco2 } = emissionResult;
  const stateProfile = getStateProfile(state);

  // EV haulage achieves ~70% net reduction after accounting for charging power
  const evReduction = breakdown.transportTco2 * (evShiftPct / 100) * 0.7;
  // On-site solar/wind directly offsets grid electricity emissions
  const renewableReduction = breakdown.electricityTco2 * (renewablePct / 100);
  // Methane capture & utilization systems operate at ~85% efficiency
  const methaneReduction = breakdown.fugitiveMethaneTco2 * (methaneCapturePct / 100) * 0.85;

  const totalReducedTco2 = evReduction + renewableReduction + methaneReduction;
  const remainingGapTco2 = Math.max(0, totalEmissionsTco2 - totalReducedTco2 - existingSinkTco2);

  const requiredLandHa = remainingGapTco2 / stateProfile.tCO2PerHaPerYear;
  const requiredTrees = Math.ceil(requiredLandHa * stateProfile.treesPerHa);

  const carbonCreditsEarned = totalReducedTco2;
  const creditValueInr = carbonCreditsEarned * creditPriceInr;

  return {
    reductions: {
      evReduction: round2(evReduction),
      renewableReduction: round2(renewableReduction),
      methaneReduction: round2(methaneReduction),
      totalReducedTco2: round2(totalReducedTco2),
    },
    remainingGapTco2: round2(remainingGapTco2),
    afforestationPlan: {
      state,
      requiredLandHa: round2(requiredLandHa),
      requiredTrees,
      nativeSpecies: stateProfile.nativeSpecies,
    },
    carbonCredits: {
      creditsEarned: round2(carbonCreditsEarned),
      creditPriceInr,
      estimatedValueInr: round2(creditValueInr),
    },
  };
}