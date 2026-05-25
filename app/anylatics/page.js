"use client";

import { useEffect, useState, useMemo } from "react";
import { getAll } from "@/lib/crud";
import Navbar from "@/components/Navbar";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Color Palette ─────────────────────────────────────────────────────────────
const AMBER = "#f59e0b";
const EMERALD = "#10b981";
const ROSE = "#f43f5e";
const BLUE = "#3b82f6";
const VIOLET = "#8b5cf6";
const COLORS = [ROSE, AMBER, EMERALD, BLUE, VIOLET, "#ec4899", "#14b8a6"];

// ── Icons ─────────────────────────────────────────────────────────────────────
const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CoinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BoxIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ShopIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
  </svg>
);

const SparkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(n) {
  if (n >= 1_000_000) return `₨${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₨${(n / 1_000).toFixed(1)}K`;
  return `₨${n.toLocaleString("en-PK")}`;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-xs font-semibold text-slate-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-800">{typeof p.value === 'number' ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: accent }}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

// ── Chart Card ────────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="mb-6">
        <p className="text-lg font-bold text-slate-800">{title}</p>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [records, setRecords] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [expRes, recRes, shopRes] = await Promise.all([
        getAll("expense"),
        getAll("records"),
        getAll("shops")
      ]);

      if (expRes.error || recRes.error || shopRes.error) {
        setError("Failed to load analytics data");
      } else {
        setExpenses(expRes.data || []);
        setRecords(recRes.data || []);
        setShops(shopRes.data || []);
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  const analytics = useMemo(() => {
    if (!records.length && !expenses.length) return null;

    const totalExpense = expenses.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0);
    const totalRevenue = records.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
    const totalGrams = records.reduce((sum, r) => sum + (parseFloat(r.grams) || 0), 0);

    const today = new Date().toISOString().split("T")[0];
    const todayExpenses = expenses.filter(e => e.created_at?.split("T")[0] === today);
    const todayRecords = records.filter(r => r.date?.split("T")[0] === today);

    // Monthly Trend
    const monthMap = {};
    [...expenses, ...records].forEach(item => {
      const dateStr = item.created_at || item.date;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthMap[key]) monthMap[key] = { month: key, expense: 0, revenue: 0, count: 0 };
      const amount = parseFloat(item.price) || 0;
      if (expenses.includes(item)) monthMap[key].expense += amount;
      else monthMap[key].revenue += amount;
      monthMap[key].count += 1;
    });

    const monthlyData = Object.values(monthMap)
      .sort((a, b) => new Date(`01 ${a.month}`) - new Date(`01 ${b.month}`))
      .slice(-6);

    // Top Expense Items (for new chart)
    const expenseItems = {};
    expenses.forEach(e => {
      const name = e.item?.trim() || "Other";
      expenseItems[name] = (expenseItems[name] || 0) + (parseFloat(e.price) || 0);
    });

    const topExpenses = Object.entries(expenseItems)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Top Shops
    const shopMap = {};
    records.forEach(r => {
      const shop = shops.find(s => String(s.id) === String(r.shopId));
      const name = shop?.shop_name || `Shop #${r.shopId}`;
      if (!shopMap[name]) shopMap[name] = 0;
      shopMap[name] += parseFloat(r.price) || 0;
    });

    const topShops = Object.entries(shopMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return {
      totalExpense,
      totalRevenue,
      totalGrams,
      totalRecords: records.length,
      totalExpenses: expenses.length,
      totalShops: shops.length,
      todayExpense: todayExpenses.reduce((s, e) => s + (parseFloat(e.price) || 0), 0),
      todayRecordsCount: todayRecords.length,
      monthlyData,
      topExpenses,
      topShops,
    };
  }, [expenses, records, shops]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-amber-500" />
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Analytics Dashboard</p>
            </div>
            <h1 className="text-3xl font-black text-slate-900">Business Overview</h1>
            <p className="text-slate-500">Complete analysis of Expenses, Records & Shops</p>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-100 text-sm font-medium">
            {expenses.length + records.length} Total Entries • {shops.length} Shops
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />)}
            </div>
            <div className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : !analytics ? (
          <div className="text-center py-20 text-slate-500">No data available yet.</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard label="Total Revenue" value={fmt(analytics.totalRevenue)} sub="From Records" icon={<CoinIcon />} accent={EMERALD} />
              <StatCard label="Total Expense" value={fmt(analytics.totalExpense)} sub="From Kharcha" icon={<CoinIcon />} accent={ROSE} />
              <StatCard label="Net Balance" value={fmt(analytics.totalRevenue - analytics.totalExpense)} sub="Revenue - Expense" icon={<SparkIcon />} accent={BLUE} />
              <StatCard label="Total Shops" value={analytics.totalShops} sub={`${analytics.totalRecords} Records`} icon={<ShopIcon />} accent={VIOLET} />
            </div>

            {/* Today's Summary */}
            {(analytics.todayExpense > 0 || analytics.todayRecordsCount > 0) && (
              <div className="rounded-3xl p-6 bg-gradient-to-r from-rose-500 to-amber-500 text-white flex items-center gap-6">
                <SparkIcon className="w-12 h-12" />
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-75">TODAY'S ACTIVITY</p>
                  <p className="text-2xl font-black">
                    {fmt(analytics.todayExpense)} spent • {analytics.todayRecordsCount} records
                  </p>
                </div>
              </div>
            )}

            {/* Original Charts + 3 New Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Monthly Revenue vs Expense */}
              <div className="lg:col-span-3">
                <ChartCard title="Monthly Revenue vs Expense" subtitle="Last 6 months">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={fmt} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="natural" dataKey="revenue" name="Revenue" stroke={EMERALD} fill="#10b98130" />
                      <Area type="natural" dataKey="expense" name="Expense" stroke={ROSE} fill="#f43f5e30" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Top Expenses Pie */}
              <div className="lg:col-span-2">
                <ChartCard title="Top Expense Categories" subtitle="Spending Distribution">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={analytics.topExpenses} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value">
                        {analytics.topExpenses.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>

            {/* New Chart 1: Top Shops by Revenue */}
            <ChartCard title="Top Shops by Revenue" subtitle="Performance ranking of shops">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topShops} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={fmt} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill={VIOLET} radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* New Chart 2: Expense Breakdown by Item (Horizontal Bar) */}
            <ChartCard title="Expense Breakdown by Item" subtitle="Top spending items">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.topExpenses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={fmt} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={ROSE} radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* New Chart 3: Monthly Activity Count Trend */}
            <ChartCard title="Monthly Activity Trend" subtitle="Number of records and expenses">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="natural" dataKey="count" name="Total Entries" stroke={BLUE} fill="#3b82f630" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </main>
    </div>
  );
}