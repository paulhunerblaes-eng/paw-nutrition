"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { AuthModal } from "./_components/AuthModal";
import { supabase } from "./_lib/supabase";
import {
  CpuIcon,
  SparklesIcon,
  ShoppingCartIcon,
  BoltIcon,
  ClipboardIcon,
  ChartBarIcon,
  TrophyIcon,
  CheckCircleIcon,
} from "./_components/Icons";

const features = [
  {
    Icon: CpuIcon,
    title: "Analyse IA avancée",
    desc: "Notre algorithme analyse plus de 50 critères pour construire un plan nutritionnel optimisé pour votre animal.",
  },
  {
    Icon: SparklesIcon,
    title: "100% personnalisé",
    desc: "Race, âge, poids, activité, objectifs santé — chaque plan est unique et adapté à votre compagnon.",
  },
  {
    Icon: ShoppingCartIcon,
    title: "Produits réels",
    desc: "Des références de produits disponibles en animalerie ou en ligne, adaptés à votre budget mensuel.",
  },
  {
    Icon: BoltIcon,
    title: "Simple et rapide",
    desc: "Répondez à quelques questions et recevez un plan complet en moins de 3 minutes.",
  },
];

const steps = [
  {
    number: "01",
    title: "Décrivez votre animal",
    desc: "Race, âge, poids, niveau d'activité… Dites-nous tout en 3 étapes guidées.",
    Icon: ClipboardIcon,
  },
  {
    number: "02",
    title: "Notre IA analyse",
    desc: "Notre algorithme génère un plan nutritionnel complet et personnalisé sur mesure.",
    Icon: CpuIcon,
  },
  {
    number: "03",
    title: "Recevez votre plan",
    desc: "Accédez à votre tableau de bord pour suivre l'évolution et ajuster le plan.",
    Icon: ChartBarIcon,
  },
];

