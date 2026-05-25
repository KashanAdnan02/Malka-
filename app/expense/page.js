"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { create, deleteData, getAll, update } from "@/lib/crud";
import Navbar from "@/components/Navbar";
import statusToast from "@/components/StatusToast";

// ─────────────────────────────────────────────
// Color Constants
// ─────────────────────────────────────────────
const AMBER = "#f59e0b";
const AMBER_LIGHT = "#fde68a";
const SLATE = "#64748b";
const EMERALD = "#10b981";
const ROSE = "#f43f5e";
const BLUE = "#3b82f6";
const VIOLET = "#8b5cf6";

const COLORS = [AMBER, EMERALD, BLUE, ROSE, VIOLET, SLATE, "#ec4899", "#14b8a6"];

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const TABLE = "expense";
const EMPTY_FORM = { item: "", price: "", person: "" };

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Increased Size */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon = () => (
  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function fmtPrice(n) {
  const v = parseFloat(n) || 0;
  if (v >= 1_000_000) return `₨${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₨${(v / 1_000).toFixed(1)}K`;
  return `₨${v.toLocaleString("en-PK")}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function avatarColor(letter = "?") {
  const index = letter.charCodeAt(0) % COLORS.length;
  return `bg-[${COLORS[index]}20] text-[${COLORS[index]}]`;
}

// ─────────────────────────────────────────────
// Field Component
// ─────────────────────────────────────────────
function Field({ label, name, value, onChange, type = "text", placeholder, optional, icon, autoFocus }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        {optional && <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Optional</span>}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-2xl border bg-white text-sm py-3.5 outline-none transition-all
            ${icon ? "pl-11 pr-4" : "px-4"}
            ${focused ? "border-rose-500 shadow-lg shadow-rose-100" : "border-slate-200 hover:border-slate-300"}`}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Centered Modal (Create & Edit)
// ─────────────────────────────────────────────
function ExpenseModal({ open, onClose, form, onChange, onSubmit, loading, editingId }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${editingId ? "bg-blue-500" : "bg-rose-500"}`}>
              {editingId ? <EditIcon /> : <PlusIcon />}
            </div>
            <div>
              <p className="font-bold text-lg text-slate-800">
                {editingId ? "Edit Expense" : "New Expense"}
              </p>
              <p className="text-xs text-slate-500">
                {editingId ? "Update expense details" : "Add a new expense entry"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <Field
            label="Item"
            name="item"
            value={form.item}
            onChange={onChange}
            placeholder="e.g. Petrol, Grocery, Internet Bill"
            icon={<span className="text-lg">📦</span>}
            autoFocus
          />
          <Field
            label="Price (₨)"
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            placeholder="e.g. 1250"
            icon={<span className="text-lg">₨</span>}
          />
          <Field
            label="Person / Paid To"
            name="person"
            value={form.person}
            onChange={onChange}
            placeholder="e.g. Ahmed Khan"
            icon={<span className="text-lg">👤</span>}
            optional
          />

          {form.price && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
              <p className="text-rose-600 text-sm font-medium">Preview Amount</p>
              <p className="text-3xl font-black text-rose-700 mt-1">{fmtPrice(form.price)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`flex-1 py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.985]
              ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-70`}
          >
            {loading ? (
              <><SpinnerIcon /> {editingId ? "Updating..." : "Saving..."}</>
            ) : (
              <>{editingId ? <CheckIcon /> : <PlusIcon />} {editingId ? "Update" : "Save"}</>
            )}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6">
          <TrashIcon />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Expense?</h3>
        <p className="text-slate-600 mb-8">
          Are you sure you want to permanently delete <br />
          <span className="font-semibold">"{expense.item}"</span>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Expense Card
// ─────────────────────────────────────────────
function ExpenseCard({ expense, onEdit, onDelete }) {
  const letter = expense.item?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${avatarColor(letter)}`}>
        {letter}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-[15px] capitalize truncate">{expense.item}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          {expense.person && <span>👤 {expense.person}</span>}
          {expense.created_at && <span>{fmtDate(expense.created_at)}</span>}
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-lg text-slate-800">{fmtPrice(expense.price)}</p>
      </div>

      <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(expense)}
          className="p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
          aria-label="Edit"
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(expense)}
          className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          aria-label="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat Pill
// ─────────────────────────────────────────────
function StatPill({ label, value, accent = ROSE }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
      <p className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded-xl w-3/4" />
        <div className="h-3 bg-slate-100 rounded-xl w-1/2" />
      </div>
      <div className="w-20 h-6 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (expense) => {
    setForm({
      item: expense.item || "",
      price: expense.price || "",
      person: expense.person || "",
    });
    setEditingId(expense.id ?? expense._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setEditingId(null);
    }, 300);
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
      showToast(editingId ? "Expense updated successfully" : "Expense added successfully");
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
      showToast("Expense deleted successfully");
      setExpenses((prev) => prev.filter((e) => (e.id ?? e._id) !== id));
    } else {
      showToast("Failed to delete expense", "error");
    }
    setDeleteTarget(null);
  };

  const filteredExpenses = useMemo(() => {
    if (!search) return expenses;
    const q = search.toLowerCase();
    return expenses.filter((e) =>
      e.item?.toLowerCase().includes(q) || e.person?.toLowerCase().includes(q)
    );
  }, [expenses, search]);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0);
    const today = new Date().toISOString().split("T")[0];
    const todayExpenses = expenses.filter((e) => e.created_at?.split("T")[0] === today);

    return {
      total,
      count: expenses.length,
      todayTotal: todayExpenses.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0),
      todayCount: todayExpenses.length,
    };
  }, [expenses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50/30 pb-12">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-rose-600 font-bold text-sm tracking-widest uppercase">Expense Manager</p>
            <h1 className="text-4xl font-black text-slate-900 mt-1">Kharcha Book</h1>
            <p className="text-slate-500 mt-1">Professional expense tracking</p>
          </div>

          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-rose-200 transition-all active:scale-95"
          >
            <PlusIcon />
            Add Expense
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatPill label="Total Spent" value={fmtPrice(stats.total)} accent={ROSE} />
          <StatPill label="Total Entries" value={stats.count} accent={SLATE} />
          <StatPill label="Today" value={fmtPrice(stats.todayTotal)} accent={AMBER} />
          <StatPill label="Today Entries" value={stats.todayCount} accent={EMERALD} />
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by item or person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-rose-400 focus:ring-rose-200 outline-none text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XIcon />
            </button>
          )}
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          {fetching ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-3xl py-20 text-center border border-slate-100">
              <div className="mx-auto w-20 h-20 text-slate-300 mb-6">📭</div>
              <p className="font-semibold text-slate-600">No expenses found</p>
              <p className="text-sm text-slate-500 mt-1">
                {search ? "Try different keywords" : "Add your first expense"}
              </p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id ?? expense._id}
                expense={expense}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))
          )}
        </div>
      </main>

      {/* Centered Modal */}
      <ExpenseModal
        open={modalOpen}
        onClose={closeModal}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
        editingId={editingId}
      />

      {/* Delete Modal */}
      <DeleteModal
        expense={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}