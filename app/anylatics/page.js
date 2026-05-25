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

// ── Palette ────────────────────────────────────────────────────────────────────

const AMBER = "#f59e0b";
const AMBER_LIGHT = "#fde68a";
const SLATE = "#64748b";
const EMERALD = "#10b981";
const ROSE = "#f43f5e";
const BLUE = "#3b82f6";
const VIOLET = "#8b5cf6";
const COLORS = [AMBER, EMERALD, BLUE, ROSE, VIOLET, SLATE, "#ec4899", "#14b8a6"];

// ── Icons ──────────────────────────────────────────────────────────────────────

const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
const CoinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const WeightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);
const SparkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(n) {
  if (n >= 1_000_000) return `₨${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₨${(n / 1_000).toFixed(1)}K`;
  return `₨${n.toLocaleString("en-PK")}`;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-xs font-semibold text-slate-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-600 text-xs">{p.name}:</span>
          <span className="font-bold text-slate-800 text-xs">
            {prefix === "₨" ? fmt(p.value).replace("₨", "₨") : `${p.value}${prefix}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, accent, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: accent }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
        style={{ background: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ── Chart Card ─────────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className="mb-5">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Top Shop Row ───────────────────────────────────────────────────────────────

function TopShopRow({ rank, name, owner, value, grams, pct, color }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
        style={{ background: color }}
      >
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{name}</p>
        <p className="text-xs text-slate-400 truncate">{owner}</p>
        {/* Progress bar */}
        <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden w-full">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-slate-800">{fmt(value)}</p>
        <p className="text-xs text-slate-400">{grams.toFixed(1)}g</p>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [records, setRecords] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [r, s] = await Promise.all([getAll("records"), getAll("shops")]);
      if (r.error || s.error) {
        setError("Data load nahi hua. Dobara try karein.");
      } else {
        setRecords(r.data || []);
        setShops(s.data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  // ── Derived analytics ──────────────────────────────────────────────────────

  const analytics = useMemo(() => {
    if (!records.length) return null;

    const totalValue = records.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
    const totalGrams = records.reduce((s, r) => s + (parseFloat(r.grams) || 0), 0);
    const avgRati = records.reduce((s, r) => s + (parseFloat(r.rati) || 0), 0) / records.length;
    const avgPrice = totalValue / records.length;

    // --- Revenue by month (last 6 months) ---
    const monthMap = {};
    records.forEach((r) => {
      if (!r.date) return;
      const d = new Date(r.date);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, count: 0, grams: 0 };
      monthMap[key].revenue += parseFloat(r.price) || 0;
      monthMap[key].count += 1;
      monthMap[key].grams += parseFloat(r.grams) || 0;
    });
    const monthlyData = Object.entries(monthMap)
      .sort((a, b) => new Date(`01 ${a[0]}`) - new Date(`01 ${b[0]}`))
      .slice(-6)
      .map(([month, v]) => ({ month, ...v }));

    // --- Revenue per shop ---
    const shopMap = {};
    records.forEach((r) => {
      const shop = shops.find((s) => String(s.id) === String(r.shopId));
      const name = shop?.shop_name || `Shop #${r.shopId}`;
      const owner = shop?.owner_name || "—";
      if (!shopMap[name]) shopMap[name] = { revenue: 0, count: 0, grams: 0, owner };
      shopMap[name].revenue += parseFloat(r.price) || 0;
      shopMap[name].count += 1;
      shopMap[name].grams += parseFloat(r.grams) || 0;
    });
    const shopData = Object.entries(shopMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
    const maxShopRevenue = shopData[0]?.revenue || 1;

    // --- Item distribution (pie) ---
    const itemMap = {};
    records.forEach((r) => {
      const key = r.item?.toLowerCase().trim() || "unknown";
      itemMap[key] = (itemMap[key] || 0) + 1;
    });
    const itemData = Object.entries(itemMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // --- Rati distribution (bar) ---
    const ratiMap = {};
    records.forEach((r) => {
      const key = `${r.rati} rati`;
      if (!ratiMap[key]) ratiMap[key] = { rati: key, count: 0, revenue: 0 };
      ratiMap[key].count += 1;
      ratiMap[key].revenue += parseFloat(r.price) || 0;
    });
    const ratiData = Object.values(ratiMap).sort(
      (a, b) => parseFloat(a.rati) - parseFloat(b.rati)
    );

    // --- Today ---
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = records.filter((r) => r.date?.split("T")[0] === today);
    const todayValue = todayRecords.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);

    return {
      totalValue, totalGrams, avgRati, avgPrice,
      monthlyData, shopData, itemData, ratiData,
      maxShopRevenue, todayRecords, todayValue,
    };
  }, [records, shops]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-amber-500" />
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Analytics Dashboard</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              Business Overview
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Tamam shops aur records ka mukammal tajzia
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">
              {records.length} records · {shops.length} shops
            </span>
          </div>
        </div>

        {loading ? (
          <PageSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <p className="text-2xl mb-2">⚠️</p>
              <p className="text-sm font-semibold text-slate-600">{error}</p>
            </div>
          </div>
        ) : !analytics ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-slate-400">Koi record nahi mila. Pehle kuch records add karein.</p>
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Kul Qeemat"
                value={fmt(analytics.totalValue)}
                sub={`Avg ${fmt(analytics.avgPrice)} per item`}
                icon={<CoinIcon />}
                accent={AMBER}
                delay={0}
              />
              <StatCard
                label="Kul Wazan"
                value={`${analytics.totalGrams.toFixed(1)}g`}
                sub={`${(analytics.totalGrams / records.length).toFixed(2)}g avg per item`}
                icon={<WeightIcon />}
                accent={EMERALD}
                delay={80}
              />
              <StatCard
                label="Kul Records"
                value={records.length}
                sub={`Aaj: ${analytics.todayRecords.length} records`}
                icon={<BoxIcon />}
                accent={BLUE}
                delay={160}
              />
              <StatCard
                label="Total Shops"
                value={shops.length}
                sub={`Avg rati: ${analytics.avgRati.toFixed(1)}`}
                icon={<ShopIcon />}
                accent={VIOLET}
                delay={240}
              />
            </div>

            {/* ── Aaj Ka Summary Banner ── */}
            {analytics.todayRecords.length > 0 && (
              <div
                className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute right-20 bottom-0 w-20 h-20 rounded-full bg-white/5" />
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <SparkIcon />
                </div>
                <div className="relative flex-1">
                  <p className="text-amber-100 text-xs font-bold uppercase tracking-widest">Aaj Ka Kaam</p>
                  <p className="text-white text-xl font-black leading-tight mt-0.5">
                    {analytics.todayRecords.length} records · {fmt(analytics.todayValue)}
                  </p>
                </div>
                <div className="relative flex items-center gap-1 text-amber-100 text-xs font-semibold">
                  <TrendUpIcon />
                  Aaj ka total revenue
                </div>
              </div>
            )}

            {/* ── Row 1: Revenue trend + Pie ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Area — monthly revenue (span 3) */}
              <div className="lg:col-span-3">
                <ChartCard
                  title="Monthly Revenue"
                  subtitle="Har maheene ki total kamai"
                  delay={100}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={analytics.monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={AMBER} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={60} />
                      <Tooltip content={<CustomTooltip prefix="₨" />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke={AMBER}
                        strokeWidth={2.5}
                        fill="url(#revGrad)"
                        dot={{ fill: AMBER, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: AMBER }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Pie — item types (span 2) */}
              <div className="lg:col-span-2">
                <ChartCard
                  title="Item Distribution"
                  subtitle="Kaun si cheez zyada hai"
                  delay={150}
                >
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={analytics.itemData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics.itemData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                    {analytics.itemData.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs text-slate-500 capitalize">{item.name}</span>
                        <span className="text-xs font-bold text-slate-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </div>

            {/* ── Row 2: Rati bar + Top shops ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Bar — rati breakdown */}
              <ChartCard
                title="Rati Breakdown"
                subtitle="Har rati ki records aur revenue"
                delay={200}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics.ratiData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="rati" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                    <Bar yAxisId="left" dataKey="count" name="Records" fill={AMBER} radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill={EMERALD} radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Top shops list */}
              <ChartCard
                title="Top Shops by Revenue"
                subtitle="Sabse zyada kamai karne wale"
                delay={250}
              >
                <div className="space-y-0 divide-y divide-slate-50">
                  {analytics.shopData.slice(0, 6).map((shop, i) => (
                    <TopShopRow
                      key={shop.name}
                      rank={i + 1}
                      name={shop.name}
                      owner={shop.owner}
                      value={shop.revenue}
                      grams={shop.grams}
                      pct={(shop.revenue / analytics.maxShopRevenue) * 100}
                      color={COLORS[i % COLORS.length]}
                    />
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* ── Row 3: Shop revenue bar (full width) ── */}
            {analytics.shopData.length > 1 && (
              <ChartCard
                title="Shop-wise Revenue Comparison"
                subtitle="Har dukaan ki kamai ka moazna"
                delay={300}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analytics.shopData.slice(0, 8)}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmt(v)}
                      width={65}
                    />
                    <Tooltip content={<CustomTooltip prefix="₨" />} />
                    <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]} maxBarSize={48}>
                      {analytics.shopData.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* ── Row 4: Monthly items sold + grams ── */}
            <ChartCard
              title="Monthly Weight & Record Count"
              subtitle="Har maheene kitna maal aaya"
              delay={350}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics.monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gramsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={EMERALD} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                  <Area type="monotone" dataKey="grams" name="Grams" stroke={EMERALD} strokeWidth={2} fill="url(#gramsGrad)" dot={false} />
                  <Area type="monotone" dataKey="count" name="Records" stroke={BLUE} strokeWidth={2} fill="url(#countGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

          </>
        )}
      </main>
    </div>
  );
}