const TESTIMONIALS = [
  { name: "Marie L.", photo: "https://randomuser.me/api/portraits/women/44.jpg", pet: "Golden Retriever, 4 ans", text: "Mon chien a perdu 3 kg en 2 mois. Le vétérinaire est bluffé par les résultats, il ne s'attendait pas à une telle progression !" },
  { name: "Thomas R.", photo: "https://randomuser.me/api/portraits/men/32.jpg", pet: "Persan, 7 ans", text: "Enfin un plan vraiment adapté aux problèmes rénaux de mon chat senior. Sa vitalité a retrouvé un niveau que je n'avais pas vu depuis des années." },
  { name: "Sophie M.", photo: "https://randomuser.me/api/portraits/women/68.jpg", pet: "Berger Allemand, 2 ans", text: "Le plan est clair, détaillé et Luna adore ses nouvelles rations ! En 6 semaines son pelage est devenu brillant et soyeux." },
  { name: "Lucas B.", photo: "https://randomuser.me/api/portraits/men/52.jpg", pet: "Labrador, 5 ans", text: "Max souffrait de diabète et je ne savais plus quoi lui donner. Le plan de PetNutri a stabilisé sa glycémie, mon vétérinaire a réduit sa dose d'insuline." },
  { name: "Camille D.", photo: "https://randomuser.me/api/portraits/women/19.jpg", pet: "Maine Coon, 3 ans", text: "Tibère était en surpoids depuis sa stérilisation. Après 3 mois avec PetNutri il a retrouvé son poids idéal sans jamais sembler affamé." },
  { name: "Antoine G.", photo: "https://randomuser.me/api/portraits/men/77.jpg", pet: "Bulldog Français, 3 ans", text: "Mon bouledogue avait des problèmes digestifs chroniques. Deux semaines après avoir suivi le plan, plus aucun souci. Incroyable !" },
  { name: "Léa F.", photo: "https://randomuser.me/api/portraits/women/25.jpg", pet: "Siamois, 2 ans", text: "Luna était allergique à plein d'aliments et je passais des heures à lire les étiquettes. PetNutri m'a mâché le travail, c'est un gain de temps énorme." },
  { name: "Julien C.", photo: "https://randomuser.me/api/portraits/men/14.jpg", pet: "Border Collie, 1 an", text: "Avec son niveau d'activité extrême, Pixel avait besoin d'un plan sportif. PetNutri a tout calculé : calories, protéines, récupération. Parfait." },
  { name: "Emma V.", photo: "https://randomuser.me/api/portraits/women/63.jpg", pet: "Ragdoll, 9 ans", text: "Ma chatte senior avait perdu de l'appétit. Le plan adapté à son âge a tout changé, elle mange bien et a retrouvé son énergie de jeune chatte." },
  { name: "Hugo P.", photo: "https://randomuser.me/api/portraits/men/89.jpg", pet: "Husky, 4 ans", text: "Je cherchais un régime adapté aux hivers rudes et à son activité de traîneau. Le plan PetNutri est exactement ce qu'il lui fallait, Niko est en pleine forme." },
  { name: "Chloé N.", photo: "https://randomuser.me/api/portraits/women/37.jpg", pet: "British Shorthair, 4 ans", text: "Mon chat stérilisé prenait du poids malgré une alimentation que je pensais équilibrée. Le plan m'a ouvert les yeux sur les vraies portions à donner." },
  { name: "Maxime T.", photo: "https://randomuser.me/api/portraits/men/41.jpg", pet: "Caniche, 11 ans", text: "Rocky souffre d'arthrite et j'ignorais que l'alimentation pouvait aider. Depuis le plan riche en oméga-3, il boite beaucoup moins le matin." },
  { name: "Inès H.", photo: "https://randomuser.me/api/portraits/women/55.jpg", pet: "Bengal, 2 ans", text: "Mon Bengal est hyperactif et j'avais du mal à suivre ses besoins. Le plan personnalisé l'a calmé sans l'abrutir, c'est un équilibre parfait." },
  { name: "Romain S.", photo: "https://randomuser.me/api/portraits/men/28.jpg", pet: "Yorkshire, 6 ans", text: "Petit gabarit mais grands besoins ! PetNutri a calibré les portions au gramme près pour Noisette. Elle a pris le poids qu'il lui manquait en 6 semaines." },
  { name: "Clara M.", photo: "https://randomuser.me/api/portraits/women/72.jpg", pet: "Chartreux, 5 ans", text: "Le pelage de mon Chartreux était terne et il perdait beaucoup de poils. Depuis le plan PetNutri, son manteau est dense et brillant, tout le monde le remarque." },
  { name: "Pierre L.", photo: "https://randomuser.me/api/portraits/men/60.jpg", pet: "Rottweiler, 3 ans", text: "Je voulais développer la masse musculaire d'Atlas pour la protection. Le plan sportif de PetNutri a clairement fait la différence, il est impressionnant." },
  { name: "Manon B.", photo: "https://randomuser.me/api/portraits/women/48.jpg", pet: "Angora turc, 6 ans", text: "Flocon avalait ses poils et vomissait régulièrement. Le plan riche en fibres a presque éliminé le problème des boules de poils, je suis soulagée." },
  { name: "Théo R.", photo: "https://randomuser.me/api/portraits/men/35.jpg", pet: "Cocker Spaniel, 4 ans", text: "Caramel avait des otites à répétition liées à son alimentation selon le véto. Le plan anti-inflammatoire de PetNutri a réduit les crises de moitié." },
  { name: "Alice J.", photo: "https://randomuser.me/api/portraits/women/82.jpg", pet: "Norvégien, 7 ans", text: "Mon chat vit dehors et chasse beaucoup. PetNutri a adapté le plan à ce mode de vie actif, il est en excellente santé malgré ses sorties quotidiennes." },
  { name: "Nicolas E.", photo: "https://randomuser.me/api/portraits/men/91.jpg", pet: "Sphynx, 3 ans", text: "Le Sphynx a des besoins caloriques très spécifiques à cause de son manque de fourrure. PetNutri l'a compris et le plan est vraiment taillé sur mesure." },
];

const pricingAdvantages = [
  "Plan nutritionnel complet et personnalisé",
  "Recommandations de produits réels",
  "Liste de courses mensuelle détaillée",
  "Compléments alimentaires adaptés",
  "Accès au tableau de bord",
  "4 mises à jour du plan par mois (1 par semaine)",
  "Modification des informations de votre animal à tout moment avec mise à jour instantanée du plan",
];

