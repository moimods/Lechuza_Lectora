(() => {

const currentPath = String(window.location.pathname || "").toLowerCase();
if (currentPath.includes("/html/admin/")) return;

if (window.__LECHUBOT_LOADED__) return;
window.__LECHUBOT_LOADED__ = true;

/* =========================
CONFIG
========================= */

const CONFIG = {
  API_BASE: (window.APP_CONFIG?.API_BASE) || "/api",
  MAX_HISTORY: 10,
  MESSAGE_LIMIT: 300,
  RATE_LIMIT: 700,
  STORAGE_KEY: "lechubot_history",
  QA_STORAGE_KEY: "lechubot_qa_mode"
};

const API_ENDPOINT = `${CONFIG.API_BASE.replace(/\/$/,"")}/chatbot/message`;
const API_ROOT = CONFIG.API_BASE.replace(/\/$/,"");

function getPaths(){
 const isLoggedView = window.location.pathname.includes("/html/Logeado/");
 return {
  CATALOGO: isLoggedView ? "/html/Logeado/Catalogo_Logeado.html" : "/html/Catalogo.html",
  CARRITO: "/html/Logeado/carrito.html",
  PEDIDOS: "/html/Logeado/Mis_pedidos.html",
  LOGIN: "/html/Inicio_de_sesion/Inicio_sesion.html"
 };
}

const PATHS = getPaths();

let controller = null;
let lastMessageTime = 0;

/* =========================
QUICK ACTIONS
========================= */

const QUICK_ACTIONS = [
 {label:"📚 Buscar libros",prompt:"buscar libros"},
 {label:"⭐ Recomendaciones",prompt:"recomiendame libros"},
 {label:"🛒 Como comprar",prompt:"como comprar"},
 {label:"📦 Consultar pedido",prompt:"consultar pedido"}
];

/* =========================
UTILIDADES
========================= */

const escapeHtml = str =>
 String(str ?? "")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");

const formatText = text =>
 escapeHtml(text).replace(/\n/g,"<br>");

const now = () =>
 new Date().toLocaleTimeString([],{
  hour:"2-digit",
  minute:"2-digit"
 });

function isQaMode(){
 const params = new URLSearchParams(window.location.search);
 const queryValue = params.get("lechubotQA");
 if(queryValue === "1") return true;
 if(queryValue === "0") return false;
 return localStorage.getItem(CONFIG.QA_STORAGE_KEY) === "1";
}

function setQaMode(enabled){
 localStorage.setItem(CONFIG.QA_STORAGE_KEY, enabled ? "1" : "0");
}

function qaLog(message, payload){
 if(!isQaMode()) return;
 if(typeof payload === "undefined"){
  console.info("[LechuBot QA]", message);
  return;
 }
 console.info("[LechuBot QA]", message, payload);
}

function getToken(){
 return localStorage.getItem("laLechuza_jwt_token");
}

async function apiGet(path){
 const token = getToken();
 const response = await fetch(`${API_ROOT}${path}`, {
  method: "GET",
  headers: {
   ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
 });

 const data = await response.json().catch(() => ({}));
 if(!response.ok) throw new Error(data.error || "Error consultando API");
 return data.data ?? data;
}

function normalizeBook(book){
 const id = Number(book.id ?? book.id_producto ?? 0);
 const title = String(book.titulo ?? book.title ?? "Sin titulo");
 const categoria = String(book.categoria ?? book.genero ?? "General");
 const precio = Number(book.precio ?? book.price ?? 0);
 const imagen = String(book.imagen ?? book.imagen_url ?? "/Imagenes/The_Sisters_Brothers.png");
 const stock = Number(book.stock ?? book.existencias ?? book.cantidad_disponible ?? book.cantidad ?? 0);

 return {
  id,
  titulo: title,
  categoria,
  precio,
  imagen: imagen.startsWith("/") ? imagen : `/${imagen}`,
  stock: Number.isFinite(stock) ? Math.max(0, stock) : 0
 };
}

function syncCartBadge(cart){
 const total = Array.isArray(cart)
  ? cart.reduce((acc, item) => acc + Number(item?.quantity ?? item?.qty ?? item?.cantidad ?? 0), 0)
  : 0;

 const badgeA = document.getElementById("cart-count");
 const badgeB = document.getElementById("cartCount");

 if (badgeA) badgeA.textContent = String(total);
 if (badgeB) badgeB.textContent = String(total);
}

function readCart(){
 let current = [];
 try{
  current = JSON.parse(localStorage.getItem("laLechuzaLectoraCart")) || [];
 }catch{}
 if(Array.isArray(current) && current.length) return current;

 try{
  const legacy = JSON.parse(localStorage.getItem("carrito")) || [];
  if(Array.isArray(legacy) && legacy.length){
   return legacy.map((item) => ({
    id: Number(item.id ?? item.id_producto ?? 0),
    title: String(item.title ?? item.titulo ?? "Libro"),
    price: Number(item.price ?? item.precio ?? 0),
    quantity: Number(item.quantity ?? item.qty ?? item.cantidad ?? 1),
    image: String(item.image ?? item.imagen ?? item.imagen_url ?? "/Imagenes/The_Sisters_Brothers.png")
   }));
  }
 }catch{}

 return [];
}

function saveCart(cart){
 localStorage.setItem("laLechuzaLectoraCart", JSON.stringify(cart));
 const legacy = cart.map((item) => ({
  id_producto: item.id,
  titulo: item.title,
  precio: item.price,
  cantidad: item.quantity,
  imagen_url: item.image
 }));
 localStorage.setItem("carrito", JSON.stringify(legacy));
}

function addBookToCart(book){
 const cart = readCart();
 const maxStock = Number(book.stock ?? 0);
 const found = cart.find((item) => Number(item.id) === Number(book.id));

 if(found){
  if (maxStock > 0 && Number(found.quantity || 0) >= maxStock) {
   return { added: false, reason: "stock_limit", cart, stock: maxStock, quantity: Number(found.quantity || 0) };
  }
  found.quantity = Number(found.quantity || 0) + 1;
 } else {
  if (maxStock === 0) {
   return { added: false, reason: "stock_empty", cart, stock: 0, quantity: 0 };
  }
  cart.push({
   id: Number(book.id || 0),
   title: String(book.titulo || "Libro"),
   price: Number(book.precio || 0),
   quantity: 1,
   image: String(book.imagen || "/Imagenes/The_Sisters_Brothers.png"),
   stock: maxStock > 0 ? maxStock : null
  });
 }
 saveCart(cart);
 syncCartBadge(cart);
 return {
  added: true,
  cart,
  stock: maxStock,
  quantity: Number((cart.find((item) => Number(item.id) === Number(book.id)) || {}).quantity || 0)
 };
}

const normalizeText = (value) =>
 String(value || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ")
  .trim();

/* =========================
STORAGE
========================= */

function loadHistory(){

 try{
  return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
 }
 catch{
  return [];
 }

}

function saveHistory(history){

 localStorage.setItem(
  CONFIG.STORAGE_KEY,
  JSON.stringify(history)
 );

}

/* =========================
HISTORIAL
========================= */

function pushHistory(history,entry){

 history.push(entry);

 if(history.length > CONFIG.MAX_HISTORY)
  history.shift();

 saveHistory(history);

}

/* =========================
RATE LIMIT
========================= */

function canSend(){

 const nowTime = Date.now();

 if(nowTime - lastMessageTime < CONFIG.RATE_LIMIT)
  return false;

 lastMessageTime = nowTime;
 return true;

}

/* =========================
WIDGET
========================= */

function buildWidget(){

const style = document.createElement("style");

style.textContent = `

.lechubot-toggle{
position:fixed;
right:18px;
bottom:18px;
z-index:10000;
width:60px;
height:60px;
border-radius:50%;
border:none;
background:#5d4037;
color:#fff;
font-size:26px;
cursor:pointer;
box-shadow:0 10px 30px rgba(0,0,0,.3);
}

.lechubot-panel{
position:fixed;
right:18px;
bottom:90px;
width:360px;
height:520px;
background:#fff;
border-radius:14px;
display:none;
flex-direction:column;
overflow:hidden;
box-shadow:0 20px 40px rgba(0,0,0,.25);
z-index:10000;
}

.lechubot-header{
background:linear-gradient(135deg,#5d4037,#7a5648);
color:white;
padding:14px;
font-weight:bold;
font-family:Georgia;
text-align:center;
}

.lechubot-body{
flex:1;
overflow-y:auto;
padding:12px;
background:#faf7f3;
font-family:Roboto,Arial;
}

.lechubot-msg{
margin-bottom:10px;
padding:10px;
border-radius:10px;
font-size:14px;
max-width:90%;
}

.lechubot-msg.user{
margin-left:auto;
background:#ece0db;
}

.lechubot-msg.bot{
background:#fff;
border:1px solid #e4d6cf;
}

.lechubot-books{
display:flex;
flex-direction:column;
gap:10px;
margin-top:10px;
}

.lechubot-book{
display:flex;
gap:10px;
background:#fff;
border-radius:8px;
padding:8px;
border:1px solid #e0d6cf;
}

.lechubot-book-card{
cursor:pointer;
display:flex;
flex-direction:column;
gap:6px;
flex:1;
}

.lechubot-book img{
width:70px;
height:100px;
object-fit:cover;
border-radius:4px;
background:#f5f5f5;
margin-bottom:0;
}

.lechubot-book-card img{
transition:transform .2s;
}

.lechubot-book-card:hover img{
transform:scale(1.05);
}

.lechubot-book-title{
font-weight:700;
color:#5d4037;
margin-bottom:4px;
}

.lechubot-book-price{
font-weight:bold;
color:#2e7d32;
}

.lechubot-book-info{
font-size:13px;
display:flex;
flex-direction:column;
gap:3px;
}

.lechubot-add{
margin-top:4px;
border:none;
background:#5d4037;
color:white;
padding:4px 8px;
border-radius:6px;
cursor:pointer;
font-size:12px;
}

.lechubot-add:hover{
background:#4e342e;
}

.lechubot-book-meta{
color:#6d4c41;
line-height:1.3;
}

.lechubot-time{
font-size:10px;
opacity:.6;
margin-top:3px;
}

.lechubot-input{
display:flex;
border-top:1px solid #ddd;
}

.lechubot-input input{
flex:1;
border:0;
padding:12px;
font-size:14px;
outline:none;
}

.lechubot-input button{
border:0;
background:#5d4037;
color:white;
padding:0 16px;
font-weight:bold;
cursor:pointer;
}

.lechubot-quick{
display:flex;
flex-wrap:wrap;
gap:6px;
padding:8px;
border-top:1px solid #eee;
background:#faf7f3;
}

.lechubot-quick button{
border:1px solid #ddd;
background:white;
border-radius:20px;
padding:6px 10px;
font-size:12px;
cursor:pointer;
}

.typing{
opacity:.7;
font-style:italic;
}

@media(max-width:560px){

.lechubot-panel{
right:8px;
left:8px;
width:auto;
}

}

`;

const toggle = document.createElement("button");
toggle.className="lechubot-toggle";
toggle.textContent="🦉";

const panel = document.createElement("div");
panel.className="lechubot-panel";

panel.innerHTML=`
<header class="lechubot-header">
LechuBot
</header>

<div id="lechubot-body" class="lechubot-body"></div>

<div id="lechubot-quick" class="lechubot-quick"></div>

<form id="lechubot-form" class="lechubot-input">
<input id="lechubot-input" placeholder="Escribe tu mensaje..." autocomplete="off">
<button>Enviar</button>
</form>
`;

document.head.appendChild(style);
document.body.append(toggle,panel);

return {toggle,panel};

}

/* =========================
MENSAJES
========================= */

function appendMessage(container,text,role){

const msg = document.createElement("div");
msg.className=`lechubot-msg ${role}`;
msg.innerHTML=formatText(text);

const time=document.createElement("div");
time.className="lechubot-time";
time.textContent=now();

msg.appendChild(time);
container.appendChild(msg);

container.scrollTo({
 top:container.scrollHeight,
 behavior:"smooth"
});

}

function appendBotBooks(body, text, books = []) {

 const msg = document.createElement("div");
 msg.className = "lechubot-msg bot";

 let html = `<div>${formatText(text)}</div>`;

 if (Array.isArray(books) && books.length) {
  html += `<div class="lechubot-books">`;

  books.forEach((book) => {
   const imagen = String(book.imagen || "").trim();
   const titulo = String(book.titulo || "Sin titulo");
   const categoria = String(book.categoria || "Sin categoria");
   const precio = Number(book.precio || 0).toFixed(2);
  const stock = Number(book.stock || 0);
   const id = Number(book.id || 0);

   html += `
    <div class="lechubot-book">
      <img src="${escapeHtml(imagen || "/Imagenes/The_Sisters_Brothers.png")}" alt="${escapeHtml(titulo)}" onerror="this.onerror=null;this.src='/Imagenes/The_Sisters_Brothers.png';">
      <div class="lechubot-book-card" data-id="${id}">
        <div class="lechubot-book-info">
          <div><b>📘 ${escapeHtml(titulo)}</b></div>
          <div>📚 ${escapeHtml(categoria)}</div>
          <div class="lechubot-book-price">💰 $${escapeHtml(precio)} MXN</div>
          <div class="lechubot-book-meta">📦 Existencias: <b>${stock}</b></div>
          <button class="lechubot-add" data-id="${id}" data-title="${escapeHtml(titulo)}" data-price="${escapeHtml(precio)}" data-stock="${stock}" data-image="${escapeHtml(imagen || "/Imagenes/The_Sisters_Brothers.png")}">Agregar al carrito</button>
        </div>
      </div>
    </div>
   `;
  });

  html += `</div>`;
 }

 msg.innerHTML = html;

 const time = document.createElement("div");
 time.className = "lechubot-time";
 time.textContent = now();

 msg.appendChild(time);
 body.appendChild(msg);

 body.scrollTo({
  top: body.scrollHeight,
  behavior: "smooth"
 });
}

const LOCAL_RESPONSES = {
 "menu": `
🦉 Puedo ayudarte con:

📚 Buscar libros
⭐ Recomendaciones
🛒 Como comprar
📦 Consultar pedido
`,

 "menu principal": `
🦉 Puedo ayudarte con:

📚 Buscar libros
⭐ Recomendaciones
🛒 Como comprar
📦 Consultar pedido
`,

 "como comprar": `
🛒 Comprar en La Lechuza Lectora es muy facil:

1️⃣ Busca un libro en el catalogo
2️⃣ Presiona "Agregar al carrito"
3️⃣ Ve al carrito
4️⃣ Completa tu domicilio
5️⃣ Finaliza tu compra
`,

 "consultar pedido": `
📦 Para consultar tu pedido:

1️⃣ Ve a tu perfil
2️⃣ Entra a "Mis pedidos"
`
};

const INTENT_PATTERNS = {
 menu: /(menu|menu principal|ayuda|opciones|que puedes hacer)/,
 comprar: /(como comprar|comprar|proceso de compra|checkout)/,
 pedidos: /(consultar pedido|pedido|pedidos|mis pedidos|orden)/,
 recomendaciones: /(recomienda|recomendacion|recomendaciones|sugerencia)/,
 fantasia: /(fantasia|fantasy)/,
 carrito: /(carrito|mi carrito)/,
 buscar: /(buscar libros|buscar|libros de)/
};

function detectIntent(normalized){
 const keys = Object.keys(INTENT_PATTERNS);
 for(const key of keys){
  if(INTENT_PATTERNS[key].test(normalized)) return key;
 }
 return null;
}

async function handleLocalEcommerceIntent(text, body, history, typing){
 const normalized = normalizeText(text);
 const isAuthenticated = Boolean(getToken());

 if(LOCAL_RESPONSES[normalized]){
  typing.remove();
  const reply = LOCAL_RESPONSES[normalized];
  appendMessage(body, reply, "bot");
  pushHistory(history,{ role:"bot", text:reply, intent:"faq" });
  return true;
 }

 const intent = detectIntent(normalized);

 if(intent === "menu"){
  typing.remove();
  const reply = LOCAL_RESPONSES["menu"];
  appendMessage(body, reply, "bot");
  pushHistory(history,{ role:"bot", text:reply, intent:"menu" });
  return true;
 }

 if(intent === "comprar"){
  typing.remove();
  const reply = LOCAL_RESPONSES["como comprar"];
  appendMessage(body, reply, "bot");
  pushHistory(history,{ role:"bot", text:reply, intent:"faq_compra" });
  return true;
 }

 if(intent === "pedidos"){
  typing.remove();
  if(!isAuthenticated){
   const reply = "Para consultar pedidos, primero inicia sesion.";
   appendMessage(body, reply, "bot");
   pushHistory(history,{ role:"bot", text:reply, intent:"pedido_login" });
   return true;
  }
  try {
   const ventas = await apiGet("/ventas/usuario?page=1&limit=1");
   const last = Array.isArray(ventas) ? ventas[0] : null;
   if(last){
    const reply = `📦 Tu ultimo pedido es #LL-${last.id_venta} con estado "${last.estado}" y total $${Number(last.total || 0).toFixed(2)} MXN.`;
    appendMessage(body, reply, "bot");
    pushHistory(history,{ role:"bot", text:reply, intent:"pedido_resumen" });
   } else {
    const reply = "Aun no encuentro pedidos registrados en tu cuenta.";
    appendMessage(body, reply, "bot");
    pushHistory(history,{ role:"bot", text:reply, intent:"pedido_vacio" });
   }
  } catch {
   const reply = LOCAL_RESPONSES["consultar pedido"];
   appendMessage(body, reply, "bot");
   pushHistory(history,{ role:"bot", text:reply, intent:"faq_pedido" });
  }
  return true;
 }

 if(intent === "carrito"){
  typing.remove();
  if(!isAuthenticated){
   const reply = `Para gestionar tu carrito, inicia sesion.\n👉 ${PATHS.LOGIN}`;
   appendMessage(body, reply, "bot");
   pushHistory(history,{ role:"bot", text:reply, intent:"carrito_login" });
   return true;
  }
  const cart = readCart();
  const count = Array.isArray(cart)
   ? cart.reduce((acc, item) => acc + Number(item?.quantity ?? item?.qty ?? item?.cantidad ?? 1), 0)
   : 0;
  const reply = count
   ? `🛒 Tienes ${count} productos en tu carrito.\n👉 ${PATHS.CARRITO}`
   : "Tu carrito esta vacio";
  appendMessage(body, reply, "bot");
  pushHistory(history,{ role:"bot", text:reply, intent:"carrito" });
  return true;
 }

 if(intent === "recomendaciones"){
  typing.remove();
  try {
   const productsData = await apiGet("/productos?page=1&limit=6");
   const products = Array.isArray(productsData?.data) ? productsData.data : (Array.isArray(productsData) ? productsData : []);
   const books = products.slice(0, 3).map(normalizeBook);
   if(books.length){
    appendBotBooks(body, "📚 Te recomiendo estos libros populares:", books);
    pushHistory(history,{ role:"bot", text:"Recomendaciones", intent:"recomendaciones" });
    return true;
   }
  } catch {}

  appendBotBooks(body,"📚 Te recomiendo estos libros populares:",[
    { id:1, titulo:"El Hobbit", categoria:"Fantasia", precio:299, imagen:"/Imagenes/The_Sisters_Brothers.png", stock: 9 },
    { id:2, titulo:"El Instituto", categoria:"Suspenso", precio:320, imagen:"/Imagenes/perfume.png", stock: 6 }
  ]);
  pushHistory(history,{ role:"bot", text:"Recomendaciones", intent:"recomendaciones" });
  return true;
 }

 if(intent === "fantasia"){
  typing.remove();
  try {
   const productsData = await apiGet("/productos?page=1&limit=20");
   const products = Array.isArray(productsData?.data) ? productsData.data : (Array.isArray(productsData) ? productsData : []);
   const fantasy = products
    .filter((p) => normalizeText(`${p.categoria || ""} ${p.genero || ""}`).includes("fantasia"))
    .slice(0, 4)
    .map(normalizeBook);
   if(fantasy.length){
    appendBotBooks(body,"📚 Libros de fantasia:", fantasy);
    pushHistory(history,{ role:"bot", text:"Libros de fantasia", intent:"catalogo_fantasia" });
    return true;
   }
  } catch {}

  appendBotBooks(body,"📚 Libros de fantasia:",[
    { id:3, titulo:"Juego de Tronos", categoria:"Fantasia", precio:350, imagen:"/Imagenes/The_Sisters_Brothers.png", stock: 4 }
  ]);
  pushHistory(history,{ role:"bot", text:"Libros de fantasia", intent:"catalogo_fantasia" });
  return true;
 }

 if(intent === "buscar"){
  typing.remove();
  const searchTerm = normalized
   .replace("buscar libros", "")
   .replace("buscar", "")
   .replace("libros de", "")
   .trim();

  try {
   const productsData = await apiGet("/productos?page=1&limit=24");
   const products = Array.isArray(productsData?.data) ? productsData.data : (Array.isArray(productsData) ? productsData : []);
   const filtered = products
    .filter((p) => {
     if(!searchTerm) return true;
     const haystack = normalizeText(`${p.titulo || ""} ${p.autor || ""} ${p.categoria || ""} ${p.genero || ""}`);
     return haystack.includes(searchTerm);
    })
    .slice(0, 4)
    .map(normalizeBook);

   if(filtered.length){
    appendBotBooks(body, `📚 Resultados ${searchTerm ? `para "${searchTerm}"` : "de libros"}:`, filtered);
    pushHistory(history,{ role:"bot", text:"Resultados de busqueda", intent:"busqueda" });
   } else {
    const reply = `No encontre resultados para "${searchTerm}". Intenta con otro termino.\n👉 ${PATHS.CATALOGO}`;
    appendMessage(body, reply, "bot");
    pushHistory(history,{ role:"bot", text:reply, intent:"busqueda_vacia" });
   }
   return true;
  } catch {
   const reply = `No pude consultar el catalogo en este momento.\n👉 ${PATHS.CATALOGO}`;
   appendMessage(body, reply, "bot");
   pushHistory(history,{ role:"bot", text:reply, intent:"busqueda_error" });
   return true;
  }
 }

 return false;
}

/* =========================
API
========================= */

async function askBot(message,history){

if(controller) controller.abort();

controller=new AbortController();

const token=getToken();

qaLog("API request", {
 endpoint: API_ENDPOINT,
 hasToken: Boolean(token),
 historySize: Array.isArray(history) ? history.length : 0
});

const response = await fetch(API_ENDPOINT,{
 method:"POST",
 signal:controller.signal,
 headers:{
  "Content-Type":"application/json",
  ...(token?{Authorization:`Bearer ${token}`}:{})
 },
 body:JSON.stringify({message,history})
});

const data=await response.json().catch(()=>({}));

qaLog("API response", {
 status: response.status,
 ok: response.ok,
 intent: data?.data?.intent ?? data?.intent ?? null
});

if(!response.ok)
 throw new Error(data.error || "Error del servidor");

return data.data || data;

}

/* =========================
INIT
========================= */

function init(){

const {toggle,panel}=buildWidget();

const body = panel.querySelector("#lechubot-body");
const form = panel.querySelector("#lechubot-form");
const input = panel.querySelector("#lechubot-input");
const quick = panel.querySelector("#lechubot-quick");

const history = [];
saveHistory(history);

  if(isQaMode()){
   appendMessage(body, "[QA] Modo depuracion activo. Usa /qa off para desactivarlo.", "bot");
  }

/* QUICK BUTTONS */

quick.innerHTML = QUICK_ACTIONS
.map(a=>`<button data-prompt="${escapeHtml(a.prompt)}">${escapeHtml(a.label)}</button>`)
.join("");

/* ENVIAR */

async function send(text){

if(!text || text.length>CONFIG.MESSAGE_LIMIT) return;

const qaCommand = String(text).trim().toLowerCase();
if(qaCommand === "/qa on" || qaCommand === "/qa off" || qaCommand === "/qa status"){
 appendMessage(body,text,"user");

 if(qaCommand === "/qa on"){
  setQaMode(true);
  appendMessage(body,"[QA] Activado.","bot");
 } else if(qaCommand === "/qa off"){
  setQaMode(false);
  appendMessage(body,"[QA] Desactivado.","bot");
 } else {
  appendMessage(body, isQaMode() ? "[QA] Estado: activo." : "[QA] Estado: inactivo.", "bot");
 }
 return;
}

if(!canSend()) return;

appendMessage(body,text,"user");

pushHistory(history,{role:"user",text});

const typing=document.createElement("div");
typing.className="lechubot-msg bot typing";
typing.textContent="Lechu está escribiendo...";
body.appendChild(typing);

try{

const normalizedForQa = normalizeText(text);
const predictedIntent = LOCAL_RESPONSES[normalizedForQa]
 ? "faq"
 : (detectIntent(normalizedForQa) || "none");

qaLog("Message received", {
 rawText: text,
 normalizedText: normalizedForQa,
 predictedIntent
});

const handledLocally = await handleLocalEcommerceIntent(text, body, history, typing);
if(handledLocally){
 qaLog("Resolved locally", { predictedIntent });
 if(isQaMode()){
  appendMessage(body, `[QA] Intent: ${predictedIntent} | Fuente: local`, "bot");
 }
 return;
}

qaLog("Fallback to API", { endpoint: API_ENDPOINT });

const res=await askBot(text,history);

typing.remove();

const reply=res.reply || "No tengo una respuesta disponible.";

appendBotBooks(body, reply, res.books || []);

if(isQaMode()){
 const apiIntent = res.intent ?? "none";
 appendMessage(body, `[QA] Intent: ${apiIntent} | Fuente: API`, "bot");
}

pushHistory(history,{
 role:"bot",
 text:reply,
 intent:res.intent ?? null
});

}
catch{

typing.remove();

const fallback="No pude procesar tu solicitud.";

appendMessage(body,fallback,"bot");

pushHistory(history,{role:"bot",text:fallback});

}

}

/* EVENTOS */

toggle.onclick=()=>{

panel.style.display=
 panel.style.display==="flex"
  ?"none"
  :"flex";

if(panel.style.display==="flex"){
 input.focus();
}

};

form.onsubmit=e=>{

e.preventDefault();

const text=input.value.trim();
input.value="";

send(text);

};

quick.onclick=e=>{

if(!(e.target instanceof HTMLButtonElement))
 return;

send(e.target.dataset.prompt);

};

/* CERRAR CLICK FUERA */

document.addEventListener("click",e=>{

if(!panel.contains(e.target) && !toggle.contains(e.target))
 panel.style.display="none";

});


document.addEventListener("keydown",e=>{

if(e.key==="Escape")
 panel.style.display="none";

});

body.addEventListener("click",(e)=>{

 const card=e.target.closest(".lechubot-book-card");

 if(card && !e.target.classList.contains("lechubot-add")){
  const id=card.dataset.id;
  if(id && id !== "0"){
   window.location.href=PATHS.CATALOGO+"?producto="+encodeURIComponent(id);
  }
 }

 if(e.target.classList.contains("lechubot-add")){
  if(!getToken()){
   appendMessage(body, "Para agregar productos al carrito primero inicia sesion.", "bot");
   return;
  }

  const id = Number(e.target.dataset.id || 0);
  const title = String(e.target.dataset.title || "Libro");
  const price = Number(e.target.dataset.price || 0);
  const stock = Number(e.target.dataset.stock || 0);
  const image = String(e.target.dataset.image || "/Imagenes/The_Sisters_Brothers.png");

  const addResult = addBookToCart({
   id,
   titulo: title,
   precio: price,
   imagen: image,
   stock
  });

  if(!addResult?.added){
   const stockMsg = addResult?.reason === "stock_empty"
    ? `No hay existencias disponibles de "${title}" en este momento.`
    : `Ya alcanzaste el maximo disponible de "${title}" (${addResult?.stock || 0} en existencia).`;
   appendMessage(body, stockMsg, "bot");
   return;
  }

  appendMessage(body, `✔ "${title}" agregado. Cantidad en carrito: ${addResult.quantity}.`, "bot");

  e.target.textContent="✔ Agregado";
  setTimeout(()=>{
   e.target.textContent="Agregar al carrito";
  },1500);
 }

});

}

/* START */

document.readyState==="loading"
?document.addEventListener("DOMContentLoaded",init)
:init();

})();