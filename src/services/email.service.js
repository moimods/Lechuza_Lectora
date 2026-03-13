let nodemailer = null;

try {
  // Dependencia opcional para mantener compatibilidad en entornos sin SMTP.
  nodemailer = require("nodemailer");
} catch {
  nodemailer = null;
}

let cachedTransporter = null;

function isProduction() {
  return String(process.env.NODE_ENV || "development").toLowerCase() === "production";
}

function getSmtpConfig() {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const from = String(process.env.SMTP_FROM || user || "").trim();

  const configured = Boolean(host && port && user && pass && from);

  return {
    configured,
    host,
    port,
    user,
    pass,
    secure,
    from
  };
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (!nodemailer) {
    throw new Error("Dependencia nodemailer no disponible. Ejecuta: npm install");
  }

  const smtp = getSmtpConfig();
  if (!smtp.configured) {
    throw new Error("SMTP no configurado. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y SMTP_FROM");
  }

  cachedTransporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });

  return cachedTransporter;
}

function buildRecoveryMailHtml(code, ttlSeconds) {
  const ttlMinutes = Math.max(1, Math.ceil(Number(ttlSeconds || 0) / 60));

  return `
    <div style="font-family: Arial, sans-serif; color: #2f2f2f;">
      <h2 style="color: #5d4037; margin-bottom: 4px;">La Lechuza Lectora</h2>
      <p style="margin-top: 0;">Recuperación de contraseña</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Tu código de verificación es:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #5d4037;">${code}</p>
      <p>Este código vence en ${ttlMinutes} minuto(s).</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  `;
}

async function sendMail({ to, subject, text, html }) {
  const smtp = getSmtpConfig();

  if (!smtp.configured || !nodemailer) {
    if (isProduction()) {
      throw new Error("No se pudo enviar correo: SMTP no configurado");
    }

    console.log(`[MAIL-DEV] To: ${to} | Subject: ${subject}`);
    console.log(`[MAIL-DEV] Body: ${text}`);
    return { delivered: false, mode: "dev-console" };
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: smtp.from,
    to,
    subject,
    text,
    html
  });

  return { delivered: true, mode: "smtp" };
}

async function sendPasswordRecoveryCode({ to, code, ttlSeconds }) {
  const ttlMinutes = Math.max(1, Math.ceil(Number(ttlSeconds || 0) / 60));
  const subject = "Codigo de recuperacion - La Lechuza Lectora";
  const text = `Tu codigo de recuperacion es ${code}. Vence en ${ttlMinutes} minuto(s).`;
  const html = buildRecoveryMailHtml(code, ttlSeconds);

  return sendMail({ to, subject, text, html });
}

async function sendGenericVerificationCode({ to, code, purpose, ttlSeconds }) {
  const ttlMinutes = Math.max(1, Math.ceil(Number(ttlSeconds || 0) / 60));
  const subject = "Codigo de verificacion - La Lechuza Lectora";
  const text = `Tu codigo para ${purpose} es ${code}. Vence en ${ttlMinutes} minuto(s).`;

  return sendMail({
    to,
    subject,
    text,
    html: `<p>Tu codigo para <b>${purpose}</b> es <b>${code}</b>. Vence en ${ttlMinutes} minuto(s).</p>`
  });
}

module.exports = {
  sendPasswordRecoveryCode,
  sendGenericVerificationCode,
  getSmtpConfig
};
