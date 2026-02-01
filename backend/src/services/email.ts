import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

// Crea transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Template email HTML base
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.appName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #E84393, #6C5CE7); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header .emoji { font-size: 48px; margin-bottom: 16px; }
    .content { padding: 32px; }
    .content h2 { color: #2D3436; margin-top: 0; }
    .content p { color: #636E72; line-height: 1.6; }
    .button { display: inline-block; background: #E84393; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .button:hover { background: #C73883; }
    .code { background: #f0f0f0; padding: 16px 32px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; text-align: center; margin: 16px 0; }
    .footer { padding: 24px; text-align: center; color: #B2BEC3; font-size: 12px; border-top: 1px solid #eee; }
    .footer a { color: #E84393; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">💃🕺</div>
      <h1>${config.appName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Questa email è stata inviata da ${config.appName}.</p>
      <p>Se non hai richiesto questa email, puoi ignorarla.</p>
    </div>
  </div>
</body>
</html>
`;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Invia email generica
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!config.email.user || !config.email.pass) {
      console.log('📧 Email non configurata, skip invio:', options.subject);
      console.log('   To:', options.to);
      return true; // In development, simula successo
    }

    await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('📧 Email inviata a:', options.to);
    return true;
  } catch (error) {
    console.error('❌ Errore invio email:', error);
    return false;
  }
};

// Email di conferma registrazione
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<boolean> => {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  
  const html = baseTemplate(`
    <h2>Ciao ${firstName}! 👋</h2>
    <p>Grazie per esserti registrato su <strong>${config.appName}</strong>!</p>
    <p>Per completare la registrazione e iniziare a ballare, conferma il tuo indirizzo email cliccando il pulsante qui sotto:</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Conferma Email</a>
    </p>
    <p>Oppure copia e incolla questo link nel tuo browser:</p>
    <p style="word-break: break-all; color: #888; font-size: 12px;">${verifyUrl}</p>
    <p><strong>Il link scade tra 24 ore.</strong></p>
    <p>Ci vediamo in pista! 💃🕺</p>
  `);

  return sendEmail({
    to: email,
    subject: `✉️ Conferma il tuo account ${config.appName}`,
    html,
    text: `Ciao ${firstName}! Conferma la tua email visitando: ${verifyUrl}`,
  });
};

// Email di reset password
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  token: string
): Promise<boolean> => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
  
  const html = baseTemplate(`
    <h2>Reset Password 🔐</h2>
    <p>Ciao ${firstName},</p>
    <p>Hai richiesto di reimpostare la password del tuo account ${config.appName}.</p>
    <p>Clicca il pulsante qui sotto per creare una nuova password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reimposta Password</a>
    </p>
    <p>Oppure copia e incolla questo link nel tuo browser:</p>
    <p style="word-break: break-all; color: #888; font-size: 12px;">${resetUrl}</p>
    <p><strong>Il link scade tra 1 ora.</strong></p>
    <p>Se non hai richiesto il reset della password, ignora questa email. La tua password rimarrà invariata.</p>
  `);

  return sendEmail({
    to: email,
    subject: `🔐 Reset password ${config.appName}`,
    html,
    text: `Ciao ${firstName}! Reimposta la tua password visitando: ${resetUrl}`,
  });
};

// Email di conferma cambio password
export const sendPasswordChangedEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  const html = baseTemplate(`
    <h2>Password Modificata ✅</h2>
    <p>Ciao ${firstName},</p>
    <p>La password del tuo account ${config.appName} è stata modificata con successo.</p>
    <p>Se non sei stato tu a fare questa modifica, contattaci immediatamente rispondendo a questa email.</p>
    <p>Ci vediamo in pista! 💃🕺</p>
  `);

  return sendEmail({
    to: email,
    subject: `✅ Password modificata - ${config.appName}`,
    html,
    text: `Ciao ${firstName}! La tua password è stata modificata con successo.`,
  });
};

// Email di benvenuto (dopo verifica)
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  const html = baseTemplate(`
    <h2>Benvenuto in ${config.appName}! 🎉</h2>
    <p>Ciao ${firstName},</p>
    <p>Il tuo account è stato verificato con successo!</p>
    <p>Ora puoi:</p>
    <ul>
      <li>🔍 Scoprire eventi di ballo nella tua città</li>
      <li>📅 Creare i tuoi eventi e invitare amici</li>
      <li>🎧 Diventare DJ della serata</li>
      <li>👥 Connetterti con altri ballerini</li>
    </ul>
    <p style="text-align: center;">
      <a href="${config.frontendUrl}" class="button">Inizia a ballare!</a>
    </p>
    <p>Ci vediamo in pista! 💃🕺</p>
  `);

  return sendEmail({
    to: email,
    subject: `🎉 Benvenuto in ${config.appName}!`,
    html,
    text: `Ciao ${firstName}! Benvenuto in ${config.appName}! Il tuo account è attivo.`,
  });
};
