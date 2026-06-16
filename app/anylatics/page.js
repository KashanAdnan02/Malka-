"use client";
import { useEffect, useState, useMemo } from "react";
import { getAll } from "@/lib/crud";
import Navbar from "@/components/Navbar";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Icon } from "@/icons";
import { fmt } from "@/utils/helpers";
import Reveal from "@/components/Reveal";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import ShopRow from "@/components/ShopRow";
import DonutLegend from "@/components/DounutLegend";
import { T } from "@/utils/T";

const CHART_COLORS = [T.gold, T.emerald, T.rose, T.blue, T.violet, T.cyan, "#f472b6", "#4ade80"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtISO = (d) => d.toISOString().split("T")[0];

const DATE_PRESETS = [
  { key: "today",     label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week",      label: "This week" },
  { key: "month",     label: "This month" },
  { key: "quarter",   label: "3 months" },
  { key: "all",       label: "All time" },
];

function getPresetRange(key) {
  const t = new Date();
  switch (key) {
    case "today":     return { from: fmtISO(t), to: fmtISO(t) };
    case "yesterday": { const y = new Date(t); y.setDate(t.getDate()-1); return { from: fmtISO(y), to: fmtISO(y) }; }
    case "week":      { const s = new Date(t); s.setDate(t.getDate()-t.getDay()); return { from: fmtISO(s), to: fmtISO(t) }; }
    case "month":     return { from: fmtISO(new Date(t.getFullYear(), t.getMonth(), 1)), to: fmtISO(t) };
    case "quarter":   { const q = new Date(t); q.setMonth(t.getMonth()-3); return { from: fmtISO(q), to: fmtISO(t) }; }
    default:          return { from: "", to: "" };
  }
}

function inRange(dateStr, from, to) {
  if (!dateStr) return false;
  const d = dateStr.split("T")[0];
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

// ── Date Filter Bar ────────────────────────────────────────────────────────────

function DateFilterBar({ dateFrom, dateTo, activePreset, onDateChange, onPresetClick }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Date range</span>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date" value={dateFrom}
            onChange={(e) => onDateChange("from", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
          />
          <span className="text-slate-300">—</span>
          <input
            type="date" value={dateTo}
            onChange={(e) => onDateChange("to", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {DATE_PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onPresetClick(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
              ${activePreset === key
                ? "bg-amber-500 text-white border-amber-500"
                : "border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
              }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "10px 14px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    }}>
      <p style={{ fontSize: 11, color: T.textDim, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: T.textDim }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
            {typeof p.value === "number" && p.value > 999 ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function Skel({ h = 160, r = 20 }) {
  return (
    <div style={{
      height: h, borderRadius: r,
      background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
    }} />
  );
}

const axisStyle = { fontSize: 11, fill: T.textDim };
const gridStyle = { strokeDasharray: "3 3", stroke: T.border };

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [records, setRecords] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filter — default "all time" for analytics
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activePreset, setActivePreset] = useState("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [eR, rR, sR] = await Promise.all([
        getAll("expense"), getAll("records"), getAll("shops"),
      ]);
      if (eR.error || rR.error || sR.error) {
        setError("Data load nahi hua. Dobara try karein.");
      } else {
        setExpenses(eR.data || []);
        setRecords(rR.data || []);
        setShops(sR.data || []);
      }
      setLoading(false);
    })();
  }, []);

  const handleDateChange = (side, value) => {
    if (side === "from") setDateFrom(value);
    else setDateTo(value);
    setActivePreset(null);
  };

  const handlePresetClick = (key) => {
    const { from, to } = getPresetRange(key);
    setDateFrom(from);
    setDateTo(to);
    setActivePreset(key);
  };

  // Filtered slices
  const filteredRecords = useMemo(() =>
    records.filter((r) => inRange(r.date, dateFrom, dateTo)),
    [records, dateFrom, dateTo]
  );
  const filteredExpenses = useMemo(() =>
    expenses.filter((e) => inRange(e.created_at, dateFrom, dateTo)),
    [expenses, dateFrom, dateTo]
  );

  const A = useMemo(() => {
    const totalRevenue = filteredRecords.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
    const totalExpense = filteredExpenses.reduce((s, e) => s + (parseFloat(e.price) || 0), 0);
    const totalGrams   = filteredRecords.reduce((s, r) => s + (parseFloat(r.grams) || 0), 0);
    const netBalance   = totalRevenue - totalExpense;

    const today = fmtISO(new Date());
    const todayRec    = filteredRecords.filter((r) => r.date?.split("T")[0] === today);
    const todayExp    = filteredExpenses.filter((e) => e.created_at?.split("T")[0] === today);
    const todayRecAmt = todayRec.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
    const todayExpAmt = todayExp.reduce((s, e) => s + (parseFloat(e.price) || 0), 0);

    // Monthly breakdown
    const monthMap = {};
    filteredRecords.forEach((r) => {
      if (!r.date) return;
      const d = new Date(r.date);
      const k = `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      if (!monthMap[k]) monthMap[k] = { month: k, revenue: 0, expense: 0, count: 0 };
      monthMap[k].revenue += parseFloat(r.price) || 0;
      monthMap[k].count += 1;
    });
    filteredExpenses.forEach((e) => {
      if (!e.created_at) return;
      const d = new Date(e.created_at);
      const k = `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      if (!monthMap[k]) monthMap[k] = { month: k, revenue: 0, expense: 0, count: 0 };
      monthMap[k].expense += parseFloat(e.price) || 0;
    });
    const monthlyData = Object.values(monthMap)
      .sort((a, b) => new Date(`01 ${a.month}`) - new Date(`01 ${b.month}`))
      .slice(-6);

    // Expense breakdown
    const expMap = {};
    filteredExpenses.forEach((e) => {
      const k = e.item?.trim() || "Other";
      expMap[k] = (expMap[k] || 0) + (parseFloat(e.price) || 0);
    });
    const expenseItems = Object.entries(expMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 7);

    // Shop revenue
    const shopMap = {};
    filteredRecords.forEach((r) => {
      const shop = shops.find((s) => String(s.id) === String(r.shopId));
      const name = shop?.shop_name || `Shop #${r.shopId}`;
      shopMap[name] = (shopMap[name] || 0) + (parseFloat(r.price) || 0);
    });
    const shopRevenue = Object.entries(shopMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue).slice(0, 7);

    // Item distribution
    const itemMap = {};
    filteredRecords.forEach((r) => {
      const k = r.item?.toLowerCase().trim() || "other";
      itemMap[k] = (itemMap[k] || 0) + 1;
    });
    const itemDist = Object.entries(itemMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 6);

    const profitData = monthlyData.map((m) => ({ month: m.month, profit: m.revenue - m.expense }));

    return {
      totalRevenue, totalExpense, netBalance, totalGrams,
      totalRecords: filteredRecords.length,
      totalExpenses: filteredExpenses.length,
      totalShops: shops.length,
      todayExpAmt, todayRecAmt,
      todayExpCount: todayExp.length,
      todayRecCount: todayRec.length,
      monthlyData, expenseItems, shopRevenue, itemDist, profitData,
    };
  }, [filteredRecords, filteredExpenses, shops]);

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }
    body { background: ${T.bg}; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes pulse-ring { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.04); } }
  `;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>
      <style>{globalCSS}</style>
      <Navbar />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 16px 64px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <Reveal delay={0}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: T.gold }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Analytics Dashboard
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 5vw, 38px)",
                fontWeight: 900, color: T.text, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0,
              }}>
                Business Overview
              </h1>
              <p style={{ fontSize: 13, color: T.textDim, marginTop: 6 }}>
                Expenses, records aur shops ka mukammal tajzia
              </p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: "10px 16px",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.emerald, animation: "pulse-ring 2s ease infinite", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textDim }}>
                {filteredRecords.length + filteredExpenses.length} entries &nbsp;·&nbsp; {shops.length} shops
              </span>
            </div>
          </div>
        </Reveal>

        {/* Date filter bar */}
        <Reveal delay={40}>
          <DateFilterBar
            dateFrom={dateFrom}
            dateTo={dateTo}
            activePreset={activePreset}
            onDateChange={handleDateChange}
            onPresetClick={handlePresetClick}
          />
        </Reveal>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[...Array(6)].map((_, i) => <Skel key={i} h={160} />)}
            </div>
            <Skel h={320} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <Skel h={280} /><Skel h={280} />
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: T.rose }}>{error}</div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
              <StatCard delay={60}  label="Total Revenue" value={fmt(A.totalRevenue)}  sub={`${A.totalRecords} records`}          icon={<Icon.Revenue />} accent={T.emerald} />
              <StatCard delay={100} label="Total Expense" value={fmt(A.totalExpense)}  sub={`${A.totalExpenses} items`}           icon={<Icon.Expense />} accent={T.rose}    />
              <StatCard delay={140} label="Net Balance"   value={fmt(A.netBalance)}    sub="Revenue − Expense"                    icon={<Icon.Net />}     accent={A.netBalance >= 0 ? T.emerald : T.rose} />
              <StatCard delay={180} label="Total Weight"  value={`${A.totalGrams.toFixed(1)}g`} sub="All records"                icon={<Icon.Weight />}  accent={T.gold}    />
              <StatCard delay={220} label="Active Shops"  value={A.totalShops}         sub={`Top: ${A.shopRevenue[0]?.name || "—"}`} icon={<Icon.Shop />} accent={T.blue}    />
              <StatCard delay={260} label="Aaj Ka Profit" value={fmt(A.todayRecAmt - A.todayExpAmt)} sub={`${A.todayRecCount} rec · ${A.todayExpCount} exp`} icon={<Icon.Spark />} accent={T.violet} />
            </div>

            {/* Today summary banner — only show when "today" preset or date includes today */}
            {(A.todayExpAmt > 0 || A.todayRecAmt > 0) && (
              <Reveal delay={300}>
                <div style={{
                  borderRadius: 20, padding: "20px 28px",
                  background: `linear-gradient(135deg, ${T.gold}15 0%, ${T.emerald}10 100%)`,
                  border: `1px solid ${T.gold}30`,
                  display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${T.gold}15`, border: `1px solid ${T.gold}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.gold, flexShrink: 0,
                  }}>
                    <Icon.Spark />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                      Aaj Ka Hisaab
                    </p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 900, color: T.text, letterSpacing: "-0.02em" }}>
                      {fmt(A.todayRecAmt)} revenue &nbsp;·&nbsp; {fmt(A.todayExpAmt)} kharch
                    </p>
                  </div>
                  <div style={{
                    padding: "8px 18px", borderRadius: 24, fontSize: 13, fontWeight: 700,
                    background: A.todayRecAmt >= A.todayExpAmt ? `${T.emerald}15` : `${T.rose}15`,
                    border: `1px solid ${A.todayRecAmt >= A.todayExpAmt ? T.emerald : T.rose}30`,
                    color: A.todayRecAmt >= A.todayExpAmt ? T.emerald : T.rose,
                  }}>
                    {A.todayRecAmt >= A.todayExpAmt ? "▲" : "▼"} Net {fmt(Math.abs(A.todayRecAmt - A.todayExpAmt))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Charts row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <ChartCard title="Revenue vs Expense" subtitle="Monthly comparison (last 6 months)" delay={320} accent={T.emerald}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={A.monthlyData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={T.emerald} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.emerald} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={T.rose} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.rose} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={62} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: T.textDim }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={T.emerald} strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 5, fill: T.emerald }} />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke={T.rose}    strokeWidth={2.5} fill="url(#gExp)" dot={false} activeDot={{ r: 5, fill: T.rose    }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Monthly Net Profit" subtitle="Revenue minus Expense" delay={360} accent={T.gold}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={A.profitData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={62} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="profit" name="Net Profit" radius={[8, 8, 0, 0]} maxBarSize={44}>
                      {A.profitData.map((d, i) => <Cell key={i} fill={d.profit >= 0 ? T.emerald : T.rose} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <ChartCard title="Top Shops by Revenue" subtitle="Highest earning shops" delay={400} accent={T.violet}>
                {A.shopRevenue.length === 0
                  ? <p style={{ color: T.textDim, fontSize: 13 }}>Koi shop data nahi</p>
                  : A.shopRevenue.map((s, i) => (
                      <ShopRow key={s.name} rank={i+1} name={s.name} revenue={s.revenue}
                        maxRevenue={A.shopRevenue[0].revenue}
                        color={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))
                }
              </ChartCard>

              <ChartCard title="Expense Categories" subtitle="Spending breakdown" delay={440} accent={T.rose}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={A.expenseItems} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                      {A.expenseItems.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [fmt(v), ""]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLegend data={A.expenseItems} />
              </ChartCard>
            </div>

            {/* Expense breakdown horizontal bar */}
            <ChartCard title="Expense Breakdown by Item" subtitle="Top spending items ranked" delay={480} accent={T.rose}>
              <ResponsiveContainer width="100%" height={Math.max(200, A.expenseItems.length * 48)}>
                <BarChart data={A.expenseItems} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid {...gridStyle} horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
                  <YAxis type="category" dataKey="name" tick={{ ...axisStyle, textAnchor: "end" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" name="Amount" radius={[0, 8, 8, 0]} maxBarSize={28}>
                    {A.expenseItems.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Charts row 3 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <ChartCard title="Shop Revenue Comparison" subtitle="All shops ranked by earning" delay={520} accent={T.blue}>
                <ResponsiveContainer width="100%" height={Math.max(200, A.shopRevenue.length * 48)}>
                  <BarChart data={A.shopRevenue} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid {...gridStyle} horizontal={false} />
                    <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
                    <YAxis type="category" dataKey="name" tick={{ ...axisStyle, textAnchor: "end" }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]} maxBarSize={28}>
                      {A.shopRevenue.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Item Type Distribution" subtitle="Record count by item" delay={560} accent={T.cyan}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={A.itemDist} cx="50%" cy="50%" outerRadius={88} paddingAngle={2} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {A.itemDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v + " records", ""]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Activity volume */}
            <ChartCard title="Monthly Activity Volume" subtitle="Total entries (records + expenses) per month" delay={600} accent={T.gold}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={A.monthlyData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T.gold} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="count" name="Records" stroke={T.gold} strokeWidth={2.5}
                    fill="url(#gCount)" dot={{ r: 4, fill: T.gold, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </main>
    </div>
  );
}