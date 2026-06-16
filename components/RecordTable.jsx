"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableSkeleton } from "./Skeleton";

// ── Icons ──────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const XIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.771.466 3.477 1.338 4.973L2.046 22l5.184-1.278A9.983 9.983 0 0012.004 22C17.523 22 22 17.523 22 12.004 22 6.477 17.523 2 12.004 2zm0 18.214a8.21 8.21 0 01-4.164-1.132l-.299-.177-3.078.759.786-2.999-.196-.308A8.187 8.187 0 013.786 12c0-4.53 3.688-8.214 8.218-8.214 4.526 0 8.21 3.684 8.21 8.214 0 4.527-3.684 8.214-8.21 8.214z" />
  </svg>
);

const InboxIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

const ShopIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 22V12h6v10"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-3 h-3"
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
);

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Look up a shop from the shops array by shopId.
 * Handles both numeric and string IDs gracefully.
 */
function resolveShop(shops = [], shopId) {
  if (!shopId && shopId !== 0) return null;
  return shops.find((s) => String(s.id) === String(shopId)) ?? null;
}

function formatDate(iso) {
  if (!iso) return "—";
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function Avatar({ letter, color = "amber" }) {
  const palettes = {
    amber: "bg-amber-400 text-amber-900",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div
      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${palettes[color] ?? palettes.amber}`}
    >
      {letter}
    </div>
  );
}

function RatiBadge({ rati }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
      {rati} rati
    </span>
  );
}

function ActionButton({ onClick, title, variant, children }) {
  const styles = {
    edit: "border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    delete:
      "border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all duration-150 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ── Shop Cell — the key new component ─────────────────────────────────────────

function ShopCell({ shop }) {
  if (!shop) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
        <span className="text-xs text-slate-300 italic">No shop</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 min-w-0">
      {/* Colored initial badge */}
      <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-[10px] font-bold">
        {shop.shop_name?.charAt(0)?.toUpperCase() ?? "S"}
      </div>

      <div className="min-w-0">
        {/* Shop name */}
        <p className="text-sm font-semibold text-slate-700 truncate leading-tight">
          {shop.shop_name}
        </p>

        {/* Owner name */}
        {shop.owner_name && (
          <p className="text-xs text-slate-400 truncate mt-0.5 leading-tight">
            {shop.owner_name}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Contact Cell ───────────────────────────────────────────────────────────────

function ContactCell({ shop }) {
  const router = useRouter();
  const phone = shop?.phone;

  if (!phone) {
    return <span className="text-xs text-slate-300 italic">—</span>;
  }

  const waLink = `https://api.whatsapp.com/send?phone=${phone.replace(/\D/g, "")}&text=Hello%2C%20more%20information!`;

  return (
    <button
      onClick={() => router.push(waLink)}
      title={`WhatsApp ${phone}`}
      className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-all duration-150 w-full"
    >
      <span className="text-slate-300 group-hover:text-green-500 transition-colors duration-150">
        <WhatsAppIcon />
      </span>
      <span className="text-xs text-slate-500 group-hover:text-green-700 font-medium truncate transition-colors duration-150">
        {phone}
      </span>
    </button>
  );
}

// ── Table Row ──────────────────────────────────────────────────────────────────

function TableRow({ record, shop, onEdit, onDelete }) {
  const id = record.id ?? record._id;

  return (
    <tr className="border-b border-slate-50 last:border-0 transition-colors duration-100 hover:bg-slate-50/70 group">
      {/* Item */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 capitalize truncate leading-tight">
              {record.item}
            </p>
            {/* Date sub-line */}
            <div className="flex items-center gap-1 mt-0.5 text-slate-400">
              <CalendarIcon />
              <span className="text-xs">{formatDate(record.date)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Rati */}
      <td className="px-4 py-3.5">
        <RatiBadge rati={record.rati} />
      </td>

      {/* Weight */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-600 font-medium">
          {record.grams}g
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-bold text-slate-800">
          ₨{parseFloat(record.price ?? 0).toLocaleString("en-PK")}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
          ₨
          {parseFloat(
            record.profit ?? parseFloat(record.price) * 0.05,
          ).toLocaleString("en-PK", { maximumFractionDigits: 0 })}
        </span>
      </td>
      {/* Shop — resolved from shopId */}
      <td className="px-4 py-3.5">
        <ShopCell shop={shop} />
      </td>

      {/* Contact — phone from resolved shop */}
      <td className="px-4 py-3.5">
        <ContactCell shop={shop} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton
            onClick={() => onEdit(record)}
            title="Edit"
            variant="edit"
          >
            <EditIcon />
          </ActionButton>
          <ActionButton
            onClick={() => onDelete(id)}
            title="Delete"
            variant="delete"
          >
            <TrashIcon />
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ search, onAddClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        <InboxIcon />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600">No records found</p>
        <p className="text-xs text-slate-400 mt-1">
          {search
            ? "Try a different search term"
            : "Add your first record to get started"}
        </p>
      </div>
      {!search && (
        <button
          onClick={onAddClick}
          className="text-sm font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
        >
          Add Record
        </button>
      )}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export default function RecordsTable({
  records = [],
  shops = [], // ← array of shop objects with id, shop_name, owner_name, phone
  fetching = false,
  search,
  setSearch,
  handleEdit,
  setDeleteConfirm,
  setActiveTab,
}) {
  const [localSearch, setLocalSearch] = useState("");
  const q = search !== undefined ? search : localSearch;
  const setQ = setSearch || setLocalSearch;

  // Filter records by item name, shop name, or owner name
  const filtered =
    search !== undefined
      ? records
      : records.filter((r) => {
          const shop = resolveShop(shops, r.shopId);
          const term = q.toLowerCase();
          return (
            r.item?.toLowerCase().includes(term) ||
            shop?.shop_name?.toLowerCase().includes(term) ||
            shop?.owner_name?.toLowerCase().includes(term)
          );
        });

  const columns = [
    "Item",
    "Rati",
    "Weight",
    "Price",
    "Profit",
    "Shop",
    "Contact",
    "",
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search by item, shop, or owner…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
        {fetching ? (
          <TableSkeleton rows={3} />
        ) : filtered.length === 0 ? (
          <EmptyState search={q} onAddClick={() => setActiveTab?.("form")} />
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-left"
              style={{ tableLayout: "fixed", minWidth: 700 }}
            >
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                      style={{ textAlign: col === "" ? "right" : "left" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((record) => {
                  // Resolve shop once per row — keeps TableRow clean
                  const shop = resolveShop(shops, record.shopId);
                  return (
                    <TableRow
                      key={record.id ?? record._id}
                      record={record}
                      shop={shop}
                      onEdit={handleEdit ?? (() => {})}
                      onDelete={setDeleteConfirm ?? (() => {})}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row count */}
      {!fetching && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right pr-1">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
