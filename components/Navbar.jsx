"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Dukaan", href: "/shops" },
  { label: "Analytics", href: "/anylatics" },
  { label: "Expense", href: "/expense" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 shadow-sm inset-x-0 z-50 transition-all duration-300
          ${
            scrolled
              ? "bg-white/95 backdrop-blur-lg"
              : "bg-white/80 backdrop-blur-md"
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              onClick={() => setMenuOpen(false)}
            >
              {/* Gem icon */}
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm shadow-amber-200 group-hover:shadow-md group-hover:shadow-amber-300 transition-all duration-300">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 2L2 8l10 14L22 8l-4-6H6zm1.5 2h9l2.5 3.5H5L7.5 4zM4.5 9.5h15L12 20 4.5 9.5z" />
                </svg>
              </span>
              <div className="leading-none">
                <span className="block text-base font-bold text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors duration-200">
                  Malka
                </span>
                <span className="block text-[10px] font-medium text-amber-500 tracking-[0.18em] uppercase">
                  Jewellers
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-200 group"
                >
                  {link.label}
                  <span className="absolute bottom-1.5 left-4 right-4 h-px bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/get-started"
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-sm shadow-amber-200 hover:shadow-md hover:shadow-amber-300 active:scale-95 transition-all duration-200"
              >
                Login
              </Link>
            </div>

            {/* Mobile: Login + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm shadow-amber-200 active:scale-95 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors duration-200"
              >
                <span
                  className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 2L2 8l10 14L22 8l-4-6H6zm1.5 2h9l2.5 3.5H5L7.5 4zM4.5 9.5h15L12 20 4.5 9.5z" />
              </svg>
            </span>
            <div className="leading-none">
              <span className="block text-sm font-bold text-slate-800">
                Malka
              </span>
              <span className="block text-[9px] font-semibold text-amber-500 tracking-widest uppercase">
                Jewellers
              </span>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
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

        {/* Drawer nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ animationDelay: `${i * 50}ms` }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 group-hover:bg-amber-500 transition-colors" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer CTA */}
        <div className="px-4 pb-8 pt-4 border-t border-slate-50 space-y-2">
          <Link
            href="/get-started"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200"
          >
            Get started
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm shadow-amber-200 transition-all duration-200 active:scale-95"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Spacer so page content clears the fixed nav */}
      <div className="h-16 sm:h-18" />
    </>
  );
}
