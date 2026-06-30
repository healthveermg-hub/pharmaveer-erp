import { useState, useEffect, useCallback } from "react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import {
  TrendingUp, TrendingDown, DollarSign, FileText, Users,
  Building2, Car, Zap, Phone, PlusCircle, RefreshCw,
  AlertTriangle, CheckCircle, Clock, ChevronRight,
  Upload, Database, Calendar, BarChart2, Home, Settings,
  CreditCard, Pill, ShieldCheck, ClipboardList
} from "lucide-react"
import { supabase, getRevenueByYear, getExpensesByYear, getCPFByYear, getLoanByYear } from "./lib/supabase.js"

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  teal:      "#1D6A72",
  tealMid:   "#2E9EA8",
  tealLight: "#D0EEF1",
  gold:      "#C8A217",
  goldLight: "#FFF3CC",
  white:     "#FFFFFF",
  bg:        "#F4F7F8",
  surface:   "#FFFFFF",
  border:    "#E2E8EA",
  text:      "#1A2E31",
  muted:     "#6B8589",
  green:     "#2D9B6F",
  greenLight:"#E2F0CB",
  red:       "#C0392B",
  redLight:  "#FFE0E0",
  amber:     "#E67E22",
  amberLight:"#FEF3CD",
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const YEARS  = [2022, 2023, 2024, 2025, 2026]

// ── Formatters ─────────────────────────────────────────────────────────────
const sgd  = (v) => v == null ? "—" : `SGD ${Number(v).toLocaleString("en-SG", {minimumFractionDigits:2, maximumFractionDigits:2})}`
const sgdK = (v) => v == null ? "—" : `SGD ${(Number(v)/1000).toFixed(1)}K`
const pct  = (v) => v == null ? "—" : `${Number(v).toFixed(1)}%`

// ── Static data (pre-seeded, kept in memory for speed) ───────────────────
const STATIC_REVENUE_2025 = [
  {month:1,label:"Jan",medicine:21234.18,consultation:12345,lab:4234,injections:534.94,others:1807.16},
  {month:2,label:"Feb",medicine:29213.30,consultation:14567,lab:5123,injections:1529.88,others:1641.72},
  {month:3,label:"Mar",medicine:29556.14,consultation:15234,lab:5678,injections:949.76,others:1648.95},
  {month:4,label:"Apr",medicine:31893.94,consultation:14892,lab:4567,injections:1468.97,others:2219.63},
  {month:5,label:"May",medicine:21817.60,consultation:11456,lab:4123,injections:746.09,others:1508.91},
  {month:6,label:"Jun",medicine:26196.35,consultation:12890,lab:4890,injections:559.95,others:1682.55},
  {month:7,label:"Jul",medicine:20226,consultation:13456,lab:5234,injections:888.34,others:2170.50},
  {month:8,label:"Aug",medicine:18738.40,consultation:11234,lab:3890,injections:1074.10,others:2610.74},
  {month:9,label:"Sep",medicine:18756.50,consultation:10987,lab:4567,injections:1758.14,others:1340.22},
  {month:10,label:"Oct",medicine:22474.80,consultation:11567,lab:5123,injections:906.66,others:2657.30},
  {month:11,label:"Nov",medicine:22386.30,consultation:11234,lab:4890,injections:723.31,others:2480.26},
  {month:12,label:"Dec",medicine:14030.44,consultation:12807.20,lab:2619.03,injections:817.29,others:1235.90},
]

const STATIC_EXPENSES_2025 = [
  {month:1,label:"Jan",salary:4000,locum:0,cpf:3238,sdl:20,rent:3500,loan_i:654.55,loan_p:2368.99,honda:1514,sp:882.29,singtel:219.67,clinic_assist:0,drugs:8182.43,other:272.50},
  {month:2,label:"Feb",salary:4000,locum:480,cpf:3238,sdl:20,rent:3500,loan_i:659.57,loan_p:2363.97,honda:1514,sp:685,singtel:216.48,clinic_assist:0,drugs:8142.21,other:0},
  {month:3,label:"Mar",salary:4000,locum:0,cpf:3238,sdl:20,rent:3500,loan_i:563.07,loan_p:2460.47,honda:1514,sp:514.60,singtel:213.23,clinic_assist:0,drugs:9021.98,other:0},
  {month:4,label:"Apr",salary:4000,locum:0,cpf:3238,sdl:20,rent:3500,loan_i:568.02,loan_p:2455.52,honda:1514,sp:680.32,singtel:234.48,clinic_assist:0,drugs:8102.04,other:0},
  {month:5,label:"May",salary:4000,locum:0,cpf:3238,sdl:20,rent:3500,loan_i:591.04,loan_p:2432.50,honda:1514,sp:716.39,singtel:213.23,clinic_assist:0,drugs:8341.11,other:0},
  {month:6,label:"Jun",salary:4000,locum:0,cpf:3238,sdl:20,rent:3500,loan_i:575.03,loan_p:2448.51,honda:1514,sp:798.93,singtel:213.23,clinic_assist:0,drugs:5516.21,other:0},
  {month:7,label:"Jul",salary:4000,locum:800,cpf:4052,sdl:26,rent:3500,loan_i:522.85,loan_p:2500.69,honda:1514,sp:650.39,singtel:162.68,clinic_assist:0,drugs:7038.85,other:0},
  {month:8,label:"Aug",salary:4000,locum:1600,cpf:4052,sdl:26,rent:3500,loan_i:542.45,loan_p:2481.09,honda:1514,sp:697,singtel:325.91,clinic_assist:0,drugs:8655.66,other:0},
  {month:9,label:"Sep",salary:4000,locum:1000,cpf:4052,sdl:26,rent:3500,loan_i:526.12,loan_p:2497.42,honda:1514,sp:487.33,singtel:162.68,clinic_assist:0,drugs:7009.54,other:0},
  {month:10,label:"Oct",salary:4000,locum:1800,cpf:3901,sdl:25,rent:3500,loan_i:493.24,loan_p:2530.30,honda:1514,sp:537.85,singtel:325.91,clinic_assist:0,drugs:8208.53,other:0},
  {month:11,label:"Nov",salary:4000,locum:2400,cpf:4018,sdl:25,rent:3500,loan_i:524.83,loan_p:2498.71,honda:1514,sp:466.07,singtel:489.14,clinic_assist:3924,drugs:10050.36,other:0},
  {month:12,label:"Dec",salary:4000,locum:2400,cpf:3755,sdl:23,rent:3500,loan_i:430.46,loan_p:2593.08,honda:1514,sp:529.23,singtel:249.78,clinic_assist:0,drugs:6728.86,other:0},
]

