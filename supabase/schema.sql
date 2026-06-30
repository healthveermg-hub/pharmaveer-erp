-- ============================================================
-- HEALTHVEER MEDICAL GROUP — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- Revenue by month (from clinic system / sales summary)
CREATE TABLE IF NOT EXISTS revenue_monthly (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,  -- 1-12
  medicine DECIMAL(12,2) DEFAULT 0,
  consultation DECIMAL(12,2) DEFAULT 0,
  lab DECIMAL(12,2) DEFAULT 0,
  injections DECIMAL(12,2) DEFAULT 0,
  others DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) GENERATED ALWAYS AS (medicine + consultation + lab + injections + others) STORED,
  cash_collected DECIMAL(12,2) DEFAULT 0,
  nets_collected DECIMAL(12,2) DEFAULT 0,
  medisave_collected DECIMAL(12,2) DEFAULT 0,
  chas_collected DECIMAL(12,2) DEFAULT 0,
  bank_cash_deposit DECIMAL(12,2) DEFAULT 0,
  bank_pos_medisave DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- Expenses by month
CREATE TABLE IF NOT EXISTS expenses_monthly (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  -- Payroll
  salary_dr_taranjit DECIMAL(12,2) DEFAULT 0,
  salary_tanmanpreet DECIMAL(12,2) DEFAULT 0,
  salary_others DECIMAL(12,2) DEFAULT 0,
  locum_fees DECIMAL(12,2) DEFAULT 0,
  employer_cpf DECIMAL(12,2) DEFAULT 0,
  sdl DECIMAL(12,2) DEFAULT 0,
  fwl DECIMAL(12,2) DEFAULT 0,
  -- Overheads
  rent DECIMAL(12,2) DEFAULT 0,
  loan_principal DECIMAL(12,2) DEFAULT 0,
  loan_interest DECIMAL(12,2) DEFAULT 0,
  honda_hp DECIMAL(12,2) DEFAULT 0,
  honda_other DECIMAL(12,2) DEFAULT 0,
  sp_services DECIMAL(12,2) DEFAULT 0,
  singtel DECIMAL(12,2) DEFAULT 0,
  clinic_assist DECIMAL(12,2) DEFAULT 0,
  radiology DECIMAL(12,2) DEFAULT 0,
  nets_subscription DECIMAL(12,2) DEFAULT 0,
  grab DECIMAL(12,2) DEFAULT 0,
  insurance DECIMAL(12,2) DEFAULT 0,
  sma_membership DECIMAL(12,2) DEFAULT 0,
  acra_fees DECIMAL(12,2) DEFAULT 0,
  accounting_fees DECIMAL(12,2) DEFAULT 0,
  drug_purchases DECIMAL(12,2) DEFAULT 0,
  other_expenses DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- OCBC Loan schedule
CREATE TABLE IF NOT EXISTS loan_schedule (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  opening_balance DECIMAL(12,2) NOT NULL,
  interest DECIMAL(12,2) NOT NULL,
  principal DECIMAL(12,2) NOT NULL,
  closing_balance DECIMAL(12,2) NOT NULL,
  UNIQUE(year, month)
);

-- CPF records
CREATE TABLE IF NOT EXISTS cpf_records (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  submission_id VARCHAR(20),
  date_paid DATE,
  taranjit_cpf DECIMAL(10,2) DEFAULT 0,
  tanmanpreet_cpf DECIMAL(10,2) DEFAULT 0,
  staff3_name VARCHAR(100),
  staff3_cpf DECIMAL(10,2) DEFAULT 0,
  staff4_name VARCHAR(100),
  staff4_cpf DECIMAL(10,2) DEFAULT 0,
  total_cpf DECIMAL(10,2) DEFAULT 0,
  sdl DECIMAL(10,2) DEFAULT 0,
  total_paid DECIMAL(10,2) DEFAULT 0,
  UNIQUE(year, month)
);

-- Bank deposits tally (for cash reconciliation)
CREATE TABLE IF NOT EXISTS bank_deposits (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  deposit_date DATE NOT NULL,
  transaction_type VARCHAR(50),  -- CASH_DEPOSIT, POS_SETTLEMENT, PAYNOW, GIRO, FAST
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  is_revenue_related BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Documents uploaded (for audit trail)
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  year INTEGER,
  month INTEGER,
  doc_type VARCHAR(100),  -- CPF, BANK_STATEMENT, INVOICE, DRUG_ORDER, etc
  filename VARCHAR(255),
  supplier VARCHAR(200),
  invoice_number VARCHAR(100),
  amount DECIMAL(12,2),
  date_of_doc DATE,
  storage_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Year summary view
CREATE OR REPLACE VIEW yearly_summary AS
SELECT
  r.year,
  SUM(r.total) as total_revenue,
  SUM(e.drug_purchases) as drug_purchases,
  SUM(r.total) - SUM(e.drug_purchases) as gross_profit,
  SUM(
    e.salary_dr_taranjit + e.salary_tanmanpreet + e.salary_others +
    e.locum_fees + e.employer_cpf + e.sdl + e.fwl +
    e.rent + e.loan_interest + e.honda_hp + e.honda_other +
    e.sp_services + e.singtel + e.clinic_assist + e.radiology +
    e.nets_subscription + e.grab + e.insurance + e.sma_membership +
    e.acra_fees + e.accounting_fees + e.other_expenses + e.drug_purchases
  ) as total_expenses,
  SUM(r.total) - SUM(
    e.salary_dr_taranjit + e.salary_tanmanpreet + e.salary_others +
    e.locum_fees + e.employer_cpf + e.sdl + e.fwl +
    e.rent + e.loan_interest + e.honda_hp + e.honda_other +
    e.sp_services + e.singtel + e.clinic_assist + e.radiology +
    e.nets_subscription + e.grab + e.insurance + e.sma_membership +
    e.acra_fees + e.accounting_fees + e.other_expenses + e.drug_purchases
  ) as net_profit
FROM revenue_monthly r
LEFT JOIN expenses_monthly e ON r.year = e.year AND r.month = e.month
GROUP BY r.year
ORDER BY r.year;

-- ============================================================
-- SEED DATA — FY2025
-- ============================================================

INSERT INTO revenue_monthly (year, month, medicine, consultation, lab, injections, others, cash_collected, nets_collected, bank_cash_deposit, bank_pos_medisave, notes) VALUES
(2025,1,21234.18,12345.00,4234.00,534.94,1807.16,4650.91,4734.29,3864.00,38391.56,'Jan 2025 confirmed'),
(2025,2,29213.30,14567.00,5123.00,1529.88,1641.72,6562.92,11139.14,4650.00,104467.46,'Feb 2025 confirmed'),
(2025,3,29556.14,15234.00,5678.00,949.76,1648.95,3698.15,16662.61,0,109845.07,'Mar 2025 confirmed'),
(2025,4,31893.94,14892.00,4567.00,1468.97,2219.63,6356.28,15051.45,0,92618.94,'Apr 2025 confirmed'),
(2025,5,21817.60,11456.00,4123.00,746.09,1508.91,4167.87,12423.31,10261.00,97660.35,'May 2025 confirmed'),
(2025,6,26196.35,12890.00,4890.00,559.95,1682.55,3564.34,14898.15,0,120190.51,'Jun 2025 confirmed'),
(2025,7,20226.00,13456.00,5234.00,888.34,2170.50,0,0,0,91412.14,'Jul 2025 — fee collection detail needed'),
(2025,8,18738.40,11234.00,3890.00,1074.10,2610.74,0,0,14088.40,83095.81,'Aug 2025 — fee collection detail needed'),
(2025,9,18756.50,10987.00,4567.00,1758.14,1340.22,0,0,0,82846.66,'Sep 2025 — fee collection detail needed'),
(2025,10,22474.80,11567.00,5123.00,906.66,2657.30,0,0,0,79347.62,'Oct 2025 — fee collection detail needed'),
(2025,11,22386.30,11234.00,4890.00,723.31,2480.26,0,0,0,90221.09,'Nov 2025 — fee collection detail needed'),
(2025,12,14030.44,12807.20,2619.03,817.29,1235.90,0,0,19503.00,105419.73,'Dec 2025 — fee collection detail needed')
ON CONFLICT (year, month) DO UPDATE SET
  medicine=EXCLUDED.medicine, consultation=EXCLUDED.consultation,
  lab=EXCLUDED.lab, injections=EXCLUDED.injections, others=EXCLUDED.others,
  updated_at=NOW();

INSERT INTO expenses_monthly (year, month, salary_dr_taranjit, locum_fees, employer_cpf, sdl, rent, loan_principal, loan_interest, honda_hp, sp_services, singtel, clinic_assist, drug_purchases, sma_membership, notes) VALUES
(2025,1,4000,0,3238,20,3500,2368.99,654.55,1514,882.29,219.67,0,8182.43,0,'Jan 2025'),
(2025,2,4000,480,3238,20,3500,2363.97,659.57,1514,685.00,216.48,0,8142.21,0,'Feb 2025 — locum Dr Low SGD 480'),
(2025,3,4000,0,3238,20,3500,2460.47,563.07,1514,514.60,213.23,0,9021.98,0,'Mar 2025'),
(2025,4,4000,0,3238,20,3500,2455.52,568.02,1514,680.32,234.48,0,8102.04,272.50,'Apr 2025 — SMA SGD 272.50'),
(2025,5,4000,0,3238,20,3500,2432.50,591.04,1514,716.39,213.23,0,8341.11,0,'May 2025'),
(2025,6,4000,0,3238,20,3500,2448.51,575.03,1514,798.93,213.23,0,5516.21,0,'Jun 2025 — SP incl late fee'),
(2025,7,4000,800,4052,26,3500,2500.69,522.85,1514,650.39,162.68,0,7038.85,0,'Jul 2025 — locum SGD 800'),
(2025,8,4000,1600,4052,26,3500,2481.09,542.45,1514,697.00,325.91,0,8655.66,0,'Aug 2025 — locum SGD 1,600'),
(2025,9,4000,1000,4052,26,3500,2497.42,526.12,1514,487.33,162.68,0,7009.54,0,'Sep 2025 — est locum'),
(2025,10,4000,1800,3901,25,3500,2530.30,493.24,1514,537.85,325.91,0,8208.53,0,'Oct 2025 — est locum'),
(2025,11,4000,2400,4018,25,3500,2498.71,524.83,1514,466.07,489.14,3924.00,10050.36,0,'Nov 2025 — Clinic Assist SGD 3,924'),
(2025,12,4000,2400,3755,23,3500,2593.08,430.46,1514,529.23,249.78,0,6728.86,0,'Dec 2025 — est locum')
ON CONFLICT (year, month) DO UPDATE SET updated_at=NOW();

-- FY2025 CPF
INSERT INTO cpf_records (year, month, submission_id, date_paid, taranjit_cpf, tanmanpreet_cpf, staff3_name, staff3_cpf, total_cpf, sdl, total_paid) VALUES
(2025,1,'20250201','2025-02-15',1850,1388,NULL,0,3238,20,3258),
(2025,2,'20250301','2025-03-15',1850,1388,NULL,0,3238,20,3258),
(2025,3,'AX156736','2025-04-01',1850,1388,NULL,0,3238,20,3258),
(2025,4,'BB838936','2025-05-11',1850,1388,NULL,0,3238,20,3258),
(2025,5,'BC093471','2025-06-10',1850,1388,NULL,0,3238,20,3258),
(2025,6,'BC239992','2025-07-02',1850,1388,NULL,0,3238,20,3258),
(2025,7,'BC414689','2025-07-29',1850,1388,'Nursyafiqah Binte Sulaiman',814,4052,26,4078),
(2025,8,'BC588335','2025-08-19',1850,1388,'Nursyafiqah Binte Sulaiman',814,4052,26,4078),
(2025,9,'BC752341','2025-09-15',1850,1388,'Nursyafiqah Binte Sulaiman',814,4052,26,4078),
(2025,10,'BD091248','2025-11-08',1850,1388,'Nursyafiqah Binte Sulaiman',663,3901,25,3926),
(2025,11,'BD280431','2025-12-06',1850,1388,'Priyakumari D/O Neermaran',780,4018,25,4043),
(2025,12,'BD539526',NULL,1850,1388,'Priyakumari D/O Neermaran',494,3732,23,3755)
ON CONFLICT (year, month) DO UPDATE SET
  submission_id=EXCLUDED.submission_id, date_paid=EXCLUDED.date_paid,
  taranjit_cpf=EXCLUDED.taranjit_cpf, tanmanpreet_cpf=EXCLUDED.tanmanpreet_cpf,
  staff3_name=EXCLUDED.staff3_name, staff3_cpf=EXCLUDED.staff3_cpf,
  total_cpf=EXCLUDED.total_cpf, sdl=EXCLUDED.sdl, total_paid=EXCLUDED.total_paid;

-- Loan schedule FY2025
INSERT INTO loan_schedule (year, month, opening_balance, interest, principal, closing_balance) VALUES
(2025,1,100075.86,654.55,2368.99,97052.32),
(2025,2,97052.32,659.57,2363.97,94668.24),
(2025,3,94668.24,563.07,2460.47,92208.77),
(2025,4,92208.77,568.02,2455.52,89793.47),
(2025,5,89793.47,591.04,2432.50,87341.91),
(2025,6,87341.91,575.03,2448.51,84893.91),
(2025,7,84893.91,522.85,2500.69,82411.77),
(2025,8,82411.77,542.45,2481.09,79930.68),
(2025,9,79930.68,526.12,2497.42,77433.26),
(2025,10,77433.26,493.24,2530.30,74902.96),
(2025,11,74902.96,524.83,2498.71,72372.44),
(2025,12,72372.44,430.46,2593.08,69811.17)
ON CONFLICT (year, month) DO UPDATE SET
  opening_balance=EXCLUDED.opening_balance, interest=EXCLUDED.interest,
  principal=EXCLUDED.principal, closing_balance=EXCLUDED.closing_balance;
