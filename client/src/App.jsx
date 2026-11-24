import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Factory,
  Flame,
  TreePine,
  Users,
  Plus,
  Trash2,
  Download,
  Sliders,
  BookOpen,
  BarChart3,
  FileText,
} from 'lucide-react';
import {
  fetchMines,
  fetchMineById,
  createMine,
  deleteMine,
  createActivityLog,
  fetchMethodology,
  fmt,
} from './api';
import { AddMineModal, AddActivityLogModal } from './components/Modals';
import SimulatorPanel from './components/SimulatorPanel';
import { exportCarbonReport } from './utils/exportPdf';

const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

export default function App() {
  const [mines, setMines] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMine, setSelectedMine] = useState(null);
  const [methodology, setMethodology] = useState({ states: [], sources: [], emissionFactors: {} });
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddMine, setShowAddMine] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'CoalZero — Indian Coal Mine Carbon Neutrality Platform';
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      setError('');
      const [mineList, meth] = await Promise.all([fetchMines(), fetchMethodology()]);
      setMines(mineList);
      setMethodology(meth);
      if (mineList.length > 0) {
        selectMine(mineList[0].id);
      }
    } catch (err) {
      setError('Cannot connect to CoalZero API on http://localhost:5001. Is the server running?');
    }
  };

  const selectMine = async (id) => {
    setSelectedId(id);
    setSimResult(null);
    const fullMine = await fetchMineById(id);
    setSelectedMine(fullMine);
  };

  const handleCreateMine = async (data) => {
    const created = await createMine(data);
    const updated = await fetchMines();
    setMines(updated);
    await selectMine(created.id);
    setActiveTab('overview');
  };

  const handleDeleteMine = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this mine and all its emission logs?')) return;
    await deleteMine(id);
    const updated = await fetchMines();
    setMines(updated);
    if (selectedId === id) {
      if (updated.length) {
        selectMine(updated[0].id);
      } else {
        setSelectedId(null);
        setSelectedMine(null);
      }
    }
  };

  const handleAddLog = async (data) => {
    await createActivityLog(selectedMine.id, data);
    const updatedMines = await fetchMines();
    setMines(updatedMines);
    await selectMine(selectedMine.id);
  };

  const latestLog = selectedMine?.logs?.[0] || null;
  const breakdownChart = latestLog?.breakdown
    ? [
        { name: 'Excavation', value: latestLog.breakdown.excavationTco2 },
        { name: 'Haulage', value: latestLog.breakdown.transportTco2 },
        { name: 'Equipment', value: latestLog.breakdown.equipmentTco2 },
        { name: 'Electricity', value: latestLog.breakdown.electricityTco2 },
        { name: 'Explosives', value: latestLog.breakdown.explosivesTco2 },
        { name: 'Fugitive CH4', value: latestLog.breakdown.fugitiveMethaneTco2 },
      ]
    : [];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <Factory size={26} color="#10b981" />
          <div>
            <h1>CoalZero</h1>
            <span>Ministry of Coal · Net-Zero DSS</span>
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={() => setShowAddMine(true)}>
          <Plus size={16} /> Register Coal Mine
        </button>

        <div className="mine-list">
          {mines.map((m) => (
            <div
              key={m.id}
              className={`mine-card ${selectedId === m.id ? 'active' : ''}`}
              onClick={() => selectMine(m.id)}
            >
              <div className="mine-card-title">{m.name}</div>
              <button
                className="icon-btn-del"
                title="Delete mine"
                onClick={(e) => handleDeleteMine(e, m.id)}
              >
                <Trash2 size={14} />
              </button>
              <div className="mine-card-meta">
                <span className={`badge ${m.mineType === 'UNDERGROUND' ? 'badge-ug' : 'badge-oc'}`}>
                  {m.mineType === 'UNDERGROUND' ? 'Underground' : 'Open-Cast'}
                </span>
                <span>{m.state}</span>
              </div>
              {m.logs?.[0] && (
                <div className="mine-card-meta" style={{ color: '#a7f3d0', marginTop: 6 }}>
                  {fmt(m.logs[0].totalEmissionsTco2)} tCO2e
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {error && (
          <div
            className="card"
            style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b', marginBottom: 16 }}
          >
            {error}
          </div>
        )}

        {!selectedMine ? (
          <div className="card empty-state">
            Select or register a coal mine from the sidebar to begin carbon accounting.
          </div>
        ) : (
          <>
            <div className="topbar">
              <div>
                <h2>{selectedMine.name}</h2>
                <div className="topbar-sub">
                  {selectedMine.state} ·{' '}
                  {selectedMine.mineType === 'UNDERGROUND' ? 'Underground Mine' : 'Open-Cast Mine'} ·{' '}
                  {fmt(selectedMine.workerCount)} workers · {fmt(selectedMine.existingAfforestationHa)}{' '}
                  ha existing greenbelt
                </div>
              </div>

              <div className="btn-group">
                <button className="btn btn-primary" onClick={() => setShowAddLog(true)}>
                  <FileText size={15} /> Log Activity
                </button>
                <button
                  className="btn btn-outline"
                  disabled={!latestLog}
                  onClick={() => exportCarbonReport(selectedMine, latestLog, simResult)}
                >
                  <Download size={15} /> Export PDF Report
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 size={16} /> Emissions & Gap Overview
              </button>
              <button
                className={`tab ${activeTab === 'simulator' ? 'active' : ''}`}
                onClick={() => setActiveTab('simulator')}
              >
                <Sliders size={16} /> Neutrality Simulator
              </button>
              <button
                className={`tab ${activeTab === 'methodology' ? 'active' : ''}`}
                onClick={() => setActiveTab('methodology')}
              >
                <BookOpen size={16} /> Methodology & Sources
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                {!latestLog ? (
                  <div className="card empty-state">
                    <p style={{ marginBottom: 12 }}>No operational logs recorded for this mine yet.</p>
                    <button className="btn btn-primary" onClick={() => setShowAddLog(true)}>
                      <Plus size={16} /> Add First Activity Log
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="kpi-grid">
                      <div className="card">
                        <div className="kpi-label">
                          Total Emissions <Flame size={16} color="#ef4444" />
                        </div>
                        <div className="kpi-value" style={{ color: '#dc2626' }}>
                          {fmt(latestLog.totalEmissionsTco2)} tCO2e
                        </div>
                        <div className="kpi-sub">Period: {latestLog.periodLabel}</div>
                      </div>

                      <div className="card">
                        <div className="kpi-label">
                          Per-Capita Emission <Users size={16} color="#2563eb" />
                        </div>
                        <div className="kpi-value">{fmt(latestLog.perCapitaTco2)} t</div>
                        <div className="kpi-sub">tCO2e per worker / period</div>
                      </div>

                      <div className="card">
                        <div className="kpi-label">
                          Existing Carbon Sink <TreePine size={16} color="#059669" />
                        </div>
                        <div className="kpi-value" style={{ color: '#059669' }}>
                          {fmt(latestLog.existingSinkTco2)} tCO2e
                        </div>
                        <div className="kpi-sub">
                          From {fmt(selectedMine.existingAfforestationHa)} ha in {selectedMine.state}
                        </div>
                      </div>

                      <div className="card">
                        <div className="kpi-label">
                          Net Carbon Gap <Factory size={16} color="#d97706" />
                        </div>
                        <div className="kpi-value" style={{ color: '#d97706' }}>
                          {fmt(latestLog.netGapTco2)} tCO2e
                        </div>
                        <div className="kpi-sub">Requires tech cut + afforestation</div>
                      </div>
                    </div>

                    <div className="two-col">
                      <div className="card">
                        <div className="card-title">Activity-Wise Carbon Emissions (tCO2e)</div>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={breakdownChart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val) => `${fmt(val)} tCO2e`} />
                            <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="card">
                        <div className="card-title">Emission Share by Source</div>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={breakdownChart}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={95}
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {breakdownChart.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(val) => `${fmt(val)} tCO2e`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-title">Recorded Activity Logs ({selectedMine.logs.length})</div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Period</th>
                              <th>Coal (t)</th>
                              <th>Total Diesel (L)</th>
                              <th>Electricity (kWh)</th>
                              <th>Total tCO2e</th>
                              <th>Per Capita</th>
                              <th>Net Gap</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMine.logs.map((log) => (
                              <tr key={log.id}>
                                <td><strong>{log.periodLabel}</strong></td>
                                <td>{fmt(log.coalProducedTonnes)}</td>
                                <td>
                                  {fmt(
                                    log.excavationDieselL +
                                      log.transportDieselL +
                                      log.equipmentDieselL
                                  )}
                                </td>
                                <td>{fmt(log.electricityKwh)}</td>
                                <td><strong>{fmt(log.totalEmissionsTco2)}</strong></td>
                                <td>{fmt(log.perCapitaTco2)} t</td>
                                <td style={{ color: '#d97706', fontWeight: 600 }}>
                                  {fmt(log.netGapTco2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 2: SIMULATOR */}
            {activeTab === 'simulator' && (
              <SimulatorPanel
                mine={selectedMine}
                simResult={simResult}
                onSimUpdate={setSimResult}
                onSaved={() => selectMine(selectedMine.id)}
              />
            )}

            {/* TAB 3: METHODOLOGY */}
            {activeTab === 'methodology' && (
              <div className="two-col">
                <div className="card">
                  <div className="card-title">Verified Emission Factors & Citations</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Official Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {methodology.sources.map((src, i) => (
                          <tr key={i}>
                            <td><strong>{src.parameter}</strong></td>
                            <td>{src.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">State-Specific Afforestation Benchmarks</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>State</th>
                          <th>tCO2 / ha / yr</th>
                          <th>Trees / ha</th>
                          <th>Native Species</th>
                        </tr>
                      </thead>
                      <tbody>
                        {methodology.states.map((st) => (
                          <tr key={st.name}>
                            <td><strong>{st.name}</strong></td>
                            <td>{st.tCO2PerHaPerYear}</td>
                            <td>{fmt(st.treesPerHa)}</td>
                            <td>{st.nativeSpecies}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showAddMine && (
        <AddMineModal
          states={methodology.states}
          onClose={() => setShowAddMine(false)}
          onSubmit={handleCreateMine}
        />
      )}

      {showAddLog && selectedMine && (
        <AddActivityLogModal
          mineName={selectedMine.name}
          onClose={() => setShowAddLog(false)}
          onSubmit={handleAddLog}
        />
      )}
    </div>
  );
}
