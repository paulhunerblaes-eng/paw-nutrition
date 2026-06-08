import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

export const metadata = {
  title: "Politique de confidentialité — PetNutri",
};

export default function ConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-slate-900">
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-sm text-slate-400">Dernière mise à jour : juin 2026</p>

          <Section title="1. Responsable du traitement">
            <p>
              Le responsable du traitement des données personnelles collectées via le Service
              PetNutri est la société PetNutri, joignable à l&apos;adresse :{" "}
              <a href="mailto:contact.petnutri@gmail.com" className="text-petblue underline">
                contact.petnutri@gmail.com
              </a>
            </p>
          </Section>

          <Section title="2. Données collectées">
            <p>Nous collectons uniquement les données nécessaires au fonctionnement du Service :</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <strong>Données de compte :</strong> adresse e-mail, date d&apos;inscription.
              </li>
              <li>
                <strong>Données de l&apos;animal :</strong> espèce, race, âge, poids, niveau
                d&apos;activité, objectifs santé, budget alimentaire.
              </li>
              <li>
                <strong>Données de paiement :</strong> gérées exclusivement par Stripe — PetNutri
                ne stocke aucune donnée bancaire.
              </li>
              <li>
                <strong>Données techniques :</strong> logs de connexion, adresse IP (à des fins
                de sécurité uniquement).
              </li>
            </ul>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données sont utilisées pour :</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Créer et gérer votre compte utilisateur.</li>
              <li>Générer et personnaliser vos plans nutritionnels.</li>
              <li>Traiter votre abonnement et vos paiements.</li>
              <li>Vous envoyer des communications liées au Service (transactionnelles uniquement).</li>
              <li>Améliorer le Service (données agrégées et anonymisées).</li>
            </ul>
          </Section>

          <Section title="4. Partage des données">
            <p>
              Vos données personnelles ne sont <strong>jamais vendues ni louées</strong> à des tiers.
              Elles peuvent être transmises aux sous-traitants suivants, dans le strict cadre de
              leurs missions :
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <strong>Supabase</strong> — hébergement de la base de données (serveurs en Europe).
              </li>
              <li>
                <strong>Vercel</strong> — hébergement de l&apos;application (serveurs en Europe).
              </li>
              <li>
                <strong>Stripe</strong> — traitement des paiements (certifié PCI-DSS).
              </li>
              <li>
                <strong>Anthropic</strong> — génération des plans par IA (données de l&apos;animal
                uniquement, sans identifiant personnel).
              </li>
            </ul>
          </Section>

          <Section title="5. Hébergement et sécurité">
            <p>
              L&apos;application est hébergée sur <strong>Vercel</strong> et la base de données sur
              <strong> Supabase</strong>, avec des serveurs localisés en Europe. Les communications
              sont chiffrées en HTTPS/TLS. Les mots de passe ne sont jamais stockés en clair.
            </p>
          </Section>

          <Section title="6. Durée de conservation">
            <p>
              Vos données sont conservées pendant toute la durée de votre abonnement et supprimées
              dans un délai de <strong>30 jours</strong> suivant la clôture de votre compte, sauf
              obligation légale contraire (données comptables : 10 ans).
            </p>
          </Section>

          <Section title="7. Vos droits">
            <p>
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données.</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes.</li>
              <li><strong>Droit à l&apos;effacement :</strong> supprimer votre compte et vos données.</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré.</li>
              <li><strong>Droit d&apos;opposition :</strong> vous opposer à certains traitements.</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:contact.petnutri@gmail.com" className="text-petblue underline">
                contact.petnutri@gmail.com
              </a>
              . Nous répondrons dans un délai de 30 jours. Vous pouvez également adresser une
              réclamation à la CNIL (cnil.fr).
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Le Service utilise uniquement des cookies strictement nécessaires à son fonctionnement
              (session d&apos;authentification). Aucun cookie publicitaire ou de traçage tiers n&apos;est
              déposé.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Pour toute question relative à cette politique :{" "}
              <a href="mailto:contact.petnutri@gmail.com" className="text-petblue underline">
                contact.petnutri@gmail.com
              </a>
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}
