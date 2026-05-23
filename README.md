# Tesorería Local 2026

Web form that collects monthly treasury data for a local Lumisial and generates the official Excel report (`.xlsm`) from a template.

## Architecture

```
tesoreria/
├── backend/   FastAPI — fills the .xlsm template and serves it as a download
└── frontend/  React + Vite — 5-step form wizard
```

The backend is **stateless**: it receives JSON, writes data into the Excel template, and returns the file. No database.

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| pip | any recent |

## Backend

```bash
cd backend

# 1. Create virtualenv (recommended)
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variables
cp env.example .env
#    Edit .env — see "Environment variables" below

# 4. Run
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Point to the backend
cp .env.example .env.local
#    Set VITE_API_URL=http://localhost:8000

# 3. Run
npm run dev
```

App available at `http://localhost:5173`.

## First-time credentials setup

The app has no registration flow — credentials live in the backend `.env`. You need to do this once before you can log in.

**Step 1 — generate the password hash**

```bash
cd backend
python3 -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_PASSWORD', bcrypt.gensalt()).decode())"
```

Replace `YOUR_PASSWORD` with the password you want to use. Copy the output — it looks like:

```
$2b$12$dn96ZogYUxJtzLtMIgr07.O5NHLAGR8mfUyY2qvmReyQBJAb1ZKQW
```

**Step 2 — create the `.env` file**

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` and fill in the three values:

```env
ADMIN_USERNAME=tesoreria
ADMIN_PASSWORD_HASH=$2b$12$dn96ZogYUxJtzLtMIgr07...   # paste the hash from step 1
JWT_SECRET=any-long-random-string
```

To generate a secure `JWT_SECRET`:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Step 3 — restart the backend** so it picks up the new `.env`.

> **Common mistake:** copying the hash with extra whitespace breaks `bcrypt.checkpw`. Make sure there are no leading/trailing spaces around the hash value.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `ADMIN_USERNAME` | Login username shown on the login screen |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the password (see setup above) |
| `JWT_SECRET` | Random secret for signing JWT tokens — keep this private |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (no trailing slash) |

## Deployment

| Layer | Platform | Notes |
|-------|----------|-------|
| Frontend | [Vercel](https://vercel.com) | Free tier. Set `VITE_API_URL` in project settings. |
| Backend | [Render.com](https://render.com) | Free tier Web Service (Python). Set the three env vars above. Sleeps after inactivity — ~30s cold start, acceptable for monthly use. |

The Excel template (`backend/template/FORMATO_TESORERIA_2026.xlsm`) must be committed to the repository so Render can access it.

## Excel template notes

The generated file preserves the original formulas and VBA macros. All calculated fields (CUOTA ESTATUTARIA, MISIÓN DIÓCESIS, APORTES LUMISIAL, Cuadre de Caja totals) are derived from the formulas already in the template — only the raw input cells are written by the backend.
