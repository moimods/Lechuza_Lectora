const pool = require("../config/db");
const openAIService = require("./openai.service");

const FALLBACK_MESSAGE = [
  "Lo siento, no entendi tu solicitud.",
  "Puedo ayudarte a:",
  "📚 Buscar libros",
  "⭐ Recibir recomendaciones",
  "🛒 Explicar como comprar",
  "📦 Consultar pedidos"
].join("\n");

const HELP_MESSAGE = [
  "Soy LechuBot 🦉 de La Lechuza Lectora.",
  "Te puedo ayudar con:",
  "📚 Buscar libros por titulo, autor o categoria.",
  "⭐ Recomendar lecturas.",
  "🛒 Explicar como comprar.",
  "📦 Consultar el estado de un pedido."
].join("\n");

const GENRE_HINTS = ["programacion", "fantasia", "ciencia ficcion", "historia", "novela", "terror", "romance", "misterio"];
const FOLLOW_UP_PATTERN = /otro|otra|mas|m[aá]s|similares|del mismo|de ese genero|de ese genero|repite/i;
const SEARCH_STOPWORDS = new Set([
  "busco", "buscar", "quiero", "necesito", "libro", "libros", "de", "del", "la", "el", "los", "las", "por", "favor",
  "tienen", "hay", "me", "puedes", "recomienda", "recomiendame", "dame"
]);

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function detectIntent(message) {
  const text = normalizeText(message);

  if (!text) return "help";

  if (/consultar pedido|estado de mi pedido|seguimiento de pedido|pedido|orden|donde esta/.test(text)) return "order";
  if (/carrito|agregar al carrito|eliminar del carrito|ver carrito/.test(text)) return "cart";
  if (/checkout|pago|metodo de pago|como comprar|como hago un pedido|comprar|proceso de compra/.test(text)) return "purchase";
  if (/recomiend|suger|popular|algo bueno para leer|que me recomiendas/.test(text)) return "recommend";
  if (/tienen|busco|buscar|quiero|libro|catalogo|novela|autor|titulo|categoria|genero|ciencia ficcion|fantasia|programacion|historia|terror|romance/.test(text)) return "search";
  if (/hola|buenas|ayuda|que puedes hacer/.test(text)) return "help";

  return "unknown";
}

function extractGenre(text) {
  const normalized = normalizeText(text);
  return GENRE_HINTS.find((genre) => normalized.includes(genre)) || null;
}

function buildConversationContext(message, history = []) {
  const recent = Array.isArray(history) ? history.slice(-5) : [];
  const currentGenre = extractGenre(message);

  let lastIntent = null;
  let lastGenre = currentGenre;

  for (let i = recent.length - 1; i >= 0; i--) {
    const item = recent[i] || {};
    if (!lastIntent && item.intent) {
      lastIntent = String(item.intent);
    }

    if (!lastGenre && item.text) {
      const detected = extractGenre(item.text);
      if (detected) {
        lastGenre = detected;
      }
    }

    if (lastIntent && lastGenre) {
      break;
    }
  }

  if (!lastIntent) {
    for (let i = recent.length - 1; i >= 0; i--) {
      const item = recent[i] || {};
      const detectedIntent = detectIntent(item.text || "");
      if (detectedIntent !== "unknown") {
        lastIntent = detectedIntent;
        break;
      }
    }
  }

  return {
    lastIntent,
    lastGenre,
    hasFollowUpWords: FOLLOW_UP_PATTERN.test(String(message || ""))
  };
}

function buildSearchQuery(message, context) {
  const genreFromMessage = extractGenre(message);
  if (genreFromMessage) {
    return genreFromMessage;
  }

  const normalized = normalizeText(message);
  const cleaned = normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !SEARCH_STOPWORDS.has(token));

  if (cleaned.length > 0) {
    return cleaned.join(" ");
  }

  if (context.lastGenre) {
    return context.lastGenre;
  }

  return message;
}

function resolveIntent(message, context) {
  const directIntent = detectIntent(message);
  if (directIntent !== "unknown") return directIntent;

  if (context.hasFollowUpWords && (context.lastIntent === "recommend" || context.lastIntent === "search")) {
    return context.lastIntent;
  }

  return "unknown";
}

