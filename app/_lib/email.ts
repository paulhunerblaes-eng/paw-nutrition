import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "PetNutri <noreply@petnutri.fr>";

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f9ff;
  margin: 0;
  padding: 0;
`;

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${baseStyle}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f9ff;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#90D5FF;padding:28px 40px;text-align:center;">
            <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">PetNutri</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f5f9ff;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">© 2025 PetNutri · <a href="https://petnutri.fr" style="color:#90D5FF;text-decoration:none;">petnutri.fr</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333;">${text}</p>`;

const button = (text: string, url: string) =>
  `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:#90D5FF;border-radius:8px;">
      <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${text}</a>
    </td></tr>
  </table>`;

export function resetPasswordEmail(resetUrl: string): string {
  return layout(`
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1a1a1a;">Réinitialisation de votre mot de passe</h2>
    ${p("Bonjour,")}
    ${p("Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.")}
    ${button("Réinitialiser mon mot de passe", resetUrl)}
    ${p("Ce lien expire dans <strong>24 heures</strong>.")}
    ${p("Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.")}
    ${p("L'équipe PetNutri")}
  `);
}

export function cancellationEmail(endDate: string): string {
  return layout(`
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1a1a1a;">Confirmation de résiliation</h2>
    ${p("Bonjour,")}
    ${p("Nous confirmons la résiliation de votre abonnement PetNutri.")}
    ${p(`Vous conservez votre accès complet jusqu'au <strong>${endDate}</strong>. Passé cette date, votre accès sera désactivé.`)}
    ${p("Si vous changez d'avis, vous pouvez vous réabonner à tout moment sur <a href=\"https://petnutri.fr\" style=\"color:#90D5FF;\">petnutri.fr</a>.")}
    ${p("Merci d'avoir fait confiance à PetNutri.")}
    ${p("L'équipe PetNutri")}
  `);
}

export function accountDeletionEmail(): string {
  return layout(`
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1a1a1a;">Confirmation de suppression de compte</h2>
    ${p("Bonjour,")}
    ${p("Nous confirmons la suppression définitive de votre compte PetNutri.")}
    ${p("Toutes vos données ont été supprimées conformément au RGPD.")}
    ${p("Si vous souhaitez revenir, vous pouvez créer un nouveau compte sur <a href=\"https://petnutri.fr\" style=\"color:#90D5FF;\">petnutri.fr</a>.")}
    ${p("Merci d'avoir fait confiance à PetNutri.")}
    ${p("L'équipe PetNutri")}
  `);
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  await resend.emails.send({ from: FROM, to, subject, html });
}