export default function LandingPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCTA = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push("/dashboard");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push("/questionnaire");
  };

  const ctaClass =
    "w-full rounded-full bg-petblue px-8 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-petblue/30 transition-all hover:bg-petblue/80 sm:w-auto";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Hero */}
      <section className="bg-petblue/10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-petblue/40 bg-white px-4 py-1.5 text-sm font-medium text-slate-700">
            <TrophyIcon className="h-4 w-4 text-petblue" />
            <span>Plus de 10 000 plans créés</span>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            La nutrition parfaite
            <br />
            <span className="text-petblue">pour votre compagnon</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Découvrez le régime idéal pour votre chien ou votre chat grâce à
            notre analyse intelligente. Recevez des recommandations de produits
            adaptés à ses besoins uniques.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleCTA}
              className={ctaClass}
            >
              Créer le plan de mon animal →
            </button>
            <Link
              href="/#how-it-works"
              className="w-full rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            >
              Voir comment ça marche
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Questionnaire gratuit • Résultat immédiat • Sans engagement
          </p>

          {/* Hero image */}
          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl shadow-2xl shadow-petblue/20">
            <Image
              src="/hero-pets.jpg"
              alt="Chien et chat heureux"
              width={900}
              height={500}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Comment ça marche
            </h2>
            <p className="mt-3 text-slate-500">
              Un plan nutritionnel complet en moins de 3 minutes
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map(({ number, title, desc, Icon }, i) => (
              <div key={number} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute left-full top-8 hidden h-0.5 w-full -translate-y-1/2 bg-petblue/20 md:block" />
                )}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-petblue shadow-lg shadow-petblue/30">
                  <Icon className="h-7 w-7 text-slate-900" />
                </div>
                <div className="mb-1 text-xs font-bold tracking-widest text-petblue">
                  {number}
                </div>
                <h3 className="mb-2 font-bold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={handleCTA}
              className="inline-flex rounded-full bg-petblue px-8 py-4 font-semibold text-slate-900 shadow-lg shadow-petblue/30 transition-all hover:bg-petblue/80"
            >
              Commencer maintenant →
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-petblue/10 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Pourquoi choisir PetNutri ?
            </h2>
            <p className="mt-3 text-slate-500">
              Une approche scientifique pour le bien-être de votre chien ou chat
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-petblue/20 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-petblue/20">
                  <Icon className="h-6 w-6 text-petblue" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="overflow-hidden bg-white py-20">
        <div className="mb-12 px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Ils font confiance à PetNutri
          </h2>
        </div>
        <div className="flex animate-scroll-left">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div
              key={i}
              className="mx-3 w-80 flex-shrink-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.pet}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 flex gap-0.5 text-yellow-400">
                {"★★★★★".split("").map((s, i2) => (
                  <span key={i2}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-petblue/10 px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-petblue/40 bg-white px-4 py-1.5 text-sm font-medium text-slate-700">
            <TrophyIcon className="h-4 w-4 text-petblue" />
            <span>Abonnement mensuel</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Un tarif simple, transparent
          </h2>
          <p className="mt-3 text-slate-500">
            Résiliable à tout moment. Sans engagement.
          </p>

          <div className="mt-10 rounded-3xl border-2 border-petblue bg-white p-8 shadow-xl shadow-petblue/20">
            <div className="text-center">
              <div className="text-5xl font-extrabold text-slate-900">9,99€</div>
              <div className="mt-1 text-sm text-slate-400">par mois</div>
            </div>

            <ul className="mt-8 space-y-3 text-left">
              {pricingAdvantages.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-petblue" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleCTA}
              className="mt-8 flex w-full items-center justify-center rounded-full bg-petblue py-4 font-semibold text-slate-900 shadow-lg shadow-petblue/30 transition-all hover:bg-petblue/80"
            >
              Démarrer maintenant →
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Paiement sécurisé par Stripe
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-petblue px-8 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Prêt à offrir le meilleur à votre animal ?
          </h2>
          <p className="mt-4 text-slate-700">
            Rejoignez 10 000+ propriétaires qui ont transformé la santé de leur
            chien ou chat.
          </p>
          <button
            type="button"
            onClick={handleCTA}
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-50"
          >
            Créer mon plan gratuit →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
