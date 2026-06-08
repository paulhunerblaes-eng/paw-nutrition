import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

export const metadata = {
  title: "Conditions Générales d'Utilisation — PetNutri",
};

export default function CGUPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-slate-900">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="mt-2 text-sm text-slate-400">Dernière mise à jour : juin 2026</p>

          <Section title="1. Objet">
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
              l&apos;utilisation du service PetNutri, plateforme de nutrition personnalisée pour chiens
              et chats, accessible à l&apos;adresse petnutri.fr (ci-après « le Service »).
            </p>
            <p className="mt-3">
              En utilisant le Service, vous acceptez sans réserve les présentes CGU. Si vous n&apos;en
              acceptez pas les termes, veuillez ne pas utiliser le Service.
            </p>
          </Section>

          <Section title="2. Description du service">
            <p>
              PetNutri propose des plans nutritionnels personnalisés générés par intelligence
              artificielle pour les chiens et les chats, sur la base des informations fournies par
              l&apos;utilisateur (espèce, race, âge, poids, niveau d&apos;activité, objectifs santé).
            </p>
            <p className="mt-3">
              L&apos;accès au Service est soumis à un abonnement mensuel de <strong>9,99 €/mois</strong>,
              résiliable à tout moment sans frais ni préavis, avec effet à la fin de la période en cours.
            </p>
            <p className="mt-3">
              L&apos;abonnement donne droit à <strong>4 mises à jour du plan nutritionnel par mois</strong>,
              ainsi qu&apos;à l&apos;accès à l&apos;historique des plans générés.
            </p>
          </Section>

          <Section title="3. Avertissement médical">
            <p>
              Les plans nutritionnels fournis par PetNutri sont générés par un algorithme d&apos;intelligence
              artificielle à titre informatif uniquement. Ils <strong>ne constituent pas un avis
              vétérinaire</strong> et ne sauraient remplacer une consultation auprès d&apos;un
              professionnel de santé animale.
            </p>
            <p className="mt-3">
              En cas de doute sur la santé ou les besoins nutritionnels de votre animal, consultez
              un vétérinaire. PetNutri ne pourra être tenu responsable des conséquences liées à
              l&apos;application des recommandations sans avis vétérinaire préalable.
            </p>
          </Section>

          <Section title="4. Inscription et compte utilisateur">
            <p>
              L&apos;utilisation complète du Service nécessite la création d&apos;un compte via une
              adresse e-mail valide. Vous êtes responsable de la confidentialité de vos identifiants
              et de toute activité réalisée depuis votre compte.
            </p>
          </Section>

          <Section title="5. Paiement et résiliation">
            <p>
              Le paiement est effectué par carte bancaire via Stripe, prestataire de paiement
              sécurisé. L&apos;abonnement est renouvelé automatiquement chaque mois.
            </p>
            <p className="mt-3">
              Vous pouvez résilier votre abonnement à tout moment depuis votre espace personnel.
              La résiliation prend effet à la fin de la période mensuelle en cours ; aucun
              remboursement partiel ne sera effectué.
            </p>
          </Section>

          <Section title="6. Droit de rétractation">
            <p>
              Conformément à l&apos;article L. 221-18 du Code de la consommation, vous disposez d&apos;un
              délai de <strong>14 jours</strong> à compter de la souscription pour exercer votre droit
              de rétractation, sans avoir à justifier de motifs.
            </p>
            <p className="mt-3">
              Pour exercer ce droit, contactez-nous à <a href="mailto:contact.petnutri@gmail.com" className="text-petblue underline">contact.petnutri@gmail.com</a>.
              Le remboursement sera effectué dans les 14 jours suivant la réception de votre demande.
            </p>
          </Section>

          <Section title="7. Données personnelles">
            <p>
              Le traitement de vos données personnelles est régi par notre{" "}
              <a href="/confidentialite" className="text-petblue underline">
                Politique de confidentialité
              </a>
              , conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </Section>

          <Section title="8. Propriété intellectuelle">
            <p>
              L&apos;ensemble des contenus du Service (textes, graphismes, algorithmes, interface)
              est la propriété exclusive de PetNutri et est protégé par le droit de la propriété
              intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.
            </p>
          </Section>

          <Section title="9. Modification des CGU">
            <p>
              PetNutri se réserve le droit de modifier les présentes CGU à tout moment. Les
              utilisateurs seront informés de toute modification substantielle par e-mail. La
              poursuite de l&apos;utilisation du Service après modification vaut acceptation des
              nouvelles CGU.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Pour toute question relative aux présentes CGU :{" "}
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
