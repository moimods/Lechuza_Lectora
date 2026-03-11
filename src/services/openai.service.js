const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = [
  "Eres LechuBot, asistente virtual de La Lechuza Lectora.",
  "Analiza el mensaje del usuario y devuelve SOLO JSON valido.",
  "Intenciones permitidas:",
  "- buscar_libro",
  "- recomendacion",
  "- ayuda_compra",
  "- consultar_pedido",
  "- unknown",
  "Respuesta JSON exacta con llaves:",
  "{\"intent\":\"...\",\"query\":\"...\",\"orderId\":null}",
  "Reglas:",
  "- query: texto breve para buscar/recomendar.",
  "- orderId: numero de pedido si aparece, si no null.",
  "- No incluyas texto adicional fuera del JSON."
].join("\n");

function hasOpenAIConfig() {
  return Boolean(OPENAI_API_KEY);
}

function extractJson(content) {
  const text = String(content || "").trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) return null;

    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {
      return null;
    }
  }
}

async function analyzeMessage(message, history = []) {
  if (!hasOpenAIConfig()) {
    return null;
  }

  const compactHistory = Array.isArray(history)
    ? history.slice(-4).map((item) => ({
      role: item && item.role === "bot" ? "assistant" : "user",
      content: String(item && item.text ? item.text : "").slice(0, 250)
    }))
    : [];

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...compactHistory,
    { role: "user", content: String(message || "").slice(0, 500) }
  ];

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      max_tokens: 120,
      messages
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const err = (payload && payload.error && payload.error.message) || "OpenAI request failed";
    throw new Error(err);
  }

  const payload = await response.json();
  const content = payload && payload.choices && payload.choices[0] && payload.choices[0].message
    ? payload.choices[0].message.content
    : "";

  const parsed = extractJson(content);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  return {
    intent: String(parsed.intent || "unknown").toLowerCase(),
    query: String(parsed.query || "").trim(),
    orderId: parsed.orderId === null || parsed.orderId === undefined
      ? null
      : Number(parsed.orderId)
  };
}

module.exports = {
  analyzeMessage,
  hasOpenAIConfig,
  SYSTEM_PROMPT
};
