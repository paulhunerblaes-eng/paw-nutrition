import Link from "next/link";
import {
  PawPrintIcon,
  HomeIcon,
  FoodBowlIcon,
  CalendarIcon,
  SettingsIcon,
  UserIcon,
} from "../_components/Icons";
import { SubscriptionGate } from "../_components/SubscriptionGate";

const navItems = [
  { href: "/dashboard", Icon: HomeIcon, label: "Tableau de bord", featured: false },
  { href: "/dashboard/plan", Icon: FoodBowlIcon, label: "Mon plan", featured: true },
  { href: "/dashboard/animal", Icon: PawPrintIcon, label: "Mon animal", featured: false },
  { href: "/dashboard/historique", Icon: CalendarIcon, label: "Historique", featured: false },
  { href: "/dashboard/parametres", Icon: SettingsIcon, label: "Paramètres", featured: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="border-r border-slate-100 bg-white md:w-64 md:flex-shrink-0">
        {/* Logo */}
        <div className="border-b border-slate-100 p-6">
          <Link href="/" className="flex items-center gap-2">
            <PawPrintIcon className="h-5 w-5 text-petblue" />
            <span className="font-bold text-slate-900">
              Pet<span className="text-petblue">Nutri</span>
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map(({ href, Icon, label, featured }) => (
              <li key={href}>
                {featured ? (
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-2xl border border-green-300 bg-green-300/15 px-3 py-3 transition-colors hover:bg-green-300/25"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-green-700" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs font-normal text-slate-500">Votre plan personnalisé</p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-petblue/10 hover:text-slate-900"
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 w-64 border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-petblue/20">
              <UserIcon className="h-4 w-4 text-petblue" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-xs font-semibold text-slate-900">
                Mon compte
              </p>
              <p className="truncate text-xs text-slate-400">Plan actif</p>
            </div>
            <Link
              href="/dashboard/parametres"
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ↗
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-50 p-6 md:p-8">
        <SubscriptionGate>{children}</SubscriptionGate>
      </main>
    </div>
  );
}
