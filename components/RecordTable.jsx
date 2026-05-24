"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableSkeleton } from "./Skeleton";
const sampleRecords = [
  {
    id: 1,
    item: "gold ring",
    rati: 4,
    grams: 3.8,
    price: 42000,
    user: {
      name: "Ahmed Khan",
      shopName: "Zain Jewellers",
      number: "0300-1234567",
    },
  },
  {
    id: 2,
    item: "silver bracelet",
    rati: 6,
    grams: 5.5,
    price: 18500,
    user: {
      name: "Sara Ali",
      shopName: "Al-Noor Gems",
      number: "0321-9876543",
    },
  },
  {
    id: 3,
    item: "gold chain",
    rati: 10,
    grams: 9.2,
    price: 98000,
    user: {
      name: "Bilal Raza",
      shopName: "Royal Gold",
      number: "0333-5551234",
    },
  },
  {
    id: 4,
    item: "diamond pendant",
    rati: 3,
    grams: 2.1,
    price: 175000,
    user: {
      name: "Hina Malik",
      shopName: "Sparkling World",
      number: "0345-7890123",
    },
  },
  {
    id: 5,
    item: "earrings",
    rati: 5,
    grams: 4.3,
    price: 55000,
    user: {
      name: "Umar Sheikh",
      shopName: "Zain Jewellers",
      number: "0311-4561234",
    },
  },
];

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
  <svg
    className="w-4 h-4"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
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

function Avatar({ letter }) {
  return (
    <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-amber-900 font-semibold text-xs">
      {letter}
    </div>
  );
}

function RatiBadge({ rati }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
      {rati} rati
    </span>
  );
}

function ActionButton({ onClick, title, variant, children }) {
  const base =
    "w-7 h-7 rounded-md border flex items-center justify-center transition-all duration-150";
  const styles = {
    edit: "border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    delete:
      "border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function TableRow({ record, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const id = record.id || record._id;
  const router = useRouter();
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border-b border-slate-50 last:border-0 transition-colors duration-100 hover:bg-slate-50/60"
    >
      {/* Item */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar letter={record.item?.charAt(0)?.toUpperCase() || "?"} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 capitalize truncate leading-tight">
              {record.item}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {record.user?.name}
            </p>
          </div>
        </div>
      </td>

      {/* Rati */}
      <td className="px-4 py-3.5">
        <RatiBadge rati={record.rati} />
      </td>

      {/* Weight */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-600">{record.grams}g</span>
      </td>

      {/* Price */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-semibold text-slate-800">
          ₨{parseFloat(record.price || 0).toLocaleString()}
        </span>
      </td>

      {/* Shop */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-500 truncate block max-w-[140px]">
          {record.user?.shopName}
        </span>
      </td>

      {/* Contact */}
      <td
        onClick={() =>
          router.push(
            `https://api.whatsapp.com/send?phone=${record.user?.number}&text={Hello,%20more%20information!}`,
          )
        }
        className="cursor-pointer px-4 py-6 flex items-center justify-center  gap-2"
      >
        <span className="text-sm text-slate-500">
          {record.user?.number || "—"}
        </span>
        <div className="border-slate-200 text-slate-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 text-lg">
          <WhatsAppIcon />
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div
          className="flex items-center justify-end gap-1.5 transition-opacity duration-150"
          //   style={{ opacity: hovered ? 1 : 0 }}
        >
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

export default function RecordsTable({
  records = sampleRecords, // pass your real `filtered` array here
  fetching = false,
  search,
  setSearch,
  handleEdit,
  setDeleteConfirm,
  setActiveTab,
}) {
  // If parent hasn't wired search state, manage it internally
  const [localSearch, setLocalSearch] = useState("");
  const q = search !== undefined ? search : localSearch;
  const setQ = setSearch || setLocalSearch;

  const filtered =
    search !== undefined
      ? records // parent already filters; pass filtered directly
      : records.filter((r) => {
          const term = q.toLowerCase();
          return (
            r.item?.toLowerCase().includes(term) ||
            r.user?.name?.toLowerCase().includes(term) ||
            r.user?.shopName?.toLowerCase().includes(term)
          );
        });

  const columns = ["Item", "Rati", "Weight", "Price", "Shop", "Contact", ""];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search by item, name, or shop…"
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
              style={{ tableLayout: "fixed", minWidth: 640 }}
            >
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "10%" }} />
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
                {filtered.map((record) => (
                  <TableRow
                    key={record.id || record._id}
                    record={record}
                    onEdit={handleEdit || (() => {})}
                    onDelete={setDeleteConfirm || (() => {})}
                  />
                ))}
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
