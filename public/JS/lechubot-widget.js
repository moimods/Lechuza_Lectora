(function () {
  if (window.__LECHUBOT_LOADED__) return;
  window.__LECHUBOT_LOADED__ = true;

  const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "/api";
  const API_ENDPOINT = `${String(API_BASE).replace(/\/$/, "")}/chatbot/message`;
  const MAX_HISTORY = 5;
  const QUICK_ACTIONS = [
    { label: "Buscar libros", prompt: "Busco libros de fantasia" },
    { label: "Recomendaciones", prompt: "Recomiendame libros" },
    { label: "Como comprar", prompt: "Como comprar un libro" },
    { label: "Consultar pedido", prompt: "Quiero consultar mi pedido" }
  ];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function withBreaks(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function buildWidget() {
    const style = document.createElement("style");
    style.textContent = `
      .lechubot-toggle {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 10000;
        background: #5d4037;
        color: #fff;
        border: 0;
        border-radius: 999px;
        width: 58px;
        height: 58px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        font-size: 24px;
      }
      .lechubot-panel {
        position: fixed;
        right: 18px;
        bottom: 86px;
        width: min(360px, calc(100vw - 24px));
        height: min(560px, calc(100vh - 110px));
        background: #fff;
        border-radius: 14px;
        border: 1px solid #ddd;
        overflow: hidden;
        z-index: 10000;
        box-shadow: 0 16px 38px rgba(0, 0, 0, 0.25);
        display: none;
        flex-direction: column;
      }
      .lechubot-header {
        background: linear-gradient(135deg, #5d4037, #7a5648);
        color: white;
        padding: 12px 14px;
        font-weight: 700;
        font-family: Georgia, 'Times New Roman', serif;
      }
      .lechubot-body {
        flex: 1;
        overflow-y: auto;
        background: #faf7f3;
        padding: 12px;
        font-family: Roboto, sans-serif;
      }
      .lechubot-quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
      }
      .lechubot-quick-actions button {
        border: 1px solid #d8c8bf;
        background: #fff;
        color: #5d4037;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .lechubot-quick-actions button:hover {
        background: #f1e7e1;
      }
      .lechubot-msg {
        margin-bottom: 10px;
        max-width: 92%;
        border-radius: 10px;
        padding: 10px;
        line-height: 1.4;
        white-space: normal;
        font-size: 14px;
      }
      .lechubot-msg.user {
        margin-left: auto;
        background: #ece0db;
      }
      .lechubot-msg.bot {
        margin-right: auto;
        background: #fff;
        border: 1px solid #e4d6cf;
      }
      .lechubot-input {
        display: flex;
        border-top: 1px solid #ddd;
        background: #fff;
      }
      .lechubot-input input {
        flex: 1;
        border: 0;
        padding: 12px;
        outline: none;
        font-size: 14px;
      }
      .lechubot-input button {
        border: 0;
        background: #5d4037;
        color: white;
        padding: 0 14px;
        cursor: pointer;
        font-weight: 700;
      }
      @media (max-width: 560px) {
        .lechubot-panel {
          right: 8px;
          left: 8px;
          bottom: 78px;
          width: auto;
          height: min(70vh, calc(100vh - 96px));
        }
        .lechubot-toggle {
          right: 10px;
          bottom: 10px;
        }
      }
    `;

    const toggle = document.createElement("button");
    toggle.className = "lechubot-toggle";
    toggle.type = "button";
    toggle.title = "Abrir LechuBot";
    toggle.innerText = "🤖";

    const panel = document.createElement("section");
    panel.className = "lechubot-panel";
    panel.innerHTML = `
      <header class="lechubot-header">LechuBot | La Lechuza Lectora</header>
      <div class="lechubot-body" id="lechubot-body">
        <div class="lechubot-quick-actions" id="lechubot-quick-actions"></div>
      </div>
      <form class="lechubot-input" id="lechubot-form">
        <input id="lechubot-text" type="text" placeholder="Escribe tu mensaje..." autocomplete="off" />
        <button type="submit">Enviar</button>
      </form>
    `;

    document.head.appendChild(style);
    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    return { toggle, panel };
  }

  function appendMessage(body, text, from) {
    const div = document.createElement("div");
    div.className = `lechubot-msg ${from}`;
    div.innerHTML = withBreaks(text);
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function pushHistory(history, entry) {
    history.push(entry);
    if (history.length > MAX_HISTORY) {
      history.splice(0, history.length - MAX_HISTORY);
    }
  }

  async function askBot(text, history) {
    const token = localStorage.getItem("laLechuza_jwt_token");

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ message: text, history })
    });

    const payload = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      throw new Error((payload && (payload.error || payload.message)) || "No se pudo procesar la consulta");
    }

    return payload.data || payload;
  }

  function init() {
    if (!document.body) return;

    const { toggle, panel } = buildWidget();
    const body = document.getElementById("lechubot-body");
    const form = document.getElementById("lechubot-form");
    const input = document.getElementById("lechubot-text");
    const quickActions = document.getElementById("lechubot-quick-actions");
    const history = [];

    const welcome = [
      "Hola 👋",
      "Soy Lechu, el asistente virtual de La Lechuza Lectora 🦉",
      "",
      "Puedo ayudarte a:",
      "📚 Buscar libros",
      "📖 Recibir recomendaciones",
      "🛒 Resolver dudas sobre compras",
      "📦 Consultar pedidos",
      "",
      "¿En qué puedo ayudarte?"
    ].join("\n");

    appendMessage(body, welcome, "bot");

    if (quickActions) {
      quickActions.innerHTML = QUICK_ACTIONS
        .map((item) => `<button type="button" data-prompt="${escapeHtml(item.prompt)}">${escapeHtml(item.label)}</button>`)
        .join("");
    }

    async function sendMessage(text) {
      const cleaned = String(text || "").trim();
      if (!cleaned) return;

      appendMessage(body, cleaned, "user");
      pushHistory(history, { role: "user", text: cleaned });

      try {
        const answer = await askBot(cleaned, history);
        appendMessage(body, answer.reply || "No tengo una respuesta disponible.", "bot");
        pushHistory(history, {
          role: "bot",
          text: answer.reply || "",
          intent: answer.intent || null
        });
      } catch (err) {
        const fallback = "No tengo esa información en este momento, pero puedo ayudarte a buscar libros o guiarte en el proceso de compra.";
        appendMessage(body, fallback, "bot");
        pushHistory(history, { role: "bot", text: fallback });
      }
    }

    toggle.addEventListener("click", function () {
      const opened = panel.style.display === "flex";
      panel.style.display = opened ? "none" : "flex";
      if (!opened) {
        input.focus();
      }
    });

    document.addEventListener("click", function (event) {
      const isOpen = panel.style.display === "flex";
      if (!isOpen) return;

      const target = event.target;
      const clickedInsidePanel = panel.contains(target);
      const clickedToggle = toggle.contains(target);

      if (!clickedInsidePanel && !clickedToggle) {
        panel.style.display = "none";
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.style.display === "flex") {
        panel.style.display = "none";
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const text = String(input.value || "").trim();
      input.value = "";
      await sendMessage(text);
    });

    quickActions?.addEventListener("click", async function (event) {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;

      const prompt = target.dataset.prompt || "";
      input.value = "";
      await sendMessage(prompt);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
