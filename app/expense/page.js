"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { create, deleteData, getAll, update } from "@/lib/crud";
import Navbar from "@/components/Navbar";
import statusToast from "@/components/StatusToast";

// ─────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────
const COLORS = [
  "#f59e0b", "#10b981", "#3b82f6", "#f43f5e",
  "#8b5cf6", "#64748b", "#ec4899", "#14b8a6",
];

const TABLE = "expense";
const EMPTY_FORM = { item: "", price: "", person: "" };

// ─────────────────────────────────────────────
// Date helpers (same pattern as records page)
// ─────────────────────────────────────────────
const fmtISO = (d) => d.toISOString().split("T")[0];

const DATE_PRESETS = [
  { key: "today",     label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week",      label: "This week" },
  { key: "month",     label: "This month" },
  { key: "all",       label: "All time" },
];

function getPresetRange(key) {
  const t = new Date();
  switch (key) {
    case "today":
      return { from: fmtISO(t), to: fmtISO(t) };
    case "yesterday": {
      const y = new Date(t); y.setDate(t.getDate() - 1);
      return { from: fmtISO(y), to: fmtISO(y) };
    }
    case "week": {
      const s = new Date(t); s.setDate(t.getDate() - t.getDay());
      return { from: fmtISO(s), to: fmtISO(t) };
    }
    case "month":
      return { from: fmtISO(new Date(t.getFullYear(), t.getMonth(), 1)), to: fmtISO(t) };
    default:
      return { from: "", to: "" };
  }
}

function inRange(dateStr, from, to) {
  const d = dateStr?.split("T")[0];
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

// ─────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────
function fmtPrice(n) {
  const v = parseFloat(n) || 0;
  if (v >= 1_000_000) return `₨${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `₨${(v / 1_000).toFixed(1)}K`;
  return `₨${v.toLocaleString("en-PK")}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-PK", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────
const PlusIcon = ({ size = "w-4 h-4" }) => (
  <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ─────────────────────────────────────────────
// Date Filter Bar (matches records page)
// ─────────────────────────────────────────────
function DateFilterBar({ dateFrom, dateTo, activePreset, onDateChange, onPresetClick }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
          <CalendarIcon />
        </div>
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Date range</span>
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

// ─────────────────────────────────────────────
// Form Field
// ─────────────────────────────────────────────
function Field({ label, name, value, onChange, type = "text", placeholder, optional, icon, autoFocus }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        {optional && (
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Optional
          </span>
        )}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 text-sm py-3 outline-none
            transition-all hover:border-slate-300 focus:border-amber-400 focus:bg-white
            focus:ring-2 focus:ring-amber-100
            ${icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Expense Modal
// ─────────────────────────────────────────────
function ExpenseModal({ open, onClose, form, onChange, onSubmit, loading, editingId }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-200">
              {editingId ? <EditIcon /> : <PlusIcon />}
            </div>
            <div>
              <p className="font-bold text-slate-800">{editingId ? "Edit Expense" : "New Expense"}</p>
              <p className="text-xs text-slate-400">{editingId ? "Update the details below" : "Add a new expense entry"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <Field label="Item" name="item" value={form.item} onChange={onChange}
            placeholder="e.g. Petrol, Grocery, Bill" icon="📦" autoFocus />
          <Field label="Price (₨)" name="price" type="number" value={form.price}
            onChange={onChange} placeholder="e.g. 1250" icon="₨" />
          <Field label="Person / Paid To" name="person" value={form.person}
            onChange={onChange} placeholder="e.g. Ahmed Khan" icon="👤" optional />

          {form.price && parseFloat(form.price) > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">Amount</p>
              <p className="text-2xl font-black text-amber-700">{fmtPrice(form.price)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm
              flex items-center justify-center gap-2 shadow-sm shadow-amber-200 transition-all
              active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {editingId ? "Updating…" : "Saving…"}</>
              : <>{editingId ? <CheckIcon /> : <PlusIcon />} {editingId ? "Update" : "Save"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────
function DeleteModal({ expense, onConfirm, onCancel }) {
  if (!expense) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
          <TrashIcon />
        </div>
        <h3 className="text-base font-bold text-slate-800 text-center mb-1">Delete Expense?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          "{expense.item}" hamesha ke liye delete ho jayega.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 text-sm transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all active:scale-95">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Expense Row (table-style, cleaner than cards)
// ─────────────────────────────────────────────
function ExpenseRow({ expense, onEdit, onDelete, index }) {
  const letter = expense.item?.charAt(0)?.toUpperCase() || "?";
  const colorIndex = letter.charCodeAt(0) % COLORS.length;
  const color = COLORS[colorIndex];

  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group">
      {/* # */}
      <td className="px-4 py-3.5 w-10">
        <span className="text-xs font-semibold text-slate-300">{index + 1}</span>
      </td>

      {/* Item */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: `${color}18`, color }}
          >
            {letter}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 capitalize">{expense.item}</p>
            {expense.person && (
              <p className="text-xs text-slate-400 mt-0.5">👤 {expense.person}</p>
            )}
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className="text-xs text-slate-400">{fmtDate(expense.created_at)}</span>
      </td>

      {/* Price */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm font-bold text-slate-800">{fmtPrice(expense.price)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(expense)}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center
              text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(expense)}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center
              text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
function SkeletonRows() {
  return [...Array(5)].map((_, i) => (
    <tr key={i} className="border-b border-slate-50 animate-pulse">
      <td className="px-4 py-3.5 w-10"><div className="h-3 w-4 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-slate-100 rounded" />
            <div className="h-2.5 w-16 bg-slate-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell"><div className="h-3 w-20 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3.5 text-right"><div className="h-3 w-16 bg-slate-100 rounded ml-auto" /></td>
      <td className="px-4 py-3.5" />
    </tr>
  ));
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({ label, value, icon, sub }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <span className="text-2xl block mb-3">{icon}</span>
      <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // Date filter — default to "today"
  const [dateFrom, setDateFrom] = useState(fmtISO(new Date()));
  const [dateTo, setDateTo]     = useState(fmtISO(new Date()));
  const [activePreset, setActivePreset] = useState("today");

  const showToast = useCallback((message, type = "success") => {
    statusToast({ message, type });
  }, []);

  const fetchExpenses = async () => {
    setFetching(true);
    const { data, error } = await getAll(TABLE);
    if (error) showToast("Failed to load expenses", "error");
    else setExpenses(data || []);
    setFetching(false);
  };

  useEffect(() => { fetchExpenses(); }, []);

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

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const openNew = () => { setForm(EMPTY_FORM); setEditingId(null); setModalOpen(true); };

  const openEdit = (expense) => {
    setForm({ item: expense.item || "", price: expense.price || "", person: expense.person || "" });
    setEditingId(expense.id ?? expense._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => { setForm(EMPTY_FORM); setEditingId(null); }, 300);
  };

  const handleSubmit = async () => {
    if (!form.item.trim()) return showToast("Item name is required", "error");
    if (!form.price || parseFloat(form.price) <= 0) return showToast("Valid price is required", "error");

    setLoading(true);
    const payload = {
      item: form.item.trim(),
      price: parseFloat(form.price),
      ...(form.person?.trim() && { person: form.person.trim() }),
    };

    const result = editingId
      ? await update(payload, editingId, TABLE)
      : await create(payload, TABLE);

    if (!result.error) {
      showToast(editingId ? "Expense updated!" : "Expense added!");
      closeModal();
      fetchExpenses();
    } else {
      showToast(result.error?.message || "Operation failed", "error");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id ?? deleteTarget._id;
    const { error } = await deleteData(id, TABLE);
    if (!error) {
      showToast("Expense deleted");
      setExpenses((prev) => prev.filter((e) => (e.id ?? e._id) !== id));
    } else {
      showToast("Failed to delete expense", "error");
    }
    setDeleteTarget(null);
  };

  // Date-filtered expenses
  const dateFiltered = useMemo(() =>
    expenses.filter((e) => inRange(e.created_at, dateFrom, dateTo)),
    [expenses, dateFrom, dateTo]
  );

  // Search on top of date filter
  const filteredExpenses = useMemo(() => {
    if (!search) return dateFiltered;
    const q = search.toLowerCase();
    return dateFiltered.filter((e) =>
      e.item?.toLowerCase().includes(q) || e.person?.toLowerCase().includes(q)
    );
  }, [dateFiltered, search]);

  // Stats computed from date-filtered (no search)
  const stats = useMemo(() => {
    const total    = dateFiltered.reduce((s, e) => s + (parseFloat(e.price) || 0), 0);
    const highest  = dateFiltered.reduce((max, e) => Math.max(max, parseFloat(e.price) || 0), 0);
    const avgEntry = dateFiltered.length ? total / dateFiltered.length : 0;
    return { total, count: dateFiltered.length, highest, avgEntry };
  }, [dateFiltered]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-100 pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Expense Manager</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kharcha Book</h1>
            <p className="text-sm text-slate-400 mt-1">Track and manage all your expenses</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white
              px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-amber-200
              transition-all active:scale-95"
          >
            <PlusIcon />
            Add Expense
          </button>
        </div>

        {/* Date filter */}
        <DateFilterBar
          dateFrom={dateFrom}
          dateTo={dateTo}
          activePreset={activePreset}
          onDateChange={handleDateChange}
          onPresetClick={handlePresetClick}
        />

        {/* Stats — react to date filter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon="💸" label="Total Spent"   value={fmtPrice(stats.total)}    sub={`${stats.count} entries`} />
          <StatCard icon="📋" label="Total Entries" value={stats.count}              sub="in selected range" />
          <StatCard icon="📈" label="Highest Entry" value={fmtPrice(stats.highest)}  sub="single expense" />
          <StatCard icon="📊" label="Avg. Entry"    value={fmtPrice(stats.avgEntry)} sub="per expense" />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Search bar inside table card */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by item or person…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5
                  text-sm text-slate-700 placeholder-slate-300 focus:outline-none
                  focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XIcon />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Price</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <SkeletonRows />
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">📭</div>
                        <p className="text-sm font-semibold text-slate-600">No expenses found</p>
                        <p className="text-xs text-slate-400">
                          {search ? "Try different keywords" : "No entries in this date range"}
                        </p>
                        {!search && (
                          <button onClick={openNew}
                            className="text-sm font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2 mt-1">
                            Add Expense
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense, i) => (
                    <ExpenseRow
                      key={expense.id ?? expense._id}
                      expense={expense}
                      index={i}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!fetching && filteredExpenses.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {filteredExpenses.length} entr{filteredExpenses.length !== 1 ? "ies" : "y"}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Total: {fmtPrice(stats.total)}
              </span>
            </div>
          )}
        </div>
      </main>

      <ExpenseModal
        open={modalOpen}
        onClose={closeModal}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
        editingId={editingId}
      />

      <DeleteModal
        expense={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}