"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PawPrintIcon,
  HomeIcon,
  FoodBowlIcon,
  CalendarIcon,
  SettingsIcon,
  UserIcon,
} from "../../_components/Icons";

const navItems = [
  { href: "/dashboard/plan", Icon: FoodBowlIcon, label: "Mon plan", featured: true },
  { href: "/dashboard", Icon: HomeIcon, label: "Tableau de bord", featured: false },
  { href: "/dashboard/animal", Icon: PawPrintIcon, label: "Mon animal", featured: false },
  { href: "/dashboard/historique", Icon: CalendarIcon, label: "Historique", featured: false },
  { href: "/dashboard/parametres", Icon: SettingsIcon, label: "Paramètres", featured: false },
];

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-slate-100 p-5 md:p-6">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <PawPrintIcon className="h-5 w-5 text-petblue" />
          <span className="font-bold text-slate-900">
            Pet<span className="text-petblue">Nutri</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map(({ href, Icon, label, featured }) => (
            <li key={href}>
              {featured ? (
                <Link
                  href={href}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-2xl border border-petblue bg-petblue/15 px-3 py-3 transition-colors hover:bg-petblue/25"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-slate-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs font-normal text-slate-500">Votre plan personnalisé</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href={href}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-petblue/10 hover:text-slate-900"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom "Mon compte" */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-petblue/20">
            <UserIcon className="h-4 w-4 text-petblue" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900">Mon compte</p>
            <p className="truncate text-xs text-slate-400">Plan actif</p>
          </div>
          <Link
            href="/dashboard/parametres"
            onClick={onNavigate}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <PawPrintIcon className="h-5 w-5 text-petblue" />
          <span className="font-bold text-slate-900">
            Pet<span className="text-petblue">Nutri</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNav onNavigate={() => setOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden border-r border-slate-100 bg-white md:flex md:w-64 md:flex-shrink-0 md:flex-col">
        <SidebarNav />
      </aside>
    </>
  );
}