function mapAIIntent(aiIntent) {
  const normalized = String(aiIntent || "").toLowerCase();
  if (normalized === "buscar_libro") return "search";
  if (normalized === "recomendacion") return "recommend";
  if (normalized === "ayuda_compra") return "purchase";
  if (normalized === "consultar_pedido") return "order";
  if (normalized === "help") return "help";
  return "unknown";
}

function toBookPayload(book) {
  return {
    id: Number(book.id_producto || 0),
    titulo: book.titulo,
    categoria: book.categoria || "Sin categoria",
    precio: Number(book.precio || 0).toFixed(2),
    imagen: book.imagen || ""
  };
}

async function searchBooks(rawQuery, limit = 5) {
  const queryText = normalizeText(rawQuery);
  const compact = queryText.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  const searchTerm = compact.length > 1 ? `%${compact}%` : "%";

  const result = await pool.query(
    `SELECT
      p.id_producto,
      p.titulo,
      COALESCE(c.nombre, 'Sin categoria') AS categoria,
      p.precio,
      COALESCE(p.imagen_url, '') AS imagen
     FROM productos p
     LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
     WHERE p.stock > 0
       AND (
         LOWER(unaccent(COALESCE(p.titulo, ''))) LIKE LOWER(unaccent($1))
         OR LOWER(unaccent(COALESCE(p.autor, ''))) LIKE LOWER(unaccent($1))
         OR LOWER(unaccent(COALESCE(c.nombre, ''))) LIKE LOWER(unaccent($1))
         OR LOWER(unaccent(COALESCE(p.descripcion, ''))) LIKE LOWER(unaccent($1))
       )
     ORDER BY p.stock DESC, p.id_producto
     LIMIT $2`,
    [searchTerm, limit]
  ).catch(async () => {
    return pool.query(
      `SELECT
        p.id_producto,
        p.titulo,
        COALESCE(c.nombre, 'Sin categoria') AS categoria,
        p.precio,
        COALESCE(p.imagen_url, '') AS imagen
       FROM productos p
       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
       WHERE p.stock > 0
         AND (
           LOWER(COALESCE(p.titulo, '')) LIKE $1
           OR LOWER(COALESCE(p.autor, '')) LIKE $1
           OR LOWER(COALESCE(c.nombre, '')) LIKE $1
           OR LOWER(COALESCE(p.descripcion, '')) LIKE $1
         )
       ORDER BY p.stock DESC, p.id_producto
       LIMIT $2`,
      [searchTerm, limit]
    );
  });

  return result.rows;
}

async function recommendBooks(rawQuery) {
  const text = normalizeText(rawQuery);
  const matched = GENRE_HINTS.find((g) => text.includes(g));

  let rows = [];

  if (matched) {
    rows = await searchBooks(matched, 4);
  }

  if (!rows.length) {
    const result = await pool.query(
      `SELECT
        p.id_producto,
        p.titulo,
        COALESCE(c.nombre, 'Sin categoria') AS categoria,
        p.precio,
        COALESCE(p.imagen_url, '') AS imagen
       FROM productos p
       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
       WHERE p.stock > 0
       ORDER BY p.stock DESC, p.id_producto
       LIMIT 4`
    );

    rows = result.rows;
  }

  return rows;
}

async function getOrderStatus(orderId, user) {
  if (!orderId) {
    return {
      message: "Para revisar tu pedido necesito el numero de pedido. Por favor compártelo para ayudarte.",
      found: false
    };
  }

  const result = await pool.query(
    `SELECT id_venta, id_usuario, estado, fecha_venta, total
     FROM ventas
     WHERE id_venta = $1`,
    [orderId]
  );

  if (!result.rows.length) {
    return {
      message: `No encontre el pedido #${orderId}. Verifica el numero e intentalo de nuevo.`,
      found: false
    };
  }

  const order = result.rows[0];

  if (!user) {
    return {
      message: `Encontre el pedido #${order.id_venta}. Para mostrarte su estado necesito que inicies sesion.`,
      found: false
    };
  }

  if (user.rol !== "admin" && Number(user.id) !== Number(order.id_usuario)) {
    return {
      message: "Ese pedido pertenece a otra cuenta. Inicia sesion con la cuenta correcta para consultarlo.",
      found: false
    };
  }

  return {
    found: true,
    message: `Pedido #${order.id_venta}: estado ${order.estado}. Total: $${Number(order.total).toFixed(2)} MXN.`,
    order
  };
}

