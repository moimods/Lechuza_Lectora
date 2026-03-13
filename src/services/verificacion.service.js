const crypto = require("crypto");

const CODE_TTL_MS = Number(process.env.VERIFICATION_CODE_TTL_MS || 10 * 60 * 1000);
const verifications = new Map();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function makeKey(email, purpose) {
  return `${purpose}:${normalizeEmail(email)}`;
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

function maskEmail(email) {
  const normalized = normalizeEmail(email);
  const [name = "", domain = ""] = normalized.split("@");
  if (!domain) return normalized;

  const visible = name.slice(0, 2);
  const hidden = "*".repeat(Math.max(1, name.length - 2));
  return `${visible}${hidden}@${domain}`;
}

function createVerification(email, purpose) {
  const code = generateCode();
  const key = makeKey(email, purpose);
  const expiresAt = Date.now() + CODE_TTL_MS;

  verifications.set(key, {
    code,
    email: normalizeEmail(email),
    purpose,
    expiresAt,
    attempts: 0
  });

  return {
    code,
    expiresAt,
    ttlSeconds: Math.ceil(CODE_TTL_MS / 1000)
  };
}

function verifyCode(email, purpose, code, options = {}) {
  const consume = options.consume !== false;
  const key = makeKey(email, purpose);
  const entry = verifications.get(key);

  if (!entry) {
    return { ok: false, reason: "Código no solicitado" };
  }

  if (Date.now() > entry.expiresAt) {
    verifications.delete(key);
    return { ok: false, reason: "Código expirado" };
  }

  if (String(entry.code) !== String(code || "").trim()) {
    entry.attempts += 1;
    if (entry.attempts >= 5) {
      verifications.delete(key);
      return { ok: false, reason: "Código inválido. Solicita uno nuevo" };
    }
    return { ok: false, reason: "Código inválido" };
  }

  if (consume) {
    verifications.delete(key);
  }

  return { ok: true };
}

function debugCodeForDev(email, purpose) {
  const key = makeKey(email, purpose);
  const entry = verifications.get(key);
  return entry ? entry.code : null;
}

module.exports = {
  createVerification,
  verifyCode,
  debugCodeForDev,
  maskEmail
};
