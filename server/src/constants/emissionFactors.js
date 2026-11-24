export const EMISSION_FACTORS = {
 
  DIESEL_KG_CO2_PER_LITRE: 2.68,

  ELECTRICITY_KG_CO2_PER_KWH: 0.675,

  
  EXPLOSIVES_TCO2_PER_TONNE: 0.189,

 
  METHANE_M3_PER_TONNE: {
    OPEN_CAST: 1.2,
    UNDERGROUND: 18.0,
  },

 
  CH4_M3_TO_TCO2E: 0.01876,

 
  DEFAULT_CREDIT_PRICE_INR: 1200,
};

export const STATE_AFFORESTATION = {
  Jharkhand: {
    tCO2PerHaPerYear: 12.5,
    treesPerHa: 1600,
    nativeSpecies: 'Sal, Mahua, Bamboo, Teak',
  },
  Odisha: {
    tCO2PerHaPerYear: 13.0,
    treesPerHa: 1600,
    nativeSpecies: 'Sal, Arjun, Neem, Acacia',
  },
  Chhattisgarh: {
    tCO2PerHaPerYear: 12.8,
    treesPerHa: 1500,
    nativeSpecies: 'Sal, Tendu, Saja, Bamboo',
  },
  'Madhya Pradesh': {
    tCO2PerHaPerYear: 11.5,
    treesPerHa: 1500,
    nativeSpecies: 'Teak, Banyan, Neem, Amla',
  },
  Telangana: {
    tCO2PerHaPerYear: 11.0,
    treesPerHa: 1400,
    nativeSpecies: 'Neem, Pongamia, Bamboo, Subabul',
  },
  'West Bengal': {
    tCO2PerHaPerYear: 12.2,
    treesPerHa: 1600,
    nativeSpecies: 'Sal, Mahogany, Eucalyptus, Kadam',
  },
  Maharashtra: {
    tCO2PerHaPerYear: 11.2,
    treesPerHa: 1400,
    nativeSpecies: 'Teak, Neem, Babool, Subabul',
  },
};

export const METHODOLOGY_SOURCES = [
  {
    parameter: 'Indian Grid Electricity Emission Factor (0.675 kg CO2/kWh)',
    source: 'Central Electricity Authority (CEA), CO2 Baseline Database for the Indian Power Sector, Version 22.0 (FY 2025-26)',
  },
  {
    parameter: 'Fugitive Methane from Coal Mining (1.2 m3/t Open-Cast, 18 m3/t Underground)',
    source: 'IPCC 2006 Guidelines for National Greenhouse Gas Inventories, Vol. 2, Ch. 4',
  },
  {
    parameter: 'Diesel & ANFO Explosives Combustion Factors',
    source: 'IPCC 2006 Stationary/Mobile Combustion & NGER Explosives Factors',
  },
  {
    parameter: 'State Afforestation Sequestration Benchmarks (11-13 tCO2/ha/yr)',
    source: 'Forest Survey of India (FSI) & State Compensatory Afforestation Guidelines',
  },
];