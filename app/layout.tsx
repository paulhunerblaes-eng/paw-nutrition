import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetNutri — Nutrition sur mesure pour votre chien ou chat",
  description:
    "Créez un plan nutritionnel personnalisé pour votre chien ou chat en 3 minutes. Basé sur la science vétérinaire.",
  keywords: ["nutrition chien", "nutrition chat", "alimentation animaux", "plan alimentaire"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
<body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
