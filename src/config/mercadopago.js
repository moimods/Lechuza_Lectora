const { MercadoPagoConfig, Preference } = require("mercadopago");

const mpClient = process.env.MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  : null;

module.exports = {
  mpClient,
  Preference
};
