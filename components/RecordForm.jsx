"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import InputField from "@/components/InputFeild";

// ── Icons ──────────────────────────────────────────────────────────────────────

const ChevronIcon = ({ open }) => (
  <svg
    style={{
      transition: "transform 0.2s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }}
    className="w-4 h-4 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const ShopIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const CheckmarkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const BoxIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split("T")[0];

const formatDisplay = (iso) => {
  if (!iso) return { en: "", ur: "" };
  const [y, m, d] = iso.split("-");
  const date = new Date(y, m - 1, d);
  const daysEn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const daysUr = ["اتوار","پیر","منگل","بدھ","جمعرات","جمعہ","ہفتہ"];
  const monthsEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthsUr = ["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"];
  return {
    en: `${daysEn[date.getDay()]}, ${d} ${monthsEn[m - 1]} ${y}`,
    ur: `${daysUr[date.getDay()]} ${monthsUr[m - 1]} ${y}`,
  };
};

const RATI_OPTIONS = [10, 14, 18, 22, 24];

// ── Animated section ───────────────────────────────────────────────────────────

function AnimatedSection({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
    </div>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {children}
      </p>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ── Portal Dropdown ────────────────────────────────────────────────────────────
// Renders the menu via a React Portal into document.body so it is never
// clipped or buried by any ancestor's overflow / z-index stacking context.

function Dropdown({ label, value, onChange, options, placeholder = "Select…", renderOption, renderTrigger }) {
  const [open, setOpen] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Recalculate position on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const recalc = () => positionMenu();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [open]);

  const positionMenu = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuHeight = 240; // max-h-60 ≈ 240px

    const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 }),
    });
  };

  const openMenu = () => {
    positionMenu();
    setOpen(true);
    requestAnimationFrame(() => setAnimIn(true));
  };

  const closeMenu = () => {
    setAnimIn(false);
    setTimeout(() => setOpen(false), 200);
  };

  const toggle = () => (open ? closeMenu() : openMenu());

  const selected = options.find((o) => (o.value ?? o) === value);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-500">{label}</label>
      )}

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm bg-white text-left
          ${open
            ? "border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
            : "border-slate-200 hover:border-slate-300"
          }
          ${!value ? "text-slate-400" : "text-slate-800"}`}
        style={{ transition: "border-color 0.15s, box-shadow 0.15s" }}
      >
        <span className="flex items-center gap-2 truncate min-w-0">
          {selected && renderTrigger
            ? renderTrigger(selected)
            : selected
              ? selected.label
              : placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Portal menu — mounted on body, never clipped */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              ...menuStyle,
              backgroundColor: "#fff",
              border: "1px solid #f1f5f9",
              borderRadius: "1rem",
              boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
              opacity: animIn ? 1 : 0,
              transform: animIn ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.97)",
              transformOrigin: "top center",
              transition: "opacity 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.2s cubic-bezier(0.16,1,0.3,1)",
              overflow: "hidden",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: "6px 0", maxHeight: 240, overflowY: "auto", backgroundColor: "#fff" }}>
              {options.map((opt) => {
                const val = opt.value ?? opt;
                const isSelected = val === value;
                return (
                  <li key={val}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(val);
                        closeMenu();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left
                        ${isSelected ? "bg-amber-50" : "hover:bg-slate-50"}`}
                      style={{ transition: "background 0.1s", border: "none", cursor: "pointer", backgroundColor: isSelected ? "#fffbeb" : "transparent" }}
                    >
                      <span className="flex-1 min-w-0">
                        {renderOption ? (
                          renderOption(opt, isSelected)
                        ) : (
                          <span className={`font-medium ${isSelected ? "text-amber-800" : "text-slate-700"}`}>
                            {opt.label}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <span className="ml-3 shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
                          <CheckIcon />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}

// ── Rati Picker ────────────────────────────────────────────────────────────────

function RatiPicker({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500">Rati</label>
      <div className="flex gap-2 flex-wrap">
        {RATI_OPTIONS.map((v) => {
          const active = String(v) === String(value);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(String(v))}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold border overflow-hidden
                ${active
                  ? "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-200"
                  : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/50"
                }`}
              style={{
                transition: "all 0.18s cubic-bezier(0.16,1,0.3,1)",
                transform: active ? "scale(1.06)" : "scale(1)",
              }}
            >
              {v}
              <span
                className={`ml-1.5 text-xs font-normal ${active ? "text-amber-100" : "text-slate-400"}`}
                style={{ transition: "color 0.18s" }}
              >
                rati
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Shop Info Card ─────────────────────────────────────────────────────────────

function ShopInfoCard({ shop }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [shop?._id || shop?.id]);

  if (!shop) return null;

  return (
    <div
      className="grid grid-cols-3 gap-4 px-4 py-3.5 rounded-2xl bg-amber-50/70 border border-amber-100"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      {[
        { icon: <ShopIcon />, label: "Shop", value: shop.shop_name },
        { icon: <UserIcon />, label: "Contact", value: shop.owner_name },
        { icon: <PhoneIcon />, label: "Phone", value: shop.phone },
      ].map((item) => (
        <div key={item.label}>
          <div className="flex items-center gap-1 mb-1 text-amber-500">
            {item.icon}
            <p className="text-xs text-slate-400">{item.label}</p>
          </div>
          <p className="text-sm font-bold text-slate-700 truncate">{item.value || "—"}</p>
        </div>
      ))}
    </div>
  );
}

// ── Date Badge ─────────────────────────────────────────────────────────────────

function DateBadge({ iso }) {
  const { en, ur } = formatDisplay(iso || todayISO());
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 shrink-0">
        <CalendarIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">Record date</p>
        <p className="text-sm font-bold text-slate-800">{en}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Today
        </span>
        <p className="text-xs text-slate-400 mt-1" dir="rtl">{ur}</p>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function RecordForm({
  form,
  setForm,
  editingId,
  loading,
  shops = [],
  handleSubmit,
  handleCancel,
  handleChange,
}) {
  const selectedShop = shops.find((s) => s.id === form.shopId);

  const handleShopSelect = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) return;
    setForm((prev) => ({
      ...prev,
      shopId,
      shopName: shop.shopName || "",
      name: shop.name || "",
      number: shop.number || "",
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-100/60" />
        <div className="absolute bottom-0 right-20 w-12 h-12 rounded-full bg-amber-200/30" />
        <div className="relative flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-200">
            {editingId ? <EditIcon /> : <PlusIcon className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {editingId ? "Edit record" : "New record"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {editingId ? "Update the details below" : "Fill in the details to add a new entry"}
            </p>
          </div>
        </div>
      </div>

      {/* NOTE: removed overflow-hidden here so the portal can escape if needed.
          The card uses overflow-visible on the body area. */}
      <div className="p-6 space-y-8">
        {/* Item Details */}
        <AnimatedSection delay={50}>
          <SectionLabel icon={<BoxIcon />}>Item details</SectionLabel>
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
            <div className="sm:col-span-2">
              <RatiPicker
                value={form.rati}
                onChange={(val) => setForm((p) => ({ ...p, rati: val }))}
              />
            </div>
            <InputField
              label="Price (₨)"
              name="price"
              placeholder="e.g. 50000"
              value={form.price}
              onChange={handleChange}
            />
          </div>
        </AnimatedSection>

        {/* Shop Details */}
        <AnimatedSection delay={150}>
          <SectionLabel icon={<ShopIcon />}>Shop details</SectionLabel>
          <div className="space-y-3">
            <Dropdown
              label="Select shop"
              value={form.shopId}
              onChange={handleShopSelect}
              options={shops.map((s) => ({
                value: s.id,
                label: s.shop_name,
                sub: s.owner_name,
                number: s.phone,
              }))}
              placeholder="Choose a shop…"
              renderOption={(opt, isSelected) => (
                <div className="flex items-center gap-3 py-0.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ShopIcon />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? "text-amber-800" : "text-slate-800"}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {opt.sub} · {opt.number}
                    </p>
                  </div>
                </div>
              )}
              renderTrigger={(opt) => (
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-amber-500 shrink-0">
                    <ShopIcon />
                  </span>
                  <span className="font-semibold truncate">{opt.label}</span>
                  {opt.sub && (
                    <span className="text-slate-400 font-normal text-xs truncate">· {opt.sub}</span>
                  )}
                </span>
              )}
            />
            {selectedShop && <ShopInfoCard shop={selectedShop} />}
          </div>
        </AnimatedSection>

        {/* Date */}
        <AnimatedSection delay={240}>
          <SectionLabel icon={<CalendarIcon />}>Date</SectionLabel>
          <DateBadge iso={form.date} />
        </AnimatedSection>

        {/* Actions */}
        <AnimatedSection delay={320}>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 sm:flex-none sm:px-10 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-amber-200"
              style={{ transition: "all 0.15s cubic-bezier(0.16,1,0.3,1)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {editingId ? "Updating…" : "Saving…"}
                </>
              ) : (
                <>
                  {editingId ? <CheckmarkIcon /> : <PlusIcon />}
                  {editingId ? "Update record" : "Save record"}
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none sm:px-10 py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-sm font-semibold rounded-2xl"
              style={{ transition: "all 0.15s ease" }}
            >
              Cancel
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}