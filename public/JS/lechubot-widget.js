(() => {

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
  STORAGE_KEY: "lechubot_history"
};

const API_ENDPOINT = `${CONFIG.API_BASE.replace(/\/$/,"")}/chatbot/message`;

let controller = null;
let lastMessageTime = 0;

/* =========================
QUICK ACTIONS
========================= */

const QUICK_ACTIONS = [
 {label:"📚 Buscar libros",prompt:"Busco libros de fantasia"},
 {label:"⭐ Recomendaciones",prompt:"Recomiendame libros"},
 {label:"🛒 Como comprar",prompt:"Como comprar un libro"},
 {label:"📦 Consultar pedido",prompt:"Quiero consultar mi pedido"}
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
LechuBot | La Lechuza Lectora
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
   const id = Number(book.id || 0);

   html += `
    <div class="lechubot-book">
      <img src="${escapeHtml(imagen || "/Imagenes/The_Sisters_Brothers.png")}" alt="${escapeHtml(titulo)}" onerror="this.onerror=null;this.src='/Imagenes/The_Sisters_Brothers.png';">
      <div class="lechubot-book-card" data-id="${id}">
        <div class="lechubot-book-info">
          <div><b>📘 ${escapeHtml(titulo)}</b></div>
          <div>📚 ${escapeHtml(categoria)}</div>
          <div class="lechubot-book-price">💰 $${escapeHtml(precio)} MXN</div>
          <button class="lechubot-add" data-id="${id}">Agregar al carrito</button>
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

/* =========================
API
========================= */

async function askBot(message,history){

if(controller) controller.abort();

controller=new AbortController();

const token=localStorage.getItem("laLechuza_jwt_token");

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

const history = loadHistory();

const welcome=`Hola 👋
Soy Lechu, el asistente virtual de La Lechuza Lectora 🦉

Puedo ayudarte a:

📚 Buscar libros
📖 Recibir recomendaciones
🛒 Resolver dudas sobre compras
📦 Consultar pedidos

¿En qué puedo ayudarte?`;

if (history.length === 0) {
 appendMessage(body,welcome,"bot");
} else {
 history.forEach((entry) => {
  const role = entry && entry.role === "bot" ? "bot" : "user";
  const text = String(entry && entry.text ? entry.text : "").trim();
  if (!text) return;
  appendMessage(body, text, role);
 });
}

/* QUICK BUTTONS */

quick.innerHTML = QUICK_ACTIONS
.map(a=>`<button data-prompt="${escapeHtml(a.prompt)}">${escapeHtml(a.label)}</button>`)
.join("");

/* ENVIAR */

async function send(text){

if(!text || text.length>CONFIG.MESSAGE_LIMIT) return;
if(!canSend()) return;

appendMessage(body,text,"user");

pushHistory(history,{role:"user",text});

const typing=document.createElement("div");
typing.className="lechubot-msg bot typing";
typing.textContent="Lechu está escribiendo...";
body.appendChild(typing);

try{

const res=await askBot(text,history);

typing.remove();

const reply=res.reply || "No tengo una respuesta disponible.";

appendBotBooks(body, reply, res.books || []);

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

 if(history.length===0 && body.children.length<3){
  send("recomiendame libros");
 }
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

/* ESC */

document.addEventListener("keydown",e=>{

if(e.key==="Escape")
 panel.style.display="none";

});

body.addEventListener("click",(e)=>{

 const card=e.target.closest(".lechubot-book-card");

 if(card && !e.target.classList.contains("lechubot-add")){
  const id=card.dataset.id;
  if(id && id !== "0"){
   window.location.href="/html/Logeado/Catalogo_Logeado.html?producto="+encodeURIComponent(id);
  }
 }

 if(e.target.classList.contains("lechubot-add")){
  const id=e.target.dataset.id;

  let cart=[];
  try{
   cart=JSON.parse(localStorage.getItem("carrito"))||[];
  }catch{}

  const exists = cart.find((item) => String(item.id) === String(id));
  if (exists) {
    exists.qty = Number(exists.qty || 1) + 1;
  } else {
    cart.push({id,qty:1});
  }

  localStorage.setItem("carrito",JSON.stringify(cart));

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