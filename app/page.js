"use client";
import { useEffect, useState } from "react";
import { create, deleteData, getAll, update } from "@/lib/crud";
import Navbar from "@/components/Navbar";
import statusToast from "@/components/StatusToast";
import RecordsTable from "@/components/RecordTable";
import { StatsSkeleton } from "@/components/Skeleton";
import RecordForm from "@/components/RecordForm";
import DateTimeHeader from "@/utils/DateTimeHeader";

const emptyForm = {
  item: "",
  grams: "",
  price: "",
  rati: "",
  shopId: "",
  date: new Date().toISOString().split("T")[0],
};

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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const required = ["item", "grams", "price", "rati", "shopId", "date"];
    for (const field of required) {
      if (!form[field]) return showToast(`Please fill in all fields`, "error");
    }
    setLoading(true);
    const payload = {
      item: form.item,
      grams: parseFloat(form.grams),
      price: parseFloat(form.price),
      rati: parseFloat(form.rati),
      shopId: form.shopId,
      date: form.date,
    };

    const result = editingId
      ? await update(editingId, payload, "records")
      : await create(payload, "records");

    const { error } = result;
    if (!error) {
      showToast(editingId ? "Record update ho gaya!" : "Record save ho gaya!");
      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
      setActiveTab("records");
    } else {
      showToast(error?.message || "Kuch masla aa gaya", "error");
    }
    setLoading(false);
  };

  const handleEdit = (record) => {
    setForm({
      item: record.item || "",
      grams: record.grams || "",
      price: record.price || "",
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
  const today = new Date().toISOString().split("T")[0];

  const filtered = records.filter((r) => {
    const recordDate = r.date?.split("T")[0] ?? r.date;
    if (recordDate !== today) return false;

    const q = search.toLowerCase();
    if (!q) return true;

    const shop = shops.find((s) => String(s.id) === String(r.shopId));
    return (
      r.item?.toLowerCase().includes(q) ||
      shop?.shop_name?.toLowerCase().includes(q) ||
      shop?.owner_name?.toLowerCase().includes(q)
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
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <DateTimeHeader recordCount={filtered.length} />
        {fetching ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Kul Records",
                value: records.length,
                icon: "📦",
                color: "from-blue-500 to-blue-600",
              },
              {
                label: "Kul Wazan",
                value: `${totalGrams.toFixed(2)}g`,
                icon: "⚖️",
                color: "from-amber-500 to-amber-600",
              },
              {
                label: "Kul Qeemat",
                value: `₨${totalValue.toLocaleString("en-PK")}`,
                icon: "💰",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                label: "Ausat Rati",
                value: records.length
                  ? (
                      records.reduce(
                        (s, r) => s + (parseFloat(r.rati) || 0),
                        0,
                      ) / records.length
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
        )}

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: "records", label: "Aaj Ke Records" },
            {
              id: "form",
              label: editingId ? "Record Edit Karein" : "Record Add Karein",
            },
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
