const pool = require("../config/db");

const FALLBACK_MESSAGE = "No tengo esa información en este momento, pero puedo ayudarte a buscar libros o guiarte en el proceso de compra.";

const HELP_MESSAGE = [
  "Te puedo ayudar con:",
  "- Buscar libros por titulo, autor o genero.",
  "- Recomendar libros disponibles.",
  "- Explicar el proceso de compra y carrito.",
  "- Consultar el estado de un pedido con su numero."
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

  if (/pedido|orden|seguimiento|donde esta/.test(text)) return "order";
  if (/carrito|agregar al carrito|eliminar del carrito|ver carrito/.test(text)) return "cart";
  if (/checkout|pago|metodo de pago|comprar|proceso de compra/.test(text)) return "purchase";
  if (/recomiend|suger|popular/.test(text)) return "recommend";
  if (/tienen|busco|buscar|libro|catalogo|ciencia ficcion|fantasia|programacion|historia/.test(text)) return "search";
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

async function searchBooks(rawQuery, limit = 5) {
  const queryText = normalizeText(rawQuery);
  const compact = queryText.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  const searchTerm = compact.length > 1 ? `%${compact}%` : "%";

  const result = await pool.query(
    `SELECT
      p.id_producto,
      p.titulo,
      COALESCE(c.nombre, 'Sin categoria') AS categoria,
      p.precio
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
        p.precio
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
        p.precio
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
    return `${prefix}\n${FALLBACK_MESSAGE}`;
  }

  const lines = books.map((book) => {
    return [
      `📘 Libro: ${book.titulo}`,
      `📚 Categoria: ${book.categoria || "Sin categoria"}`,
      `💲 Precio: $${Number(book.precio || 0).toFixed(2)} MXN`
    ].join("\n");
  });

  return `${prefix}\n\n${lines.join("\n\n")}`;
}

async function processMessage(message, user = null, history = []) {
  const context = buildConversationContext(message, history);
  const intent = resolveIntent(message, context);
  const normalized = normalizeText(message);
  const contextualQuery = context.lastGenre && !extractGenre(message)
    ? `${message} ${context.lastGenre}`
    : message;

  if (intent === "help") {
    return { reply: HELP_MESSAGE, intent };
  }

  if (intent === "purchase") {
    return {
      intent,
      reply: [
        "Para comprar un libro sigue estos pasos:",
        "1) Busca el libro en el catalogo.",
        "2) Haz clic en \"Agregar al carrito\".",
        "3) Ve a tu carrito de compras.",
        "4) Procede al checkout para completar el pago."
      ].join("\n")
    };
  }

  if (intent === "cart") {
    return {
      intent,
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
    const orderId = orderIdMatch ? Number(orderIdMatch[2]) : null;
    const result = await getOrderStatus(orderId, user);
    return { intent, reply: result.message, order: result.order || null };
  }

  if (intent === "recommend") {
    const books = await recommendBooks(contextualQuery);
    return {
      intent,
      books,
      reply: buildBooksReply("Aqui tienes algunas recomendaciones:", books)
    };
  }

  if (intent === "search") {
    const query = buildSearchQuery(message, context);
    const books = await searchBooks(query, 5);
    return {
      intent,
      books,
      reply: buildBooksReply("Estos libros estan disponibles en el catalogo:", books)
    };
  }

  return {
    intent: "unknown",
    reply: FALLBACK_MESSAGE
  };
}

module.exports = {
  processMessage,
  FALLBACK_MESSAGE
};
