# CrewClock — Construction Timekeeping System

SOX-compliant timekeeping system for a 700-employee construction firm with Sage 300 CRE integration.

## Features

- **Crew Huddle Entry** — Foreman selects crew, assigns cost code, takes proof-of-presence photo
- **Manual Entry with "Why"** — Admin edits require a reason code (SOX compliance)
- **Validation Engine** — Flags 16+ hour days, missing cost codes, duplicate entries
- **Sage 300 CRE Export** — Generates .PRT payroll transaction files
- **SOX Audit Trail** — Every UPDATE/DELETE captured with before/after state
- **Per Diem & Overtime** — Texas/ABQ rates, daily OT (8h), double-time (12h), weekly (40h)

## Quick Start (Local Demo)

```bash
npm install
node demo.js
# Open http://localhost:4000
```

No database required — runs entirely in-memory with 15 sample employees and 8 cost codes.

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Or connect this repo to [vercel.com](https://vercel.com) for automatic deploys on push.

## Production Setup (with PostgreSQL)

```bash
# Set DATABASE_URL in .env
npm run migrate
npm run seed
npm start
```

## Architecture

| Module | File | Purpose |
|--------|------|---------|
| Payroll Rules | `src/logic/payrollRules.js` | Per Diem rates, OT calculations |
| Sage 300 Adapter | `src/adapters/sage300Exporter.js` | .PRT CSV generator |
| Audit Middleware | `src/middleware/auditLog.js` | SOX before/after logging |
| Validation Engine | `src/routes/validation.js` | Error flagging rules |

## Tech Stack

- **Backend:** Node.js / Express
- **Frontend:** React (dev) / Vanilla JS (demo build)
- **Database:** PostgreSQL (production) / In-memory (demo)
- **Deployment:** Vercel (serverless)
