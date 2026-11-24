import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchMines = () => api.get('/mines').then((r) => r.data);
export const fetchMineById = (id) => api.get(`/mines/${id}`).then((r) => r.data);
export const createMine = (data) => api.post('/mines', data).then((r) => r.data);
export const deleteMine = (id) => api.delete(`/mines/${id}`).then((r) => r.data);
export const createActivityLog = (mineId, data) =>
  api.post(`/mines/${mineId}/logs`, data).then((r) => r.data);
export const runSimulation = (mineId, data) =>
  api.post(`/mines/${mineId}/simulate`, data).then((r) => r.data);
export const fetchMethodology = () => api.get('/methodology').then((r) => r.data);

export const fmt = (num) =>
  Number(num || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });