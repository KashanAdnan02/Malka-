"use client";
import { useEffect, useState } from "react";
import {
  createRecord,
  deleteRecord,
  getRecords,
  updateRecord,
} from "@/lib/records";

const emptyForm = {
  item: "",
  grams: "",
  price: "",
  rati: "",
  shopName: "",
  name: "",
  number: "",
};

const statusToast = ({ message, type }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all
      ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
  >
    {type === "success" ? (
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    )}
    {message}
  </div>
);
const InputField = ({
  label,
  name,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
      {label}
    </label>

    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          {icon}
        </span>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all
        hover:border-slate-300 ${icon ? "pl-9" : ""}`}
      />
    </div>
  </div>
);
export default function Home() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("records"); // "records" | "form"

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRecords = async () => {
    setFetching(true);
    const { data, error } = await getRecords();
    if (!error) setRecords(data || []);
    else showToast("Failed to load records", "error");
    setFetching(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const required = [
      "item",
      "grams",
      "price",
      "rati",
      "shopName",
      "name",
      "number",
    ];
    for (const field of required) {
      if (!form[field]) return showToast(`Please fill in all fields`, "error");
    }

    setLoading(true);
    const payload = {
      item: form.item,
      grams: parseFloat(form.grams),
      price: parseFloat(form.price),
      rati: parseFloat(form.rati),
      user: {
        shopName: form.shopName,
        name: form.name,
        number: parseFloat(form.number),
      },
    };

    let result;
    if (editingId) {
      result = await updateRecord(editingId, payload);
    } else {
      result = await createRecord(payload);
    }

    const { data, error } = result;
    if (!error) {
      showToast(
        editingId
          ? "Record updated successfully"
          : "Record created successfully",
      );
      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
      setActiveTab("records");
    } else {
      showToast(error?.message || "Operation failed", "error");
    }
    setLoading(false);
  };

  const handleEdit = (record) => {
    setForm({
      item: record.item || "",
      grams: record.grams || "",
      price: record.price || "",
      rati: record.rati || "",
      shopName: record.user?.shopName || "",
      name: record.user?.name || "",
      number: record.user?.number || "",
    });
    setEditingId(record.id || record._id);
    setActiveTab("form");
  };

  const handleDelete = async (id) => {
    const { error } = await deleteRecord(id);
    if (!error) {
      showToast("Record deleted");
      setRecords((prev) => prev.filter((r) => (r.id || r._id) !== id));
    } else {
      showToast("Failed to delete", "error");
    }
    setDeleteConfirm(null);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setActiveTab("records");
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.item?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.shopName?.toLowerCase().includes(q)
    );
  });

  const totalValue = records.reduce(
    (sum, r) => sum + (parseFloat(r.price) || 0),
    0,
  );
  const totalGrams = records.reduce(
    (sum, r) => sum + (parseFloat(r.grams) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">
                GoldLedger
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Inventory Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">
              {records.length} records
            </span>
            <button
              onClick={() => {
                setActiveTab("form");
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-amber-200"
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
              New Record
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Records",
              value: records.length,
              icon: "📦",
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Total Weight",
              value: `${totalGrams.toFixed(2)}g`,
              icon: "⚖️",
              color: "from-amber-500 to-amber-600",
            },
            {
              label: "Total Value",
              value: `₨${totalValue.toLocaleString()}`,
              icon: "💰",
              color: "from-emerald-500 to-emerald-600",
            },
            {
              label: "Avg. Rati",
              value: records.length
                ? (
                    records.reduce((s, r) => s + (parseFloat(r.rati) || 0), 0) /
                    records.length
                  ).toFixed(1)
                : "—",
              icon: "📊",
              color: "from-purple-500 to-purple-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                />
              </div>
              <p className="text-xl font-bold text-slate-800 leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: "records", label: "All Records" },
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
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
                placeholder="Search by item, name, or shop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

            {/* Records List */}
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-sm text-slate-400">Loading records...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  📭
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    No records found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {search
                      ? "Try a different search term"
                      : "Add your first record to get started"}
                  </p>
                </div>
                {!search && (
                  <button
                    onClick={() => setActiveTab("form")}
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
                  >
                    Add Record
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {filtered.map((record) => {
                  const id = record.id || record._id;
                  return (
                    <div
                      key={id}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          {/* Item badge */}
                          <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-amber-200">
                            {record.item?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-800 text-sm capitalize">
                                {record.item}
                              </h3>
                              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                                {record.rati} rati
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              {record.user?.shopName} · {record.user?.name}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                            title="Edit"
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
                            onClick={() => setDeleteConfirm(id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                            title="Delete"
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

                      {/* Details row */}
                      <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-3 gap-3">
                        {[
                          { label: "Weight", value: `${record.grams}g` },
                          {
                            label: "Price",
                            value: `₨${parseFloat(record.price || 0).toLocaleString()}`,
                          },
                          {
                            label: "Contact",
                            value: record.user?.number || "—",
                          },
                        ].map((detail) => (
                          <div key={detail.label}>
                            <p className="text-xs text-slate-400 mb-0.5">
                              {detail.label}
                            </p>
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              {detail.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "form" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  {editingId ? (
                    <svg
                      className="w-4 h-4 text-amber-600"
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
                  ) : (
                    <svg
                      className="w-4 h-4 text-amber-600"
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
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    {editingId ? "Edit Record" : "New Record"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingId
                      ? "Update the record details below"
                      : "Fill in the details to add a new entry"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Item Details */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-5 h-px bg-slate-200 inline-block" />
                  Item Details
                  <span className="flex-1 h-px bg-slate-100 inline-block" />
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Item Name"
                    name="item"
                    value={form.item}
                    onChange={handleChange}
                    placeholder="e.g. Bunda, Kangan..."
                  />
                  <InputField
                    label="Weight (grams)"
                    name="grams"
                    placeholder="e.g. 3.45"
                    value={form.grams}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Price (₨)"
                    name="price"
                    placeholder="e.g. 50000"
                    value={form.price}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Rati"
                    name="rati"
                    value={form.rati}
                    onChange={handleChange}
                    placeholder="e.g. 18"
                  />
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-5 h-px bg-slate-200 inline-block" />
                  Customer / Shop Details
                  <span className="flex-1 h-px bg-slate-100 inline-block" />
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Shop Name"
                    value={form.shopName}
                    onChange={handleChange}
                    name="shopName"
                    placeholder="e.g. Al Arsalan"
                  />
                  <InputField
                    label="Customer Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Arsalan"
                  />
                  <div className="sm:col-span-2">
                    <InputField
                      label="Phone Number"
                      name="number"
                      value={form.number}
                      onChange={handleChange}
                      placeholder="e.g. 03001234567"
                      type="number"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 sm:flex-none sm:px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-amber-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {editingId ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {editingId ? (
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
                            strokeWidth={2.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                      {editingId ? "Update Record" : "Save Record"}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none sm:px-8 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-sm font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
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
              Delete Record
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This action cannot be undone. The record will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && statusToast(toast)}
    </div>
  );
}
