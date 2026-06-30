# Healthveer Medical Group — Bookkeeping System

Full-stack bookkeeping dashboard for Healthveer Medical Clinic (Jurong East).
Built with React + Vite + Supabase + Recharts.

---

## What This Does

- Live P&L dashboard — revenue, expenses, gross/net profit by month
- Fee collection tally — Cash, NETS, Medisave, CHAS
- Cash reconciliation — clinic system vs OCBC bank deposits
- CPF schedule — all staff, all months, submission IDs
- OCBC loan tracker — interest/principal split, declining balance chart
- Compliance checklist — ACRA/IRAS deadlines with status
- Edit any figure → saved to Supabase instantly
- Works offline with pre-loaded FY2025 data

---

## STEP 1 — Set Up Supabase

1. Go to **https://app.supabase.com** → New Project
2. Name: `healthveer-bookkeeping`
3. Set a strong password (save it)
4. Region: `Southeast Asia (Singapore)`
5. Once created, go to **SQL Editor**
6. Paste the entire contents of `supabase/schema.sql` and click **Run**
7. This creates all tables AND seeds all FY2025 data

Get your credentials:
- Go to **Settings → API**
- Copy **Project URL** → this is your `VITE_SUPABASE_URL`
- Copy **anon/public** key → this is your `VITE_SUPABASE_ANON_KEY`

---

## STEP 2 — Set Up GitHub

1. Go to **https://github.com/new**
2. Repository name: `healthveer-bookkeeping`
3. Set to **Private**
4. Don't initialise with README (we'll push existing files)

Then in your terminal:
```bash
cd healthveer-app
git init
git add .
git commit -m "Initial commit — Healthveer bookkeeping system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/healthveer-bookkeeping.git
git push -u origin main
```

---

## STEP 3 — Run Locally

```bash
cd healthveer-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and paste your Supabase URL and key

# Start development server
npm run dev
# Opens at http://localhost:5173
```

---

## STEP 4 — Deploy to Vercel (free hosting)

1. Go to **https://vercel.com** → Import Project
2. Connect your GitHub repo `healthveer-bookkeeping`
3. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Click Deploy
5. You'll get a URL like `healthveer-bookkeeping.vercel.app`

Every time you `git push`, Vercel auto-deploys the latest version.

---

## How to Add New Data

### Option A — Edit in the web app
1. Open the dashboard
2. Go to Revenue or Expenses page
3. Click **Edit** on any month row
4. Enter the figures and click **Save to Supabase**
5. Data is saved permanently and available everywhere

### Option B — Supabase SQL Editor
```sql
-- Update a specific month's revenue
UPDATE revenue_monthly
SET medicine = 25000, consultation = 13000, notes = 'Updated from Jan fee summary'
WHERE year = 2025 AND month = 7;

-- Add a new expense item
UPDATE expenses_monthly
SET radiology = 680.50, notes = 'Jul 2025 Medi-Rad invoice added'
WHERE year = 2025 AND month = 7;
```

### Option C — Upload documents
When new documents arrive (Singtel bills, CPF, radiology invoices):
1. Note the amount and month
2. Go to app → Expenses → Edit the relevant month
3. Enter the figure and save
4. The dashboard updates automatically

---

## Adding FY2026 Data

When FY2026 data comes in, add it via the SQL Editor or the app:
```sql
INSERT INTO revenue_monthly (year, month, medicine, consultation, lab, notes)
VALUES (2026, 1, 0, 0, 0, 'Jan 2026 — enter from clinic system');
```

Or simply edit the month in the app — the year selector supports 2022–2026.

---

## Supabase Row-Level Security (optional but recommended)

For extra security, enable RLS in Supabase:
```sql
-- Enable RLS
ALTER TABLE revenue_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses_monthly ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users only
CREATE POLICY "Auth users can do all" ON revenue_monthly
FOR ALL TO authenticated USING (true);
```

Then in Supabase → Authentication → add your email so only you can log in.

---

## File Structure

```
healthveer-app/
├── src/
│   ├── App.jsx          ← Main dashboard (all pages)
│   ├── main.jsx         ← React entry point
│   └── lib/
│       └── supabase.js  ← Database functions
├── supabase/
│   └── schema.sql       ← Run this in Supabase SQL Editor
├── index.html
├── package.json
├── vite.config.js
├── .env.example         ← Copy to .env.local and fill in
└── .gitignore
```

---

## Company Details (for reference)

| Item | Value |
|------|-------|
| Entity | Healthveer Medical Group Pte. Ltd. |
| UEN | 202007276G |
| CPF Sub No | 202239068C-PTE-01 |
| Bank | OCBC Business Growth Account 595106493001 |
| Loan | OCBC 5012245773-00000 · SGD 150K · 7.75% p.a. |
| FY2025 Revenue | SGD 577,143.99 (confirmed) |
| FY2025 Loan Balance | SGD 69,811.17 (31 Dec 2025) |

---

Built June 2026. Continue in new chat to add remaining data.