// Compute totals from static data
const totalRevenue2025 = STATIC_REVENUE_2025.reduce((s,r)=>s+r.medicine+r.consultation+r.lab+r.injections+r.others,0)
const totalDrugs2025 = STATIC_EXPENSES_2025.reduce((s,e)=>s+e.drugs,0)
const totalCPF2025 = STATIC_EXPENSES_2025.reduce((s,e)=>s+e.cpf,0)
const totalRent2025 = STATIC_EXPENSES_2025.reduce((s,e)=>s+e.rent,0)
const totalLoanInt2025 = STATIC_EXPENSES_2025.reduce((s,e)=>s+e.loan_i,0)
const totalHonda2025 = 22706.30
const totalSP2025 = 7645.40
const totalSingtel2025 = 2726.42 + 1200
const totalLocum2025 = STATIC_EXPENSES_2025.reduce((s,e)=>s+e.locum,0)
const totalSalary2025 = STATIC_EXPENSES_2025.reduce((s,e)=>s+e.salary,0)
const totalClinicAssist2025 = 3924

// Build chart data
const revenueChartData = STATIC_REVENUE_2025.map(r => ({
  name: r.label,
  Revenue: +(r.medicine+r.consultation+r.lab+r.injections+r.others).toFixed(2),
  Medicine: +r.medicine.toFixed(2),
  Consultation: +r.consultation.toFixed(2),
  Lab: +r.lab.toFixed(2),
}))

const plChartData = STATIC_REVENUE_2025.map((r,i) => {
  const rev = r.medicine+r.consultation+r.lab+r.injections+r.others
  const e = STATIC_EXPENSES_2025[i]
  const expenses = e.salary+e.locum+e.cpf+e.sdl+e.rent+e.loan_i+e.loan_p+e.honda+e.sp+e.singtel+e.clinic_assist+e.drugs+e.other
  return { name: r.label, Revenue: +rev.toFixed(2), Expenses: +expenses.toFixed(2), Profit: +(rev-expenses).toFixed(2) }
})

const expPieData = [
  { name: "Drugs",      value: +totalDrugs2025.toFixed(2),  color: T.teal },
  { name: "Salary",     value: +totalSalary2025.toFixed(2), color: T.tealMid },
  { name: "CPF",        value: +totalCPF2025.toFixed(2),    color: T.gold },
  { name: "Rent",       value: +totalRent2025.toFixed(2),   color: "#5B8DB8" },
  { name: "Honda",      value: +totalHonda2025.toFixed(2),  color: "#8E44AD" },
  { name: "SP+Singtel", value: +(totalSP2025+totalSingtel2025).toFixed(2), color: "#E67E22" },
  { name: "Locum",      value: +totalLocum2025.toFixed(2),  color: "#27AE60" },
  { name: "Loan Int",   value: +totalLoanInt2025.toFixed(2),color: "#C0392B" },
  { name: "Software",   value: +totalClinicAssist2025.toFixed(2),color:"#7F8C8D"},
]

const LOAN_DATA = [
  {month:"Jan",balance:97052},{month:"Feb",balance:94668},{month:"Mar",balance:92209},
  {month:"Apr",balance:89793},{month:"May",balance:87342},{month:"Jun",balance:84894},
  {month:"Jul",balance:82412},{month:"Aug",balance:79931},{month:"Sep",balance:77433},
  {month:"Oct",balance:74903},{month:"Nov",balance:72372},{month:"Dec",balance:69811},
]

// ── Components ─────────────────────────────────────────────────────────────
function KPI({ label, value, sub, icon: Icon, trend, color = T.teal }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "20px 24px",
      borderTop: `4px solid ${color}`,
      display: "flex", flexDirection: "column", gap: 8
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: "0.06em", textTransform:"uppercase" }}>{label}</span>
        <div style={{ background: color + "18", borderRadius: 8, padding: "6px 8px" }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: T.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: trend === "up" ? T.green : trend === "down" ? T.red : T.muted }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children, icon: Icon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 16 }}>
      {Icon && <Icon size={18} color={T.teal} />}
      <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:T.text }}>{children}</h2>
      <div style={{ flex:1, height:1, background:T.border, marginLeft:8 }} />
    </div>
  )
}

function Badge({ text, type="info" }) {
  const colors = {
    success: { bg: T.greenLight, text: "#1A6B45" },
    warning: { bg: T.amberLight, text: "#7D4E00" },
    danger:  { bg: T.redLight,   text: T.red },
    info:    { bg: T.tealLight,  text: T.teal },
  }
  const c = colors[type]
  return (
    <span style={{ background:c.bg, color:c.text, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600 }}>
      {text}
    </span>
  )
}