function buildBooksReply(prefix, books) {
  if (!books.length) {
    return `${prefix}\nNo encontre resultados con ese criterio. ¿Quieres que busque por autor o categoria?`;
  }

  const lines = books.map((book) => {
    return [
      `📘 Libro: ${book.titulo}`,
      `📚 Categoria: ${book.categoria || "Sin categoria"}`,
      `💰 Precio: $${Number(book.precio || 0).toFixed(2)} MXN`,
      ...(book.imagen ? [`🖼 Imagen: ${book.imagen}`] : [])
    ].join("\n");
  });

  return `${prefix}\n\n${lines.join("\n\n")}`;
}

async function processMessage(message, user = null, history = []) {
  const context = buildConversationContext(message, history);
  const aiDecision = await openAIService.analyzeMessage(message, history).catch(() => null);
  const aiMappedIntent = mapAIIntent(aiDecision && aiDecision.intent);
  const intent = aiMappedIntent !== "unknown"
    ? aiMappedIntent
    : resolveIntent(message, context);
  const normalized = normalizeText(message);
  const contextualQuery = context.lastGenre && !extractGenre(message)
    ? `${message} ${context.lastGenre}`
    : message;

  if (intent === "help") {
    return { reply: HELP_MESSAGE, intent, books: [] };
  }

  if (intent === "purchase") {
    return {
      intent,
      books: [],
      reply: [
        "Para comprar en La Lechuza Lectora 🦉:",
        "1) Busca el libro en el catalogo.",
        "2) Haz clic en \"Agregar al carrito\".",
        "3) Ve a tu carrito de compras.",
        "4) Procede al checkout para completar el pago.",
        "Si quieres, puedo ayudarte a encontrar un libro 📚."
      ].join("\n")
    };
  }

  if (intent === "cart") {
    return {
      intent,
      books: [],
      reply: [
        "Sobre tu carrito 🛒:",
        "- Para agregar un libro: entra al catalogo y pulsa \"Agregar al carrito\".",
        "- Para eliminarlo: abre el carrito y usa el boton de quitar.",
        "- Para verlo: usa el icono 🛒 en la parte superior de la pagina."
      ].join("\n")
    };
  }

  if (intent === "order") {
    const orderIdMatch = normalized.match(/(pedido|orden)?\s*#?\s*(\d{1,10})/);
    const orderId = Number.isFinite(aiDecision && aiDecision.orderId)
      ? Number(aiDecision.orderId)
      : (orderIdMatch ? Number(orderIdMatch[2]) : null);
    if (!orderId) {
      return {
        intent,
        books: [],
        reply: "Por favor ingresa tu numero de pedido para consultarlo 📦"
      };
    }

    const result = await getOrderStatus(orderId, user);
    return { intent, reply: result.message, books: [], order: result.order || null };
  }

  if (intent === "recommend") {
    const books = await recommendBooks((aiDecision && aiDecision.query) || contextualQuery);
    const payloadBooks = books.map(toBookPayload);
    return {
      intent,
      books: payloadBooks,
      reply: buildBooksReply("Te recomiendo estos libros ⭐:", books)
    };
  }

  if (intent === "search") {
    const query = (aiDecision && aiDecision.query) || buildSearchQuery(message, context);
    const books = await searchBooks(query, 5);
    const payloadBooks = books.map(toBookPayload);
    return {
      intent,
      books: payloadBooks,
      reply: buildBooksReply("Estos libros estan disponibles en el catalogo:", books)
    };
  }

  return {
    intent: "unknown",
    reply: FALLBACK_MESSAGE,
    books: []
  };
}

module.exports = {
  processMessage,
  FALLBACK_MESSAGE
};
