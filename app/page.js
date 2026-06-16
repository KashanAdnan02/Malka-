"use client";
import { useEffect, useState } from "react";
import { create, deleteData, getAll, update } from "@/lib/crud";
import Navbar from "@/components/Navbar";
import statusToast from "@/components/StatusToast";
import RecordsTable from "@/components/RecordTable";
import { StatsSkeleton } from "@/components/Skeleton";
import RecordForm from "@/components/RecordForm";

const emptyForm = {
  item: "",
  grams: "",
  price: "",
  profit: "",
  rati: "",
  shopId: "",
  date: new Date().toISOString().split("T")[0],
};
const fmtISO = (d) => d.toISOString().split("T")[0];

const presets = {
  today: () => {
    const t = new Date();
    return { from: fmtISO(t), to: fmtISO(t), label: "Today" };
  },
  yesterday: () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return { from: fmtISO(y), to: fmtISO(y), label: "Yesterday" };
  },
  week: () => {
    const t = new Date();
    const s = new Date(t);
    s.setDate(t.getDate() - t.getDay());
    return { from: fmtISO(s), to: fmtISO(t), label: "This week" };
  },
  month: () => {
    const t = new Date();
    return {
      from: fmtISO(new Date(t.getFullYear(), t.getMonth(), 1)),
      to: fmtISO(t),
      label: "This month",
    };
  },
  all: () => ({ from: "", to: "", label: "All" }),
};

// ── Date Filter Bar ────────────────────────────────────────────────────────────

function DateFilterBar({
  dateFrom,
  dateTo,
  activePreset,
  onDateChange,
  onPresetClick,
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4 shadow-sm">
      {/* Calendar icon + inputs */}
      <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
          Date range
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateChange("from", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
          />
          <span className="text-slate-300 text-sm">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateChange("to", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(presets).map(([key, fn]) => (
          <button
            key={key}
            onClick={() => onPresetClick(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
              ${
                activePreset === key
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
              }`}
          >
            {fn().label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Home() {
  const [records, setRecords] = useState([]);
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("records");

  // Date filter state — default to "today"
  const [dateFrom, setDateFrom] = useState(fmtISO(new Date()));
  const [dateTo, setDateTo] = useState(fmtISO(new Date()));
  const [activePreset, setActivePreset] = useState("today");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRecords = async () => {
    setFetching(true);
    const { data, error } = await getAll("records");
    if (!error) setRecords(data || []);
    else showToast("Failed to load records", "error");
    setFetching(false);
  };

  const fetchShops = async () => {
    const { data, error } = await getAll("shops");
    if (!error) setShops(data || []);
    else showToast("Failed to load shops", "error");
  };

  useEffect(() => {
    fetchRecords();
    fetchShops();
  }, []);

  const handleDateChange = (side, value) => {
    if (side === "from") setDateFrom(value);
    else setDateTo(value);
    setActivePreset(null); // deselect preset when user types manually
  };

  const handlePresetClick = (key) => {
    const { from, to } = presets[key]();
    setDateFrom(from);
    setDateTo(to);
    setActivePreset(key);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    const required = ["item", "grams", "price", "rati", "shopId", "date"];
    for (const field of required) {
      if (!form[field]) return showToast("Please fill in all fields", "error");
    }
    setLoading(true);
    const payload = {
      item: form.item,
      grams: parseFloat(form.grams),
      price: parseFloat(form.price),
      profit:
        parseFloat(form.profit) || Math.round(parseFloat(form.price) * 0.05),
      rati: parseFloat(form.rati),
      shopId: form.shopId,
      date: form.date,
    };

    const result = editingId
      ? await update(editingId, payload, "records")
      : await create(payload, "records");

    if (!result.error) {
      showToast(editingId ? "Record update ho gaya!" : "Record save ho gaya!");
      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
      setActiveTab("records");
    } else {
      showToast(result.error?.message || "Kuch masla aa gaya", "error");
    }
    setLoading(false);
  };

  const handleEdit = (record) => {
    setForm({
      item: record.item || "",
      grams: record.grams || "",
      price: record.price || "",
      profit: record.profit || "",
      rati: record.rati || "",
      shopId: record.shopId || "",
      date: record.date || emptyForm.date,
    });
    setEditingId(record.id || record._id);
    setActiveTab("form");
  };

  const handleDelete = async (id) => {
    const { error } = await deleteData(id, "records");
    if (!error) {
      showToast("Record delete ho gaya");
      setRecords((prev) => prev.filter((r) => (r.id || r._id) !== id));
    } else {
      showToast("Delete nahi hua, dobara try karein", "error");
    }
    setDeleteConfirm(null);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setActiveTab("records");
  };

  // ── Filter records by date range + search ──────────────────────────────────
  const filtered = records.filter((r) => {
    const recordDate = r.date?.split("T")[0] ?? r.date;

    // Date range check (skip if bounds are empty = "All")
    if (dateFrom && recordDate < dateFrom) return false;
    if (dateTo && recordDate > dateTo) return false;

    // Search filter
    const q = search.toLowerCase();
    if (!q) return true;
    const shop = shops.find((s) => String(s.id) === String(r.shopId));
    return (
      r.item?.toLowerCase().includes(q) ||
      shop?.shop_name?.toLowerCase().includes(q) ||
      shop?.owner_name?.toLowerCase().includes(q)
    );
  });

  // ── Stats computed from ALL records (not date-filtered) ────────────────────
  const totalValue = records.reduce(
    (sum, r) => sum + (parseFloat(r.price) || 0),
    0,
  );
  const totalGrams = records.reduce(
    (sum, r) => sum + (parseFloat(r.grams) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-100 font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Date filter bar */}
        <DateFilterBar
          dateFrom={dateFrom}
          dateTo={dateTo}
          activePreset={activePreset}
          onDateChange={handleDateChange}
          onPresetClick={handlePresetClick}
        />
        {fetching ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Kul Records", icon: "📦", value: filtered.length },
              {
                label: "Kul Wazan",
                icon: "⚖️",
                value: `${filtered.reduce((s, r) => s + (parseFloat(r.grams) || 0), 0).toFixed(2)}g`,
              },
              {
                label: "Kul Qeemat",
                icon: "💰",
                value: `₨${filtered.reduce((s, r) => s + (parseFloat(r.price) || 0), 0).toLocaleString("en-PK")}`,
              },
              {
                label: "Kul Munafa",
                icon: "📈",
                value: `₨${filtered.reduce((s, r) => s + (parseFloat(r.profit) || parseFloat(r.price) * 0.05 || 0), 0).toLocaleString("en-PK")}`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <span className="text-2xl block mb-3">{stat.icon}</span>
                <p className="text-xl font-bold text-slate-800 leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: "records", label: "Records" },
            { id: "form", label: editingId ? "Edit Record" : "Add Record" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "records" && (
          <RecordsTable
            records={filtered}
            fetching={fetching}
            shops={shops}
            search={search}
            setSearch={setSearch}
            handleEdit={handleEdit}
            setDeleteConfirm={setDeleteConfirm}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "form" && (
          <RecordForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            loading={loading}
            shops={shops}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            handleChange={handleChange}
          />
        )}
      </main>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 text-center mb-2">
              Record Delete Karein?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Ye record hamesha ke liye delete ho jayega. Wapis nahi aayega.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
              >
                Nahi, Rehne Do
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
              >
                Haan, Delete Karo
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && statusToast(toast)}
    </div>
  );
}