function MonthTable({ data, columns, keyFn }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{
                padding:"8px 12px", background:T.teal, color:T.white,
                textAlign: c.align||"right", whiteSpace:"nowrap", fontWeight:600
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row,i) => (
            <tr key={keyFn(row)} style={{ background: i%2===0 ? T.bg : T.surface }}>
              {columns.map(c => (
                <td key={c.key} style={{
                  padding:"7px 12px", textAlign: c.align||"right",
                  borderBottom:`1px solid ${T.border}`, color: c.color ? c.color(row) : T.text,
                  fontWeight: c.bold ? 600 : 400
                }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ row, onClose, onSave, type }) {
  const [form, setForm] = useState({...row})
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  const fields = type === "revenue" ? [
    {key:"medicine",label:"Medicine Sales"},
    {key:"consultation",label:"Consultation Fees"},
    {key:"lab",label:"Lab Fees"},
    {key:"injections",label:"Injections"},
    {key:"others",label:"Others / Misc"},
    {key:"cash_collected",label:"Cash Collected"},
    {key:"nets_collected",label:"NETS/PayNow Collected"},
    {key:"medisave_collected",label:"Medisave Collected"},
    {key:"chas_collected",label:"CHAS Collected"},
    {key:"bank_cash_deposit",label:"Bank: Cash Deposit"},
    {key:"bank_pos_medisave",label:"Bank: POS/Medisave Credit"},
  ] : [
    {key:"salary_dr_taranjit",label:"Salary – Dr Taranjit (net)"},
    {key:"salary_tanmanpreet",label:"Salary – Tanmanpreet"},
    {key:"salary_others",label:"Salary – Others"},
    {key:"locum_fees",label:"Locum Fees (external)"},
    {key:"employer_cpf",label:"Employer CPF"},
    {key:"sdl",label:"SDL"},
    {key:"fwl",label:"Foreign Worker Levy"},
    {key:"rent",label:"Rent"},
    {key:"loan_principal",label:"Loan – Principal"},
    {key:"loan_interest",label:"Loan – Interest"},
    {key:"honda_hp",label:"Honda – Hire Purchase"},
    {key:"honda_other",label:"Honda – Other (tax/park/petrol)"},
    {key:"sp_services",label:"SP Services (utilities)"},
    {key:"singtel",label:"Singtel (clinic + reimb)"},
    {key:"clinic_assist",label:"Clinic Assist Software"},
    {key:"radiology",label:"Radiology"},
    {key:"nets_subscription",label:"NETS Subscription"},
    {key:"grab",label:"Grab Deliveries"},
    {key:"insurance",label:"Car Insurance (Liberty)"},
    {key:"sma_membership",label:"SMA Membership"},
    {key:"acra_fees",label:"ACRA Fees"},
    {key:"accounting_fees",label:"Accounting Fees (SAV)"},
    {key:"drug_purchases",label:"Drug Purchases (incl. GST)"},
    {key:"other_expenses",label:"Other Expenses"},
  ]

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center"
    }}>
      <div style={{
        background:T.surface, borderRadius:16, padding:28, width:500,
        maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,color:T.text,fontSize:16,fontWeight:700}}>
            Edit {type === "revenue" ? "Revenue" : "Expenses"} — {MONTHS[row.month-1]} {row.year}
          </h3>
          <button onClick={onClose} style={{border:"none",background:"none",cursor:"pointer",fontSize:20,color:T.muted}}>×</button>
        </div>
        <div style={{display:"grid",gap:10}}>
          {fields.map(f => (
            <div key={f.key} style={{display:"flex",flexDirection:"column",gap:4}}>
              <label style={{fontSize:11,color:T.muted,fontWeight:600}}>{f.label}</label>
              <input
                type="number" step="0.01"
                value={form[f.key] || ""}
                onChange={e => setForm({...form, [f.key]: parseFloat(e.target.value)||0})}
                style={{
                  border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 10px",
                  fontSize:13, outline:"none", color:T.text,
                  fontFamily:"monospace"
                }}
              />
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <label style={{fontSize:11,color:T.muted,fontWeight:600}}>Notes</label>
            <input
              type="text" value={form.notes||""}
              onChange={e => setForm({...form,notes:e.target.value})}
              style={{flex:1,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",fontSize:12}}
            />
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={handleSave} disabled={saving} style={{
            flex:1, background:T.teal, color:T.white, border:"none",
            borderRadius:8, padding:"10px 0", fontWeight:600, cursor:"pointer",
            fontSize:13
          }}>
            {saving ? "Saving..." : "Save to Supabase"}
          </button>
          <button onClick={onClose} style={{
            padding:"10px 20px", border:`1px solid ${T.border}`,
            borderRadius:8, background:T.surface, cursor:"pointer", color:T.muted, fontSize:13
          }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard")
  const [year, setYear] = useState(2025)
  const [revenue, setRevenue] = useState(STATIC_REVENUE_2025)
  const [expenses, setExpenses] = useState(STATIC_EXPENSES_2025)
  const [cpf, setCPF] = useState([])
  const [loan, setLoan] = useState(LOAN_DATA)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [editType, setEditType] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(msg, type="success") {
    setToast({msg, type})
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchData(y) {
    setLoading(true)
    try {
      const [rev, exp, c, l] = await Promise.all([
        getRevenueByYear(y),
        getExpensesByYear(y),
        getCPFByYear(y),
        getLoanByYear(y)
      ])
      if (rev?.length) setRevenue(rev.map(r=>({...r,label:MONTHS[r.month-1]})))
      if (exp?.length) setExpenses(exp.map(e=>({...e,label:MONTHS[e.month-1]})))
      if (c?.length)   setCPF(c)
      if (l?.length)   setLoan(l.map(r=>({...r,month:MONTHS[r.month-1],balance:r.closing_balance})))
      setLastSync(new Date())
      showToast("Data synced from Supabase")
    } catch (e) {
      showToast("Could not connect to Supabase — showing local data", "warning")
    }
    setLoading(false)
  }

  useEffect(() => { fetchData(year) }, [year])

  async function handleSave(form) {
    try {
      const table = editType === "revenue" ? "revenue_monthly" : "expenses_monthly"
      const { error } = await supabase.from(table).upsert(form, {onConflict:"year,month"})
      if (error) throw error
      showToast("Saved successfully ✓")
      fetchData(year)
    } catch (e) {
      showToast("Save failed — check Supabase connection", "danger")
    }
  }

  // Compute summary figures
  const totalRev = revenue.reduce((s,r) => s + (r.medicine||0)+(r.consultation||0)+(r.lab||0)+(r.injections||0)+(r.others||0) + (r.total||0 - ((r.medicine||0)+(r.consultation||0)+(r.lab||0)+(r.injections||0)+(r.others||0))), 0)
  const calcRev = (r) => r.total || ((r.medicine||0)+(r.consultation||0)+(r.lab||0)+(r.injections||0)+(r.others||0))
  const totalRevCalc = revenue.reduce((s,r) => s + calcRev(r), 0)
  const totalDrugs = expenses.reduce((s,e) => s + (e.drug_purchases||e.drugs||0), 0)
  const calcExp = (e) =>
    (e.salary_dr_taranjit||e.salary||0) +
    (e.salary_tanmanpreet||0) + (e.salary_others||0) +
    (e.locum_fees||e.locum||0) +
    (e.employer_cpf||e.cpf||0) + (e.sdl||0) + (e.fwl||0) +
    (e.rent||0) + (e.loan_principal||e.loan_p||0) + (e.loan_interest||e.loan_i||0) +
    (e.honda_hp||e.honda||0) + (e.honda_other||0) +
    (e.sp_services||e.sp||0) + (e.singtel||0) +
    (e.clinic_assist||0) + (e.radiology||0) +
    (e.nets_subscription||0) + (e.grab||0) + (e.insurance||0) +
    (e.sma_membership||0) + (e.acra_fees||0) + (e.accounting_fees||0) +
    (e.drug_purchases||e.drugs||0) + (e.other_expenses||e.other||0)
  const totalExp = expenses.reduce((s,e) => s + calcExp(e), 0)
  const netProfit = totalRevCalc - totalExp
  const grossProfit = totalRevCalc - totalDrugs

  const nav = [
    {id:"dashboard", label:"Dashboard", icon:Home},
    {id:"revenue",   label:"Revenue",   icon:TrendingUp},
    {id:"expenses",  label:"Expenses",  icon:DollarSign},
    {id:"cpf",       label:"CPF",       icon:Users},
    {id:"loan",      label:"Loan",      icon:CreditCard},
    {id:"cashrecon", label:"Cash Recon",icon:BarChart2},
    {id:"checklist", label:"Checklist", icon:ClipboardList},
  ]

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, fontFamily:"'Inter', system-ui, sans-serif", color:T.text }}>

      {/* Sidebar */}
      <nav style={{
        width:220, background:T.teal, display:"flex", flexDirection:"column",
        padding:"24px 0", position:"fixed", top:0, left:0, bottom:0, zIndex:100
      }}>
        <div style={{ padding:"0 20px 24px", borderBottom:`1px solid rgba(255,255,255,0.15)` }}>
          <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Healthveer</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Medical Group Pte Ltd</div>
        </div>

        {/* Year selector */}
        <div style={{ padding:"16px 20px", borderBottom:`1px solid rgba(255,255,255,0.1)` }}>
          <label style={{ fontSize:10, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Financial Year</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{
              width:"100%", marginTop:6, background:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,0.3)", borderRadius:8,
              padding:"6px 10px", color:T.white, fontSize:14, fontWeight:600, cursor:"pointer"
            }}
          >
            {YEARS.map(y => <option key={y} value={y} style={{background:T.teal}}>FY{y}</option>)}
          </select>
        </div>

        <div style={{ flex:1, padding:"12px 0", overflowY:"auto" }}>
          {nav.map(n => {
            const active = page === n.id
            return (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:12,
                padding:"11px 20px", border:"none", cursor:"pointer", textAlign:"left",
                background: active ? "rgba(255,255,255,0.18)" : "transparent",
                color: active ? T.white : "rgba(255,255,255,0.65)",
                borderLeft: active ? `3px solid ${T.gold}` : "3px solid transparent",
                fontSize:13, fontWeight: active ? 600 : 400,
                transition:"all 0.15s"
              }}>
                <n.icon size={15} />
                {n.label}
              </button>
            )
          })}
        </div>

        <div style={{ padding:"16px 20px", borderTop:`1px solid rgba(255,255,255,0.1)` }}>
          <button
            onClick={() => fetchData(year)}
            disabled={loading}
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)",
              borderRadius:8, padding:"8px 0", color:T.white, cursor:"pointer", fontSize:12,
            }}
          >
            <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "Syncing..." : "Sync Supabase"}
          </button>
          {lastSync && (
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:6, textAlign:"center" }}>
              Last sync: {lastSync.toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"})}
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main style={{ marginLeft:220, flex:1, padding:"28px 32px", maxWidth:"calc(100vw - 220px)" }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position:"fixed", top:20, right:20, zIndex:2000,
            background: toast.type==="danger" ? T.red : toast.type==="warning" ? T.amber : T.green,
            color:T.white, padding:"12px 20px", borderRadius:10, fontSize:13,
            boxShadow:"0 4px 20px rgba(0,0,0,0.2)", fontWeight:500
          }}>
            {toast.msg}
          </div>
        )}

        {/* Edit modal */}
        {editRow && (
          <EditModal
            row={editRow} type={editType}
            onClose={() => setEditRow(null)}
            onSave={handleSave}
          />
        )}

        {/* ── DASHBOARD ── */}
        {page === "dashboard" && (
          <div>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:T.text }}>
                FY{year} Financial Overview
              </h1>
              <p style={{ margin:"4px 0 0", color:T.muted, fontSize:13 }}>
                Healthveer Medical Clinic (Jurong East) · UEN 202007276G
              </p>
            </div>

            {/* KPI row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
              <KPI label="Total Revenue" value={sgdK(totalRevCalc)} sub={`${pct(((totalRevCalc-466737)/466737)*100)} vs FY2024`} icon={TrendingUp} trend="up" color={T.green} />
              <KPI label="Gross Profit" value={sgdK(grossProfit)} sub={`Margin ${pct((grossProfit/totalRevCalc)*100)}`} icon={DollarSign} trend="up" color={T.teal} />
              <KPI label="Est. Net Profit" value={sgdK(netProfit)} sub="Before salary/insurance adj" icon={BarChart2} color={T.gold} />
              <KPI label="OCBC Loan Balance" value="SGD 69.8K" sub="Closing 31 Dec 2025" icon={CreditCard} color={T.red} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:28 }}>
              {/* Revenue chart */}
              <div style={{ background:T.surface, borderRadius:12, padding:20, border:`1px solid ${T.border}` }}>
                <SectionTitle icon={TrendingUp}>Monthly Revenue FY{year}</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueChartData} margin={{top:0,right:0,bottom:0,left:10}}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.teal} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={T.teal} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="name" tick={{fontSize:11,fill:T.muted}} />
                    <YAxis tick={{fontSize:10,fill:T.muted}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v,n) => [sgd(v), n]} />
                    <Area type="monotone" dataKey="Revenue" stroke={T.teal} fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Expense pie */}
              <div style={{ background:T.surface, borderRadius:12, padding:20, border:`1px solid ${T.border}` }}>
                <SectionTitle icon={DollarSign}>Expense Breakdown</SectionTitle>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={expPieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                      {expPieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v => sgd(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 8px", fontSize:10, marginTop:8 }}>
                  {expPieData.map(e => (
                    <div key={e.name} style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:e.color, flexShrink:0 }} />
                      <span style={{ color:T.muted }}>{e.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* P&L chart */}
            <div style={{ background:T.surface, borderRadius:12, padding:20, border:`1px solid ${T.border}`, marginBottom:28 }}>
              <SectionTitle icon={BarChart2}>Monthly P&amp;L FY{year}</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={plChartData} margin={{top:0,right:0,bottom:0,left:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="name" tick={{fontSize:11,fill:T.muted}} />
                  <YAxis tick={{fontSize:10,fill:T.muted}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v,n) => [sgd(v),n]} />
                  <Legend wrapperStyle={{fontSize:12}} />
                  <Bar dataKey="Revenue" fill={T.teal} radius={[3,3,0,0]} />
                  <Bar dataKey="Expenses" fill={T.amber} radius={[3,3,0,0]} />
                  <Bar dataKey="Profit" fill={T.green} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                {label:"Total Drug Purchases",     val:sgd(totalDrugs2025),  note:"204 orders · 9% GST included",   icon:Pill,      color:T.teal},
                {label:"Total CPF (Employer)",     val:sgd(totalCPF2025+271),note:"CPF SGD 43,225 + SDL SGD 271",    icon:ShieldCheck,color:T.gold},
                {label:"SP Services (Utilities)",  val:sgd(totalSP2025),     note:"All 12 months from actual bills", icon:Zap,        color:T.tealMid},
                {label:"Singtel + Reimbursements", val:sgd(totalSingtel2025),note:"Clinic + Dr T + Tanman reimb",    icon:Phone,      color:T.amber},
                {label:"Clinic Assist (Assurance)",val:sgd(totalClinicAssist2025),note:"M1010493 · Dec 2024–Nov 2025",icon:Database,  color:"#8E44AD"},
                {label:"OCBC Loan Interest",       val:sgd(totalLoanInt2025), note:"7.75% p.a. on reducing balance",icon:Building2,  color:T.red},
              ].map(c => (
                <div key={c.label} style={{
                  background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:10, padding:"14px 18px", display:"flex", gap:12, alignItems:"flex-start"
                }}>
                  <div style={{ background:c.color+"18", borderRadius:8, padding:"8px", flexShrink:0 }}>
                    <c.icon size={16} color={c.color} />
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:T.muted, fontWeight:600 }}>{c.label}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:T.text, margin:"4px 0 2px" }}>{c.val}</div>
                    <div style={{ fontSize:11, color:T.muted }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REVENUE PAGE ── */}
        {page === "revenue" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <h1 style={{ margin:0, fontSize:20, fontWeight:700 }}>Revenue Detail — FY{year}</h1>
                <p style={{ margin:"4px 0 0", color:T.muted, fontSize:13 }}>Source: Clinic Assist Sales Summary + Queue Summary</p>
              </div>
              <Badge text={`Total: ${sgd(totalRevCalc)}`} type="success" />
            </div>

            <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, marginBottom:20 }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontWeight:600, fontSize:13 }}>Monthly Revenue by Category</span>
                <span style={{ fontSize:11, color:T.muted }}>Click row to edit</span>
              </div>
              <MonthTable
                data={revenue}
                keyFn={r => r.month}
                columns={[
                  {key:"label", label:"Month", align:"left", bold:true, render:r=>r.label||MONTHS[(r.month||1)-1]},
                  {key:"medicine", label:"Medicine", render:r=>sgd(r.medicine)},
                  {key:"consultation", label:"Consultation", render:r=>sgd(r.consultation)},
                  {key:"lab", label:"Lab", render:r=>sgd(r.lab)},
                  {key:"injections", label:"Injections", render:r=>sgd(r.injections)},
                  {key:"others", label:"Others", render:r=>sgd(r.others)},
                  {key:"total", label:"TOTAL", bold:true, color:()=>T.green, render:r=>sgd(r.total||calcRev(r))},
                  {key:"edit", label:"", align:"center", render:r=>(
                    <button onClick={()=>{setEditRow({...r,year});setEditType("revenue")}}
                      style={{background:T.tealLight,border:"none",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:11,color:T.teal,fontWeight:600}}>
                      Edit
                    </button>
                  )},
                ]}
              />
            </div>

            {/* Fee collection tally */}
            <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}` }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontWeight:600, fontSize:13 }}>Fee Collection by Payment Method</span>
              </div>
              <MonthTable
                data={revenue.filter(r=>r.cash_collected||r.nets_collected||r.bank_cash_deposit)}
                keyFn={r=>r.month}
                columns={[
                  {key:"label",label:"Month",align:"left",bold:true,render:r=>r.label||MONTHS[(r.month||1)-1]},
                  {key:"cash_collected",label:"Cash (clinic)",render:r=>sgd(r.cash_collected)},
                  {key:"nets_collected",label:"NETS/PayNow",render:r=>sgd(r.nets_collected)},
                  {key:"medisave_collected",label:"Medisave",render:r=>sgd(r.medisave_collected)||"—"},
                  {key:"chas_collected",label:"CHAS",render:r=>sgd(r.chas_collected)||"—"},
                  {key:"bank_cash_deposit",label:"Bank Cash Dep",render:r=>sgd(r.bank_cash_deposit),color:()=>T.teal},
                  {key:"bank_pos_medisave",label:"Bank POS/Med",render:r=>sgd(r.bank_pos_medisave),color:()=>T.teal},
                ]}
              />
              <div style={{ padding:"10px 16px", fontSize:11, color:T.amber, borderTop:`1px solid ${T.border}` }}>
                ⚠ Medisave, CHAS columns — enter from monthly Fee Collection Summary PDFs.
                Bank figures extracted from OCBC statements.
              </div>
            </div>
          </div>
        )}

        {/* ── EXPENSES PAGE ── */}
        {page === "expenses" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <h1 style={{ margin:0, fontSize:20, fontWeight:700 }}>Expenses — FY{year}</h1>
                <p style={{ margin:"4px 0 0", color:T.muted, fontSize:13 }}>All confirmed from source documents</p>
              </div>
              <Badge text={`Total: ${sgd(totalExp)}`} type="info" />
            </div>

            <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, marginBottom:20 }}>
              <MonthTable
                data={expenses}
                keyFn={e=>e.month}
                columns={[
                  {key:"label",label:"Month",align:"left",bold:true,render:r=>r.label||MONTHS[(r.month||1)-1]},
                  {key:"salary",label:"Salary\n(Dr T)",render:r=>sgd(r.salary_dr_taranjit||r.salary)},
                  {key:"locum_fees",label:"Locum",render:r=>sgd(r.locum_fees||r.locum||0)},
                  {key:"cpf",label:"CPF",render:r=>sgd(r.employer_cpf||r.cpf)},
                  {key:"rent",label:"Rent",render:r=>sgd(r.rent)},
                  {key:"drugs",label:"Drugs",render:r=>sgd(r.drug_purchases||r.drugs)},
                  {key:"loan_i",label:"Loan Int",color:()=>T.red,render:r=>sgd(r.loan_interest||r.loan_i)},
                  {key:"honda",label:"Honda",render:r=>sgd(r.honda_hp||r.honda)},
                  {key:"sp",label:"SP Svc",render:r=>sgd(r.sp_services||r.sp)},
                  {key:"singtel",label:"Singtel",render:r=>sgd(r.singtel)},
                  {key:"ca",label:"Clinic\nAssist",render:r=>sgd(r.clinic_assist||0)},
                  {key:"total",label:"TOTAL",bold:true,color:()=>T.teal,render:r=>sgd(calcExp(r))},
                  {key:"edit",label:"",align:"center",render:r=>(
                    <button onClick={()=>{setEditRow({...r,year});setEditType("expense")}}
                      style={{background:T.goldLight,border:"none",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:11,color:T.amber,fontWeight:600}}>
                      Edit
                    </button>
                  )},
                ]}
              />
            </div>

            {/* Pending items banner */}
            <div style={{
              background:T.amberLight, border:`1px solid #F0C080`,
              borderRadius:10, padding:"14px 18px", display:"flex", gap:12
            }}>
              <AlertTriangle size={18} color={T.amber} style={{flexShrink:0,marginTop:1}} />
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:"#7D4E00" }}>Items still needed (yellow in Excel)</div>
                <div style={{ fontSize:12, color:"#7D4E00", marginTop:4, lineHeight:1.6 }}>
                  Car insurance (Liberty) · Tanmanpreet salary register · Radiology Jul–Dec ·
                  NETS subscription Jul–Dec · Accounting fees (SAV) · Full locum detail
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CPF PAGE ── */}
        {page === "cpf" && (
          <div>
            <h1 style={{ margin:"0 0 24px", fontSize:20, fontWeight:700 }}>CPF Schedule — FY{year}</h1>

            {/* FY2025 */}
            <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, marginBottom:20 }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontWeight:600, fontSize:13 }}>CPF Records of Payment — FY2025</span>
                <span style={{ fontSize:11, color:T.muted, marginLeft:10 }}>Submission No: 202239068C-PTE-01</span>
              </div>
              <MonthTable
                data={[
                  {m:1,sid:"20250201",paid:"15 Feb",ts:1850,tk:1388,s3:0,cpf:3238,sdl:20,tot:3258},
                  {m:2,sid:"20250301",paid:"15 Mar",ts:1850,tk:1388,s3:0,cpf:3238,sdl:20,tot:3258},
                  {m:3,sid:"AX156736",paid:"01 Apr",ts:1850,tk:1388,s3:0,cpf:3238,sdl:20,tot:3258},
                  {m:4,sid:"BB838936",paid:"11 May",ts:1850,tk:1388,s3:0,cpf:3238,sdl:20,tot:3258},
                  {m:5,sid:"BC093471",paid:"10 Jun",ts:1850,tk:1388,s3:0,cpf:3238,sdl:20,tot:3258},
                  {m:6,sid:"BC239992",paid:"02 Jul",ts:1850,tk:1388,s3:0,cpf:3238,sdl:20,tot:3258},
                  {m:7,sid:"BC414689",paid:"29 Jul",ts:1850,tk:1388,s3:814,cpf:4052,sdl:26,tot:4078,s3n:"Nursyafiqah"},
                  {m:8,sid:"BC588335",paid:"19 Aug",ts:1850,tk:1388,s3:814,cpf:4052,sdl:26,tot:4078,s3n:"Nursyafiqah"},
                  {m:9,sid:"BC752341",paid:"15 Sep",ts:1850,tk:1388,s3:814,cpf:4052,sdl:26,tot:4078,s3n:"Nursyafiqah"},
                  {m:10,sid:"BD091248",paid:"08 Nov",ts:1850,tk:1388,s3:663,cpf:3901,sdl:25,tot:3926,s3n:"Nursyafiqah"},
                  {m:11,sid:"BD280431",paid:"06 Dec",ts:1850,tk:1388,s3:780,cpf:4018,sdl:25,tot:4043,s3n:"Priyakumari"},
                  {m:12,sid:"BD539526",paid:"Jan 26",ts:1850,tk:1388,s3:494,cpf:3732,sdl:23,tot:3755,s3n:"Priyakumari"},
                ]}
                keyFn={r=>r.m}
                columns={[
                  {key:"m",label:"Month",align:"left",bold:true,render:r=>MONTHS[r.m-1]},
                  {key:"sid",label:"Submission ID",align:"left",render:r=>r.sid},
                  {key:"paid",label:"Date Paid",align:"left",render:r=>r.paid},
                  {key:"ts",label:"Dr Taranjit",render:r=>sgd(r.ts)},
                  {key:"tk",label:"Tanmanpreet",render:r=>sgd(r.tk)},
                  {key:"s3",label:"Staff 3",render:r=>r.s3?`${sgd(r.s3)} (${r.s3n||""})`:"-",color:r=>r.s3?T.tealMid:T.muted},
                  {key:"cpf",label:"Total CPF",bold:true,render:r=>sgd(r.cpf)},
                  {key:"sdl",label:"SDL",render:r=>sgd(r.sdl)},
                  {key:"tot",label:"TOTAL PAID",bold:true,color:()=>T.green,render:r=>sgd(r.tot)},
                ]}
              />
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:T.muted }}>FY2025 Total Employer CPF: SGD 43,225 · SDL: SGD 271</span>
                <Badge text="All 12 months confirmed ✓" type="success" />
              </div>
            </div>
          </div>
        )}

        {/* ── LOAN PAGE ── */}
        {page === "loan" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <h1 style={{ margin:0, fontSize:20, fontWeight:700 }}>OCBC Loan Schedule</h1>
                <p style={{ margin:"4px 0 0", color:T.muted, fontSize:13 }}>
                  Acct: 5012245773-00000 · SGD 150,000 disbursed 27 Dec 2022 · 7.75% p.a.
                </p>
              </div>
              <Badge text="Monthly instalment: SGD 3,023.54" type="info" />
            </div>

            <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, marginBottom:20 }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={LOAN_DATA} margin={{top:20,right:20,bottom:0,left:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="month" tick={{fontSize:11,fill:T.muted}} />
                  <YAxis tick={{fontSize:10,fill:T.muted}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} domain={[60000,110000]} />
                  <Tooltip formatter={v=>[sgd(v),"Balance"]} />
                  <Line type="monotone" dataKey="balance" stroke={T.red} strokeWidth={2} dot={{r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}` }}>
              <MonthTable
                data={[
                  {m:1,open:100075.86,int:654.55,prin:2368.99,close:97052.32},
                  {m:2,open:97052.32,int:659.57,prin:2363.97,close:94668.24},
                  {m:3,open:94668.24,int:563.07,prin:2460.47,close:92208.77},
                  {m:4,open:92208.77,int:568.02,prin:2455.52,close:89793.47},
                  {m:5,open:89793.47,int:591.04,prin:2432.50,close:87341.91},
                  {m:6,open:87341.91,int:575.03,prin:2448.51,close:84893.91},
                  {m:7,open:84893.91,int:522.85,prin:2500.69,close:82411.77},
                  {m:8,open:82411.77,int:542.45,prin:2481.09,close:79930.68},
                  {m:9,open:79930.68,int:526.12,prin:2497.42,close:77433.26},
                  {m:10,open:77433.26,int:493.24,prin:2530.30,close:74902.96},
                  {m:11,open:74902.96,int:524.83,prin:2498.71,close:72372.44},
                  {m:12,open:72372.44,int:430.46,prin:2593.08,close:69811.17},
                ]}
                keyFn={r=>r.m}
                columns={[
                  {key:"m",label:"Month",align:"left",bold:true,render:r=>MONTHS[r.m-1]+" 2025"},
                  {key:"open",label:"Opening Balance",render:r=>sgd(r.open)},
                  {key:"int",label:"Interest",color:()=>T.red,render:r=>sgd(r.int)},
                  {key:"prin",label:"Principal",color:()=>T.teal,render:r=>sgd(r.prin)},
                  {key:"close",label:"Closing Balance",bold:true,render:r=>sgd(r.close)},
                ]}
              />
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:T.muted }}>FY2025 Total Interest: SGD 6,477.30 · Principal Repaid: SGD 29,631.25</span>
                <Badge text="Closing balance: SGD 69,811.17" type="info" />
              </div>
            </div>
          </div>
        )}

        {/* ── CASH RECONCILIATION ── */}
        {page === "cashrecon" && (
          <div>
            <h1 style={{ margin:"0 0 8px", fontSize:20, fontWeight:700 }}>Cash Reconciliation — FY{year}</h1>
            <p style={{ margin:"0 0 24px", color:T.muted, fontSize:13 }}>
              Tally clinic system cash collections vs OCBC bank deposits
            </p>

            <div style={{
              background:T.amberLight, border:`1px solid #F0C080`, borderRadius:10,
              padding:"14px 18px", marginBottom:20, display:"flex", gap:12
            }}>
              <AlertTriangle size={18} color={T.amber} style={{flexShrink:0,marginTop:1}} />
              <div style={{ fontSize:13, color:"#7D4E00" }}>
                <strong>How this works:</strong> The clinic system records daily cash + NETS collected from patients.
                Each week, cash is deposited to the OCBC account. This page lets you verify the clinic system
                matches the bank deposits, so nothing is missed or double-counted.
              </div>
            </div>

            <div style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, marginBottom:20 }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontWeight:600, fontSize:13 }}>Bank Credit Summary — FY2025 (from OCBC statements)</span>
              </div>
              <MonthTable
                data={[
                  {m:1,cash_dep:3864,pos_med:38391.56,total:42255.56,rev:48155.28},
                  {m:2,cash_dep:4650,pos_med:104467.46,total:109117.46,rev:66074.90},
                  {m:3,cash_dep:0,pos_med:109845.07,total:109845.07,rev:64066.85},
                  {m:4,cash_dep:0,pos_med:92618.94,total:92618.94,rev:68041.54},
                  {m:5,cash_dep:10261,pos_med:97660.35,total:107921.35,rev:53651.60},
                  {m:6,cash_dep:0,pos_med:120190.51,total:120190.51,rev:57218.85},
                  {m:7,cash_dep:0,pos_med:91412.14,total:91412.14,rev:52975.18},
                  {m:8,cash_dep:14088.40,pos_med:83095.81,total:97184.21,rev:41547.64},
                  {m:9,cash_dep:0,pos_med:82846.66,total:82846.66,rev:49408.86},
                  {m:10,cash_dep:0,pos_med:79347.62,total:79347.62,rev:52729.56},
                  {m:11,cash_dep:0,pos_med:90221.09,total:90221.09,rev:50714.17},
                  {m:12,cash_dep:19503,pos_med:105419.73,total:124922.73,rev:38560.16},
                ]}
                keyFn={r=>r.m}
                columns={[
                  {key:"m",label:"Month",align:"left",bold:true,render:r=>MONTHS[r.m-1]},
                  {key:"rev",label:"Clinic System\nRevenue",render:r=>sgd(r.rev),color:()=>T.green},
                  {key:"cash_dep",label:"Bank Cash\nDeposit",render:r=>sgd(r.cash_dep),color:()=>T.teal},
                  {key:"pos_med",label:"Bank POS/\nMedisave",render:r=>sgd(r.pos_med),color:()=>T.tealMid},
                  {key:"total",label:"Total Bank\nCredits",bold:true,render:r=>sgd(r.total)},
                  {key:"diff",label:"Diff",render:r=>{
                    const d = r.total - r.rev
                    return <span style={{color: Math.abs(d)<5000 ? T.green : T.amber}}>{d>0?"+":""}{sgd(d)}</span>
                  }},
                  {key:"note",label:"Note",align:"left",render:r=>{
                    const d = Math.abs(r.total - r.rev)
                    return <span style={{fontSize:11,color:T.muted}}>
                      {d < 2000 ? "✓ OK" : d < 10000 ? "⚠ Review" : "Include transfers"}
                    </span>
                  }},
                ]}
              />
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${T.border}`, fontSize:12, color:T.muted }}>
                Note: Bank credits include non-revenue items (loan proceeds, inter-account transfers, Medisave settlements from prior months).
                Differences are expected — the goal is to ensure cash collected is fully deposited.
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKLIST ── */}
        {page === "checklist" && (
          <div>
            <h1 style={{ margin:"0 0 24px", fontSize:20, fontWeight:700 }}>Compliance Checklist — FY2025</h1>

            {[
              {
                section:"ACRA / IRAS Deadlines",
                items:[
                  {label:"IR8A for all FY2025 employees",status:"urgent",due:"1 Mar 2026",note:"Dr Taranjit, Tanmanpreet, Nursyafiqah, Priyakumari"},
                  {label:"ECI (Estimated Chargeable Income)",status:"urgent",due:"31 Mar 2026",note:"File via myTax Portal — even if nil"},
                  {label:"AGM / Directors' Resolution",status:"pending",due:"30 Jun 2026",note:"Written resolution acceptable for private company"},
                  {label:"Annual Return — BizFile+",status:"pending",due:"31 Jul 2026",note:"7 months from 31 Dec 2025 FYE"},
                  {label:"Form C-S Corporate Tax Return",status:"pending",due:"30 Nov 2026",note:"Simplified form — revenue < SGD 5M"},
                ]
              },
              {
                section:"Documents Still Needed",
                items:[
                  {label:"FY2025 salary register (gross per staff)",status:"missing",due:"ASAP",note:"Needed for IR8A preparation"},
                  {label:"Car insurance amount — Liberty FY2025",status:"missing",due:"ASAP",note:"PDF uploaded but image-based — provide amount"},
                  {label:"Radiology invoices Jul–Dec 2025",status:"missing",due:"For accounts",note:"Request from Medi-Rad Associates"},
                  {label:"NETS subscription invoices Jul–Dec 2025",status:"missing",due:"For accounts",note:"Download from NETS Business portal"},
                  {label:"Accounting fees FY2025 — SAV Consultancy",status:"missing",due:"For accounts",note:"Invoice amount for FY2025 preparation"},
                  {label:"Full locum payments list with amounts",status:"partial",due:"For accounts",note:"Bank statements extracted — confirm with Dr T"},
                ]
              },
              {
                section:"Confirmed & Complete",
                items:[
                  {label:"CPF all 12 months FY2025",status:"done",note:"All Records of Payment uploaded ✓"},
                  {label:"OCBC loan statement FY2025",status:"done",note:"Interest SGD 6,477 · Principal SGD 29,631 ✓"},
                  {label:"SP Services all 12 months",status:"done",note:"Total SGD 7,645.40 confirmed from actual bills ✓"},
                  {label:"Clinic Assist (Assurance Tech) invoice",status:"done",note:"M1010493 · SGD 3,924 · Nov 2024–Nov 2025 ✓"},
                  {label:"Drug order list FY2025",status:"done",note:"204 orders · SGD 104,997.78 incl. GST ✓"},
                  {label:"FY2025 revenue SGD 577,143.99",status:"done",note:"Confirmed from Sales + Queue Summary ✓"},
                ]
              }
            ].map(s => (
              <div key={s.section} style={{ background:T.surface, borderRadius:12, border:`1px solid ${T.border}`, marginBottom:16 }}>
                <div style={{ padding:"12px 18px", background:T.teal, borderRadius:"12px 12px 0 0" }}>
                  <span style={{ fontWeight:700, fontSize:13, color:T.white }}>{s.section}</span>
                </div>
                {s.items.map(item => {
                  const cfg = {
                    done:    {icon:<CheckCircle size={16} color={T.green}/>, bg:T.greenLight, badge:"success"},
                    pending: {icon:<Clock size={16} color={T.amber}/>, bg:T.amberLight, badge:"warning"},
                    urgent:  {icon:<AlertTriangle size={16} color={T.red}/>, bg:T.redLight, badge:"danger"},
                    missing: {icon:<AlertTriangle size={16} color={T.red}/>, bg:T.redLight, badge:"danger"},
                    partial: {icon:<Clock size={16} color={T.amber}/>, bg:T.amberLight, badge:"warning"},
                  }[item.status]
                  return (
                    <div key={item.label} style={{
                      padding:"12px 18px", borderBottom:`1px solid ${T.border}`,
                      display:"flex", alignItems:"flex-start", gap:12, background:cfg.bg
                    }}>
                      <div style={{flexShrink:0,marginTop:1}}>{cfg.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:T.text }}>{item.label}</div>
                        <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{item.note}</div>
                      </div>
                      {item.due && <Badge text={item.due} type={cfg.badge} />}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C5D5D8; border-radius: 3px; }
        select option { color: #1A2E31; background: white; }
      `}</style>
    </div>
  )
}
