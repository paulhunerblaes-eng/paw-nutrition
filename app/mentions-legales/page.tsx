import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

export const metadata = {
  title: "Mentions légales — PetNutri",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-slate-900">Mentions légales</h1>
          <p className="mt-2 text-sm text-slate-400">Dernière mise à jour : juin 2026</p>

          <Section title="Éditeur du site">
            <Row label="Dénomination" value="PetNutri" />
            <Row label="Forme juridique" value="Entreprise individuelle" />
            <Row label="Contact" value="contact.petnutri@gmail.com" href="mailto:contact.petnutri@gmail.com" />
          </Section>

          <Section title="Directeur de la publication">
            <p>Le directeur de la publication est le représentant légal de PetNutri.</p>
          </Section>

          <Section title="Hébergement">
            <Row label="Hébergeur" value="Vercel Inc." />
            <Row label="Adresse" value="440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" />
            <Row label="Site" value="vercel.com" href="https://vercel.com" />
          </Section>

          <Section title="Base de données">
            <Row label="Prestataire" value="Supabase Inc." />
            <Row label="Localisation des données" value="Europe (Frankfurt)" />
            <Row label="Site" value="supabase.com" href="https://supabase.com" />
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, algorithmes, design) est protégé
              par le droit de la propriété intellectuelle et appartient à PetNutri ou à ses
              concédants. Toute reproduction, même partielle, est interdite sans autorisation
              préalable écrite.
            </p>
          </Section>

          <Section title="Limitation de responsabilité">
            <p>
              PetNutri met tout en œuvre pour assurer l&apos;exactitude des informations publiées sur
              le site, mais ne peut garantir leur exhaustivité ni leur mise à jour en temps réel.
              Les plans nutritionnels générés sont fournis à titre informatif et ne remplacent pas
              un avis vétérinaire professionnel.
            </p>
          </Section>

          <Section title="Données personnelles">
            <p>
              Le traitement des données personnelles est décrit dans notre{" "}
              <a href="/confidentialite" className="text-petblue underline">
                Politique de confidentialité
              </a>
              . Conformément au RGPD, vous pouvez exercer vos droits à l&apos;adresse :{" "}
              <a href="mailto:contact.petnutri@gmail.com" className="text-petblue underline">
                contact.petnutri@gmail.com
              </a>
            </p>
          </Section>

          <Section title="Droit applicable">
            <p>
              Les présentes mentions légales sont soumises au droit français. Tout litige relatif
              à l&apos;utilisation du site sera soumis à la juridiction des tribunaux compétents.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question :{" "}
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

function Row({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="mt-2 flex gap-2">
      <span className="w-44 shrink-0 font-medium text-slate-700">{label} :</span>
      {href ? (
        <a href={href} className="text-petblue underline">
          {value}
        </a>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}
