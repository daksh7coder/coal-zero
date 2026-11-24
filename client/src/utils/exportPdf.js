import { jsPDF } from 'jspdf';
import { fmt } from '../api';

export function exportCarbonReport(mine, latestLog, simData) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CoalZero — Carbon Footprint & Neutrality Report', 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, y);

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  // Mine Profile
  y += 10;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Mine Profile', 14, y);

  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const profileLines = [
    `Mine Name: ${mine.name}`,
    `State: ${mine.state}   |   Type: ${mine.mineType === 'UNDERGROUND' ? 'Underground' : 'Open-Cast'}`,
    `Workforce: ${fmt(mine.workerCount)} workers   |   Existing Plantation: ${fmt(mine.existingAfforestationHa)} ha`,
  ];
  profileLines.forEach((line) => {
    doc.text(line, 16, y);
    y += 6;
  });

  if (latestLog) {
    y += 6;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`2. Emission Summary (${latestLog.periodLabel})`, 14, y);

    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const b = latestLog.breakdown || {};
    const summaryLines = [
      `Coal Produced: ${fmt(latestLog.coalProducedTonnes)} tonnes`,
      `Total Carbon Emissions: ${fmt(latestLog.totalEmissionsTco2)} tCO2e`,
      `Per-Capita Emissions: ${fmt(latestLog.perCapitaTco2)} tCO2e / worker`,
      `Existing Carbon Sink: ${fmt(latestLog.existingSinkTco2)} tCO2e / year`,
      `Net Carbon Gap: ${fmt(latestLog.netGapTco2)} tCO2e`,
      '',
      'Activity-Wise Breakdown (tCO2e):',
      `  • Excavation Diesel: ${fmt(b.excavationTco2)}   |   Haulage/Transport: ${fmt(b.transportTco2)}`,
      `  • Equipment Diesel: ${fmt(b.equipmentTco2)}   |   Grid Electricity: ${fmt(b.electricityTco2)}`,
      `  • Explosives (ANFO): ${fmt(b.explosivesTco2)}   |   Fugitive Methane: ${fmt(b.fugitiveMethaneTco2)}`,
    ];
    summaryLines.forEach((line) => {
      doc.text(line, 16, y);
      y += 6;
    });
  }

  if (simData?.simulation) {
    const s = simData.simulation;
    y += 6;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Active Carbon Neutrality Pathway', 14, y);

    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const simLines = [
      `Total Emissions Reduced via Clean Tech: ${fmt(s.reductions.totalReducedTco2)} tCO2e`,
      `  • EV Haulage Reduction: ${fmt(s.reductions.evReduction)} tCO2e`,
      `  • Renewable Power Reduction: ${fmt(s.reductions.renewableReduction)} tCO2e`,
      `  • Methane Capture Reduction: ${fmt(s.reductions.methaneReduction)} tCO2e`,
      `Remaining Gap to Offset: ${fmt(s.remainingGapTco2)} tCO2e`,
      `Required Afforestation (${s.afforestationPlan.state}): ${fmt(s.afforestationPlan.requiredLandHa)} ha (${fmt(s.afforestationPlan.requiredTrees)} saplings)`,
      `Recommended Native Species: ${s.afforestationPlan.nativeSpecies}`,
      `Carbon Credits Earned: ${fmt(s.carbonCredits.creditsEarned)} credits (Est. INR ${fmt(s.carbonCredits.estimatedValueInr)})`,
    ];
    simLines.forEach((line) => {
      doc.text(line, 16, y);
      y += 6;
    });
  }

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Methodology: CEA India CO2 Baseline v22.0 (0.675 kg CO2/kWh), IPCC 2006 Tier 1 Factors, FSI State Benchmarks.',
    14,
    y
  );

  const safeName = mine.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`coalzero-report-${safeName}.pdf`);
}