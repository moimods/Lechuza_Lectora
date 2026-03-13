const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

function isLikelyValidMpToken(token) {
  const value = String(token || "").trim();
  if (!value) return false;

  // Reject obvious placeholders, but allow real TEST-/APP_USR- tokens.
  if (/x{6,}/i.test(value)) return false;
  if (/^(tu_|your_|token|coloca|pega|example)/i.test(value)) return false;
  if (value.length < 20) return false;
  return true;
}

const rawMpAccessToken = String(process.env.MP_ACCESS_TOKEN || "").trim();
const mpTokenConfigured = isLikelyValidMpToken(rawMpAccessToken);

const mpClient = mpTokenConfigured
  ? new MercadoPagoConfig({ accessToken: rawMpAccessToken })
  : null;

module.exports = {
  mpClient,
  Preference,
  Payment,
  mpTokenConfigured
};
