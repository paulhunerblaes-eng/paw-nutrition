import Link from "next/link";
import { PawPrintIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <PawPrintIcon className="h-6 w-6 text-petblue" />
              <span className="text-xl font-bold text-slate-900">
                Pet<span className="text-petblue">Nutri</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-slate-500">
              Offrez à votre chien ou chat la nutrition qu&apos;il mérite. Plans
              personnalisés basés sur la science vétérinaire.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Produit
            </h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/#how-it-works" className="hover:text-slate-900">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/questionnaire" className="hover:text-slate-900">
                  Créer un plan
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-slate-900">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Légal
            </h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/cgu" className="hover:text-slate-900">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-slate-900">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-slate-900">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          2026 PetNutri. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
