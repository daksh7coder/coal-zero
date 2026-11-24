# CoalZero — Carbon Footprint & Neutrality Platform for Indian Coal Mines

A full-stack decision support web application built for **Smart India Hackathon (Problem Statement #70 — Ministry of Coal / CMPDI)** to quantify operational carbon emissions across Indian coal mines and simulate actionable pathways to Net-Zero.

## Live Deployment

- **Web Application (Vercel):** https://coal-zero.vercel.app
- **Backend API Health Check (Render):** https://coal-zero.onrender.com/api/health
- **Seeded Mines API Endpoint:** https://coal-zero.onrender.com/api/mines

> **Note:** The backend runs on Render's free tier and sleeps after 15 minutes of inactivity. Allow 30–50 seconds on the first load for the server to wake up.

## Key Features

- **Activity-Wise Carbon Quantification:** Calculates emissions across excavation diesel, haulage/transport diesel, heavy equipment diesel, grid electricity, ANFO explosives, and fugitive coal-seam methane.
- **Open-Cast vs. Underground Modeling:** Applies distinct IPCC Tier 1 fugitive methane factors (`1.2 m³/tonne` for Open-Cast vs. `18.0 m³/tonne` for Underground mines).
- **Per-Capita & Carbon Gap Analysis:** Computes per-worker emissions (`tCO2e/worker`), offsets existing mine greenbelt sequestration, and tracks the net carbon gap.
- **Interactive Neutrality Simulator:** Real-time sliders for EV haulage transition, solar/renewable grid shift, methane capture, and voluntary carbon credit pricing (`INR/tCO2e`) with a 10-year Net-Zero trajectory chart.
- **State-Specific Afforestation Planner:** Estimates required plantation land (hectares), sapling counts, and native tree species across major Indian coal-bearing states (Jharkhand, Odisha, Chhattisgarh, Madhya Pradesh, Telangana, West Bengal, Maharashtra).
- **Audit Report Export:** Generates downloadable PDF carbon footprint and neutrality pathway reports (`jsPDF`).
- **Pre-Seeded Indian Coal Mine Profiles:** Includes baseline data for *Gevra Open-Cast Project (SECL)*, *Moonidih Underground Mine (BCCL)*, and *Talcher Coalfield Block-B (MCL)*.

## Verified Emission & Sequestration Methodology

| Parameter | Factor / Benchmark | Official Source |
| :--- | :--- | :--- |
| Indian Grid Electricity | `0.675 kg CO2 / kWh` | Central Electricity Authority (CEA), CO2 Baseline Database v22.0 (FY 2025-26) |
| Diesel Combustion | `2.68 kg CO2 / litre` | IPCC 2006 Guidelines (Vol. 2, Stationary/Mobile Combustion) |
| ANFO Explosives | `0.189 tCO2 / tonne` | IPCC 2006 / NGER Explosives Emission Factors |
| Fugitive Methane (Open-Cast) | `1.2 m³ CH4 / tonne coal` | IPCC 2006 Tier 1 Guidelines (Vol. 2, Ch. 4) |
| Fugitive Methane (Underground) | `18.0 m³ CH4 / tonne coal` | IPCC 2006 Tier 1 Guidelines (Vol. 2, Ch. 4) |
| State Afforestation Sink | `11.0 – 13.0 tCO2 / ha / yr` | Forest Survey of India (FSI) & State Compensatory Afforestation Benchmarks |

## Tech Stack

- **Frontend (`client/`):** React (Vite), Recharts, Lucide React, Axios, jsPDF
- **Backend (`server/`):** Node.js (ESM), Express.js, Prisma ORM v6, SQLite
- **Deployment:** Vercel (Frontend) + Render (Backend API)

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | API health check |
| `GET` | `/api/methodology` | Emission factors, state afforestation profiles, and official citations |
| `GET` | `/api/mines` | List all registered coal mines with latest activity log summary |
| `POST` | `/api/mines` | Register a new coal mine |
| `GET` | `/api/mines/:id` | Fetch full mine profile, enriched activity breakdowns, and saved scenarios |
| `DELETE` | `/api/mines/:id` | Delete a mine and its associated logs and simulations |
| `POST` | `/api/mines/:id/logs` | Record a new operational activity log and calculate emissions |
| `POST` | `/api/mines/:id/simulate` | Simulate clean-tech neutrality pathway (`save: true` persists to DB) |

## Local Development Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/daksh7coder/coal-zero.git](https://github.com/daksh7coder/coal-zero.git)
cd coal-zero
```

### 2. Setup & Run the Backend
```bash
cd server
npm install
```

Create a `server/.env` file:
```env
PORT=5001
DATABASE_URL="file:./dev.db"
```

Run migrations, seed the 3 sample mines, and start the server:
```bash
npx prisma migrate dev
npm run seed
npm run dev
```

### 3. Setup & Run the Frontend (New Terminal)
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.