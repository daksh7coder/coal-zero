import { useState } from 'react';
import { X } from 'lucide-react';

export function AddMineModal({ states, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    state: states[0]?.name || 'Jharkhand',
    mineType: 'OPEN_CAST',
    workerCount: 1000,
    existingAfforestationHa: 200,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Register New Coal Mine</h3>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Mine Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Jharia Block-IV Project"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>State (Afforestation Zone)</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                {(states.length ? states : [{ name: 'Jharkhand' }]).map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mine Type</label>
              <select
                value={form.mineType}
                onChange={(e) => setForm({ ...form, mineType: e.target.value })}
              >
                <option value="OPEN_CAST">Open-Cast (Surface)</option>
                <option value="UNDERGROUND">Underground</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Workforce (Workers)</label>
              <input
                type="number"
                min="1"
                required
                value={form.workerCount}
                onChange={(e) => setForm({ ...form, workerCount: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Existing Plantation Area (Hectares)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.existingAfforestationHa}
                onChange={(e) =>
                  setForm({ ...form, existingAfforestationHa: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Create Mine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddActivityLogModal({ mineName, onClose, onSubmit }) {
  const [form, setForm] = useState({
    periodLabel: 'FY 2026-27',
    coalProducedTonnes: 600000,
    excavationDieselL: 900000,
    transportDieselL: 1300000,
    equipmentDieselL: 350000,
    electricityKwh: 7500000,
    explosivesTonnes: 1600,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Log Activity — {mineName}</h3>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Reporting Period</label>
              <input
                type="text"
                required
                placeholder="e.g., FY 2026-27 or Q2 2026"
                value={form.periodLabel}
                onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Coal Extracted (Tonnes)</label>
              <input
                type="number"
                min="0"
                required
                value={form.coalProducedTonnes}
                onChange={(e) => setForm({ ...form, coalProducedTonnes: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Excavation Diesel (Litres)</label>
              <input
                type="number"
                min="0"
                required
                value={form.excavationDieselL}
                onChange={(e) => setForm({ ...form, excavationDieselL: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Haulage / Transport Diesel (Litres)</label>
              <input
                type="number"
                min="0"
                required
                value={form.transportDieselL}
                onChange={(e) => setForm({ ...form, transportDieselL: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Heavy Equipment Diesel (Litres)</label>
              <input
                type="number"
                min="0"
                required
                value={form.equipmentDieselL}
                onChange={(e) => setForm({ ...form, equipmentDieselL: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Grid Electricity Used (kWh)</label>
              <input
                type="number"
                min="0"
                required
                value={form.electricityKwh}
                onChange={(e) => setForm({ ...form, electricityKwh: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>ANFO Explosives Used (Tonnes)</label>
              <input
                type="number"
                min="0"
                required
                value={form.explosivesTonnes}
                onChange={(e) => setForm({ ...form, explosivesTonnes: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Calculating...' : 'Calculate & Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}