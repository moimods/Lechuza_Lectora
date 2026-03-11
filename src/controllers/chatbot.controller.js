const authService = require("../services/auth.service");
const chatbotService = require("../services/chatbot.service");
const { success, error } = require("../utils/response");

async function responderMensaje(req, res, next) {
  try {
    const message = String(req.body && req.body.message ? req.body.message : "").trim();
    const rawHistory = Array.isArray(req.body && req.body.history) ? req.body.history : [];
    const history = rawHistory
      .slice(-5)
      .map((item) => ({
        role: String(item && item.role ? item.role : "user").slice(0, 20),
        text: String(item && item.text ? item.text : "").slice(0, 500),
        intent: item && item.intent ? String(item.intent).slice(0, 30) : null
      }));

    if (!message) {
      return error(res, "El mensaje es obligatorio", 400);
    }

    let user = null;
    const authHeader = req.headers.authorization;

    if (authHeader) {
      try {
        const token = authService.extraerToken(authHeader);
        if (token) {
          user = authService.verificarToken(token);
        }
      } catch {
        user = null;
      }
    }

    const response = await chatbotService.processMessage(message, user, history);

    return success(res, response, null, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  responderMensaje
};
