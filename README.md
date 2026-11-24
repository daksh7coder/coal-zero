# CoalZero

**Carbon Footprint Quantification & Net-Zero Pathway Simulator for Indian Coal Mines**

CoalZero is a full-stack web application built to help Indian coal mining operations measure activity-wise greenhouse gas emissions, evaluate existing carbon sinks, calculate net carbon gaps, and simulate practical pathways toward carbon neutrality—including fleet electrification, renewable energy adoption, methane capture, state-specific afforestation, and carbon credit monetization.

> Built for **Smart India Hackathon Problem Statement (Ministry of Coal / CMPDI)**: *A web application specifically designed for Indian coal mines to quantify their carbon footprint and explore pathways to carbon neutrality.*

---

## Key Features

* **Multi-Mine Support (Open-Cast & Underground):** Create and manage mine profiles with distinct fugitive methane baselines, workforce counts, and state-level ecological profiles.
* **Activity-Wise Emission Quantification:** Computes annual or periodic carbon output ($tCO_2e$) across six operational sources:
  * Excavation (diesel consumption)
  * Haulage & transportation (diesel consumption)
  * Heavy equipment usage (diesel consumption)
  * Grid electricity consumption (kWh)
  * Blasting & explosives (ANFO)
  * Fugitive coal-seam methane ($CH_4$ converted via $GWP_{100}$)
* **Per-Capita Emission Metrics:** Automatically calculates emissions per worker ($tCO_2e/\text{worker}$) for benchmarking across mine sizes.
* **Carbon Sinks & Gap Analysis:** Quantifies annual $CO_2$ sequestration from existing mine plantations and calculates the net emission gap requiring offset.
* **Interactive Carbon Neutrality Simulator:** Real-time "what-if" controls for:
  * Electric Vehicle (EV) haulage fleet transition (%)
  * On-site solar/renewable electricity shift (%)
  * Fugitive methane capture & utilization (%)
* **State-Specific Afforestation Planner:** Calculates exact land area (hectares), total saplings required, and recommended native species tailored to major Indian coal-belt states (Jharkhand, Odisha, Chhattisgarh, Madhya Pradesh, Telangana, West Bengal, Maharashtra).
* **Carbon Credit Revenue Estimator:** Converts verified emission reductions into carbon credits ($1\text{ credit} = 1\text{ }tCO_2e$) and estimates potential value at adjustable market rates (INR).
* **Visual Dashboards & Auditability:** Interactive Recharts breakdowns, gap comparisons, and a built-in methodology reference exposing every emission factor and official source.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Recharts, Lucide React, Axios |
| **Backend** | Node.js (ESM), Express.js |
| **Database & ORM** | SQLite, Prisma ORM v6 |
| **Calculation Engine** | Pure deterministic JavaScript modules (no black-box AI estimation) |

---

## Emission Methodology & Sources

All calculations are deterministic and backed by published national and international benchmarks:

| Parameter | Factor Used | Reference Source |
|---|---|---|
| **Indian Grid Electricity** | `0.675 kg CO2 / kWh` | Central Electricity Authority (CEA), CO2 Baseline Database v22.0 (FY 2025-26 weighted average) |
| **Diesel Combustion** | `2.68 kg CO2 / litre` | IPCC 2006 Guidelines for National GHG Inventories, Vol. 2 |
| **ANFO Explosives** | `0.189 tCO2 / tonne` | IPCC 2006 / NGER Explosives Emission Factors |
| **Fugitive Methane (Open-Cast)** | `1.2 m³ CH4 / tonne coal` | IPCC 2006 Tier 1 Default |
| **Fugitive Methane (Underground)** | `18.0 m³ CH4 / tonne coal` | IPCC 2006 Tier 1 Default (200–400 m depth) |
| **Methane Conversion ($CH_4 \rightarrow tCO_2e$)** | `0.01876 tCO2e / m³ CH4` | Density `0.00067 t/m³` × $GWP_{100}$ (`28`) |
| **State Afforestation Sequestration** | `11.0 – 13.0 tCO2 / ha / yr` | Forest Survey of India (FSI) & State Compensatory Afforestation Benchmarks |

---

## Project Structure

```text
coal-zero/
├── client/                       # React + Vite frontend
│   ├── src/
│   └── package.json
├── server/                       # Node.js + Express + Prisma backend
│   ├── prisma/
│   │   └── schema.prisma         # Mine, ActivityLog, Simulation models
│   ├── src/
│   │   ├── constants/
│   │   │   └── emissionFactors.js
│   │   ├── routes/               # Express REST API endpoints
│   │   ├── utils/
│   │   │   └── carbonCalculator.js
│   │   └── index.js
│   ├── .env
│   └── package.json
├── .gitignore
└── README.md
```

---

## Getting Started (Local Setup)

### Prerequisites
* **Node.js** v18 or higher
* **npm** v9 or higher

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/coal-zero.git](https://github.com/YOUR_USERNAME/coal-zero.git)
cd coal-zero
```

### 2. Setup Backend (`server/`)
```bash
cd server
npm install
```

Create a `server/.env` file:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
```

Run database migrations and start the server:
```bash
npx prisma migrate dev --name init
npm run dev
```
The API runs at `http://localhost:5000` (health check: `GET /api/health`).

### 3. Setup Frontend (`client/`)
Open a second terminal from the project root:
```bash
cd client
npm install
npm run dev
```
The web app runs at `http://localhost:5173`.

---

## Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API health check |
| `GET / POST` | `/api/mines` | List all mines or register a new coal mine |
| `GET / DELETE` | `/api/mines/:id` | Fetch full mine profile with logs & simulations |
| `POST` | `/api/mines/:id/logs` | Submit activity data & compute emissions + gap |
| `POST` | `/api/mines/:id/simulate` | Run & save a carbon neutrality pathway simulation |
| `GET` | `/api/methodology` | Return all emission factors, state rates, and citations |

---

## License

This project is open-source and available under the **MIT License**.