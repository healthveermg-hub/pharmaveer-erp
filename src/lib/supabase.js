import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Revenue ──────────────────────────────────────────────────────────────
export async function getRevenueByYear(year) {
  const { data, error } = await supabase
    .from('revenue_monthly')
    .select('*')
    .eq('year', year)
    .order('month')
  if (error) throw error
  return data
}

export async function upsertRevenue(record) {
  const { error } = await supabase
    .from('revenue_monthly')
    .upsert(record, { onConflict: 'year,month' })
  if (error) throw error
}

// ── Expenses ─────────────────────────────────────────────────────────────
export async function getExpensesByYear(year) {
  const { data, error } = await supabase
    .from('expenses_monthly')
    .select('*')
    .eq('year', year)
    .order('month')
  if (error) throw error
  return data
}

export async function upsertExpense(record) {
  const { error } = await supabase
    .from('expenses_monthly')
    .upsert(record, { onConflict: 'year,month' })
  if (error) throw error
}

// ── CPF ──────────────────────────────────────────────────────────────────
export async function getCPFByYear(year) {
  const { data, error } = await supabase
    .from('cpf_records')
    .select('*')
    .eq('year', year)
    .order('month')
  if (error) throw error
  return data
}

// ── Loan ─────────────────────────────────────────────────────────────────
export async function getLoanByYear(year) {
  const { data, error } = await supabase
    .from('loan_schedule')
    .select('*')
    .eq('year', year)
    .order('month')
  if (error) throw error
  return data
}

// ── Bank Deposits ─────────────────────────────────────────────────────────
export async function getBankDeposits(year, month) {
  let query = supabase.from('bank_deposits').select('*').eq('year', year)
  if (month) query = query.eq('month', month)
  const { data, error } = await query.order('deposit_date')
  if (error) throw error
  return data
}

export async function insertDeposit(record) {
  const { error } = await supabase.from('bank_deposits').insert(record)
  if (error) throw error
}

// ── Documents ─────────────────────────────────────────────────────────────
export async function getDocuments(year) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('year', year)
    .order('date_of_doc', { ascending: false })
  if (error) throw error
  return data
}

export async function insertDocument(record) {
  const { error } = await supabase.from('documents').insert(record)
  if (error) throw error
}

// ── Yearly Summary ────────────────────────────────────────────────────────
export async function getYearlySummary() {
  const { data, error } = await supabase.from('yearly_summary').select('*')
  if (error) throw error
  return data
}
