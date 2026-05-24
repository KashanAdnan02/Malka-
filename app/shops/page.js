"use client";
import Navbar from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";
import { create, deleteData, getAll, update } from "@/lib/crud";
const EMPTY = { shop_name: "", owner_name: "", phone: "", city: "" };

function GemIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2L2 8l10 14L22 8l-4-6H6zm1.5 2h9l2.5 3.5H5L7.5 4zM4.5 9.5h15L12 20 4.5 9.5z" />
    </svg>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
      style={{ background: `hsl(${hue},55%,48%)` }}
    >
      {initials}
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="relative bg-white rounded-3xl p-5 border border-stone-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${accent}`}
      />
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      <p className="text-xs text-stone-400 font-medium mt-1 tracking-wide uppercase">
        {label}
      </p>
      <span className="absolute bottom-4 right-4 text-xl opacity-30">
        {icon}
      </span>
    </div>
  );
}

function Modal({ open, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden animate-modal"
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={type == "city" ? "Karachi" : value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300
          focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-300 transition-all hover:border-stone-300"
      />
    </div>
  );
}

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("grid"); // "grid" | "list"

  const load = async () => {
    setLoading(true);
    const { data, error } = await getAll("shops");
    setShops(data);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY);
    setEditId(null);
    setModalOpen(true);
  };
  const openEdit = (shop) => {
    setForm({
      shop_name: shop.shop_name,
      owner_name: shop.owner_name,
      phone: shop.phone,
      city: shop.city || "",
    });
    setEditId(shop.id);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY);
  };

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.shop_name.trim() || !form.owner_name.trim() || !form.phone.trim())
      return notify("Please fill all required fields", "error");
    setSaving(true);
    if (editId) {
      await update(form, editId, "shops");
      notify("Shop updated successfully");
    } else {
      await create(form, "shops");
      notify("Shop added succesfully");
    }
    await load();
    closeModal();
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteData(deleteTarget, "shops");
    setDeleteTarget(null);
    await load();
    notify("Shop deleted");
  };

  const filtered = shops.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.shop_name.toLowerCase().includes(q) ||
      s.owner_name.toLowerCase().includes(q) ||
      (s.city || "").toLowerCase().includes(q)
    );
  });

  const cities = [...new Set(shops.map((s) => s.city).filter(Boolean))];

  return (
    <div
      className="min-h-screen bg-[#faf9f7]"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <style>{`
        @keyframes modal-in { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-modal { animation: modal-in 0.25s cubic-bezier(.22,.68,0,1.2) both; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fade-up 0.4s ease both; }
        @keyframes toast-in { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
        .toast-in { animation: toast-in 0.3s ease both; }
      `}</style>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* ── Hero Section ── */}
        <section className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 px-8 py-12 sm:py-16 text-white shadow-2xl">
          {/* decorative rings */}
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full border border-amber-400/10" />
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full border border-amber-400/10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GemIcon className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-amber-400 tracking-[0.25em] uppercase font-medium">
                  Shop Directory
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
                Malka <span className="text-amber-400">Jewellers</span>
              </h1>
              <p
                className="mt-3 text-stone-400 text-sm sm:text-base max-w-md leading-relaxed"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Manage all affiliated shops, their owners and contact details
                from one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { label: "Total Shops", value: shops.length },
                  { label: "Cities", value: cities.length },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3"
                  >
                    <p className="text-xl font-bold text-white leading-none">
                      {s.value}
                    </p>
                    <p
                      className="text-xs text-stone-400 mt-1"
                      style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={openCreate}
              className="shrink-0 flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-900 font-bold px-7 py-4 rounded-2xl shadow-lg shadow-amber-900/40 transition-all duration-200 text-sm"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Shop
            </button>
          </div>
        </section>

        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search shops, owners, cities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300 transition-all shadow-sm"
              style={{ fontFamily: "system-ui, sans-serif" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-white border border-stone-200 rounded-2xl p-1 shadow-sm">
            {[
              {
                id: "grid",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                ),
              },
              {
                id: "list",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                ),
              },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`p-2.5 rounded-xl transition-all duration-200 ${view === v.id ? "bg-amber-500 text-white shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
              >
                {v.icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p
              className="text-sm text-stone-400"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Loading shops…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center">
              <GemIcon className="w-8 h-8 text-stone-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-stone-700">
                {search ? "No shops match your search" : "No shops yet"}
              </p>
              <p
                className="text-sm text-stone-400 mt-1"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {search
                  ? "Try a different keyword"
                  : "Add your first shop to get started"}
              </p>
            </div>
            {!search && (
              <button
                onClick={openCreate}
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Add Shop
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((shop, i) => (
              <div
                key={shop.id}
                className="fade-up bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* card top accent */}
                <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <Avatar name={shop.shop_name} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-stone-800 text-base leading-snug truncate">
                        {shop.shop_name}
                      </h3>
                      {shop.city && (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full mt-1"
                          style={{ fontFamily: "system-ui, sans-serif" }}
                        >
                          <svg
                            className="w-2.5 h-2.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          {shop.city}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="space-y-3"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <span className="w-7 h-7 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                        <svg
                          className="w-3.5 h-3.5 text-stone-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>
                      <span className="truncate font-medium text-stone-700">
                        {shop.owner_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <span className="w-7 h-7 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                        <svg
                          className="w-3.5 h-3.5 text-stone-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </span>
                      <a
                        href={`tel:${shop.phone}`}
                        className="hover:text-amber-600 transition-colors font-medium"
                      >
                        {shop.phone}
                      </a>
                    </div>
                    {shop.createdAt && (
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="w-7 h-7 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                          <svg
                            className="w-3 h-3 text-stone-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </span>
                        Added {shop.createdAt}
                      </div>
                    )}
                  </div>

                  {/* actions */}
                  <div className="mt-5 pt-5 border-t border-stone-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEdit(shop)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 text-stone-500 hover:text-amber-600 text-xs font-semibold transition-all duration-200"
                      style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(shop.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-stone-50 hover:bg-red-50 border border-stone-200 hover:border-red-200 text-stone-500 hover:text-red-500 text-xs font-semibold transition-all duration-200"
                      style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List View ── */
          <div className="space-y-3">
            {filtered.map((shop, i) => (
              <div
                key={shop.id}
                className="fade-up bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <Avatar name={shop.shop_name} />
                  <div
                    className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    <div>
                      <p className="font-bold text-stone-800 text-sm truncate">
                        {shop.shop_name}
                      </p>
                      {shop.city && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          {shop.city}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <svg
                        className="w-3.5 h-3.5 shrink-0 text-stone-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="truncate">{shop.owner_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <svg
                        className="w-3.5 h-3.5 shrink-0 text-stone-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={`tel:${shop.phone}`}
                        className="hover:text-amber-600 transition-colors"
                      >
                        {shop.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 transition-opacity duration-200">
                    <button
                      onClick={() => openEdit(shop)}
                      className="p-2.5 rounded-xl hover:bg-amber-50 text-stone-400 hover:text-amber-600 transition-all border border-transparent hover:border-amber-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(shop.id)}
                      className="p-2.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 transition-all border border-transparent hover:border-red-200"
                    >
                      <svg
                        className="w-4 h-4"
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
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Add/Edit Modal ── */}
      <Modal open={modalOpen} onClose={closeModal}>
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-200">
              <GemIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-800">
                {editId ? "Edit Shop" : "Add New Shop"}
              </h2>
              <p
                className="text-xs text-stone-400 mt-0.5"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {editId
                  ? "Update shop details below"
                  : "Fill in details to register a new shop"}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          className="p-6 space-y-4"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <Field
            label="Shop Name *"
            name="shop_name"
            value={form.shop_name || form.shop_name + "Jewelllers"}
            onChange={onChange}
            placeholder="e.g. Al Arsalan Jewellers"
          />
          <Field
            label="Owner Name *"
            name="owner_name"
            value={form.owner_name}
            onChange={onChange}
            placeholder="e.g. Jawed Bhai"
          />
          <Field
            label="Phone Number *"
            name="phone"
            value={form.phone || "03"}
            onChange={onChange}
            placeholder="e.g. 0300-1234567"
            type="tel"
          />
          <Field
            label="City"
            name="city"
            value={form.city || "Karachi"}
            onChange={onChange}
            placeholder="e.g. Karachi"
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-stone-900 text-sm font-bold rounded-2xl shadow-sm shadow-amber-200 transition-all duration-200"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-stone-700/30 border-t-stone-900 animate-spin" />
                  {editId ? "Updating…" : "Saving…"}
                </>
              ) : (
                <>{editId ? "Update Shop" : "Save Shop"}</>
              )}
            </button>
            <button
              onClick={closeModal}
              className="flex-1 py-3.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-600 text-sm font-semibold rounded-2xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div
          className="p-8 text-center"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">
            Delete Shop?
          </h3>
          <p className="text-sm text-stone-500 mb-7 max-w-xs mx-auto leading-relaxed">
            This will permanently remove the shop and all its details. This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold transition-all active:scale-95"
            >
              Keep it
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all active:scale-95 shadow-sm shadow-red-200"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] toast-in flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border
          ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-red-600 text-white border-red-500"
          }`}
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {toast.type === "success" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
