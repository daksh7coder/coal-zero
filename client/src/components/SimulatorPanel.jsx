import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TreePine, IndianRupee, Save, Zap, Truck, Wind } from 'lucide-react';
import { fmt, runSimulation } from '../api';

export default function SimulatorPanel({ mine, simResult, onSimUpdate, onSaved }) {
  const [controls, setControls] = useState({
    evShiftPct: 45,
    renewablePct: 60,
    methaneCapturePct: mine.mineType === 'UNDERGROUND' ? 65 : 30,
    creditPriceInr: 1200,
  });
  const [scenarioName, setScenarioName] = useState('2030 Net-Zero Pathway');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setControls((prev) => ({
      ...prev,
      methaneCapturePct: mine.mineType === 'UNDERGROUND' ? 65 : 30,
    }));
  }, [mine.id, mine.mineType]);

  useEffect(() => {
    if (!mine.logs?.length) return;
    const timer = setTimeout(async () => {
      try {
        const res = await runSimulation(mine.id, { ...controls, save: false });
        onSimUpdate(res);
      } catch (err) {
        console.error(err);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [mine.id, mine.logs?.length, controls]);

  if (!mine.logs?.length) {
    return (
      <div className="card empty-state">
        Log at least one operational activity period to run Carbon Neutrality simulations.
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await runSimulation(mine.id, { ...controls, name: scenarioName, save: true });
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const baseline = simResult?.baseline;
  const sim = simResult?.simulation;

  const comparisonData =
    baseline && sim
      ? [
          { name: 'Baseline Emissions', value: baseline.totalEmissionsTco2, fill: '#ef4444' },
          { name: 'Existing Sink', value: baseline.existingSinkTco2, fill: '#10b981' },
          { name: 'Clean Tech Cut', value: sim.reductions.totalReducedTco2, fill: '#2563eb' },
          { name: 'Remaining Gap', value: sim.remainingGapTco2, fill: '#f59e0b' },
        ]
      : [];

  // Build 10-year phased Net-Zero projection (2026 -> 2035)
  const trajectoryData =
    baseline && sim
      ? Array.from({ length: 10 }, (_, idx) => {
          const progress = idx / 9;
          const techCut = sim.reductions.totalReducedTco2 * progress;
          const newPlantationSink = sim.remainingGapTco2 * progress;
          const netEmissions = Math.max(
            0,
            Math.round(
              baseline.totalEmissionsTco2 -
                baseline.existingSinkTco2 -
                techCut -
                newPlantationSink
            )
          );
          return {
            year: 2026 + idx,
            businessAsUsual: Math.round(baseline.netGapTco2),
            netZeroPath: netEmissions,
          };
        })
      : [];

  return (
    <div>
      <div className="two-col">
        {/* Controls Card */}
        <div className="card">
          <div className="card-title">Clean Technology Controls</div>

          <div className="slider-row">
            <div className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={16} /> EV Haulage Fleet Transition
              </span>
              <span>{controls.evShiftPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.evShiftPct}
              onChange={(e) => setControls({ ...controls, evShiftPct: Number(e.target.value) })}
            />
          </div>

          <div className="slider-row">
            <div className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={16} /> Solar & Renewable Grid Shift
              </span>
              <span>{controls.renewablePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.renewablePct}
              onChange={(e) => setControls({ ...controls, renewablePct: Number(e.target.value) })}
            />
          </div>

          <div className="slider-row">
            <div className="slider-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wind size={16} /> Fugitive Methane Capture
              </span>
              <span>{controls.methaneCapturePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={controls.methaneCapturePct}
              onChange={(e) =>
                setControls({ ...controls, methaneCapturePct: Number(e.target.value) })
              }
            />
          </div>

          <div className="form-group">
            <label>Carbon Credit Market Rate (INR / tCO2e)</label>
            <input
              type="number"
              min="100"
              step="50"
              value={controls.creditPriceInr}
              onChange={(e) =>
                setControls({ ...controls, creditPriceInr: Number(e.target.value) })
              }
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <input
              type="text"
              style={{ flex: 1 }}
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Scenario name..."
            />
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </div>

        {/* Afforestation & Credits Output Card */}
        {sim && (
          <div className="card">
            <div className="card-title">Offset & Carbon Credit Outcomes</div>

            <div className="kpi-grid" style={{ marginBottom: 14 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div className="kpi-label">Clean Tech Cut</div>
                <div className="kpi-value" style={{ fontSize: '1.25rem', color: '#2563eb' }}>
                  {fmt(sim.reductions.totalReducedTco2)} t
                </div>
                <div className="kpi-sub">EV + Solar + CH4 capture</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div className="kpi-label">Remaining Gap</div>
                <div className="kpi-value" style={{ fontSize: '1.25rem', color: '#d97706' }}>
                  {fmt(sim.remainingGapTco2)} t
                </div>
                <div className="kpi-sub">Needs tree offset</div>
              </div>
            </div>

            <div className="highlight-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#065f46' }}>
                <TreePine size={17} /> {sim.afforestationPlan.state} Afforestation Plan
              </div>
              <p style={{ fontSize: '0.88rem', marginTop: 6 }}>
                Required Land: <strong>{fmt(sim.afforestationPlan.requiredLandHa)} hectares</strong>{' '}
                ({fmt(sim.afforestationPlan.requiredTrees)} saplings)
              </p>
              <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: 4 }}>
                Recommended native species: {sim.afforestationPlan.nativeSpecies}
              </p>
            </div>

            <div
              className="highlight-box"
              style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#1e40af' }}>
                <IndianRupee size={17} /> Estimated Carbon Credits
              </div>
              <p style={{ fontSize: '0.88rem', marginTop: 6 }}>
                <strong>{fmt(sim.carbonCredits.creditsEarned)} credits</strong> @ ₹
                {fmt(sim.carbonCredits.creditPriceInr)}/credit ={' '}
                <strong>₹{fmt(sim.carbonCredits.estimatedValueInr)}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="two-col">
        <div className="card">
          <div className="card-title">Emission vs. Reduction Impact (tCO2e)</div>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => `${fmt(val)} tCO2e`} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">10-Year Net-Zero Trajectory (tCO2e Net Gap)</div>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={trajectoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => `${fmt(val)} tCO2e`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="businessAsUsual"
                name="Business as Usual"
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="netZeroPath"
                name="Simulated Net-Zero Path"
                stroke="#059669"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Saved Scenarios Table */}
      <div className="card">
        <div className="card-title">Saved Pathway Scenarios ({mine.simulations?.length || 0})</div>
        {mine.simulations?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>EV / Solar / CH4</th>
                  <th>Cut (tCO2e)</th>
                  <th>Remaining Gap</th>
                  <th>Land Needed</th>
                  <th>Credit Value (INR)</th>
                </tr>
              </thead>
              <tbody>
                {mine.simulations.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.evShiftPct}% / {s.renewablePct}% / {s.methaneCapturePct}%</td>
                    <td>{fmt(s.reducedTco2)}</td>
                    <td>{fmt(s.remainingGapTco2)}</td>
                    <td>{fmt(s.requiredLandHa)} ha</td>
                    <td>₹{fmt(s.creditValueInr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="kpi-sub">No saved scenarios yet. Adjust sliders above and click Save Plan.</p>
        )}
      </div>
    </div>
  );
}