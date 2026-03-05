// ===============================
// FUNCION GLOBAL API
// ===============================
const API = async (endpoint, options = {}) => {

    const base = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "/api";

    const response = await fetch(`${base}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error API");
    }

    return data;
};

// ===============================
// CRUD PRODUCTOS
// ===============================

async function obtenerProductos() {
    return await API("/productos");
}

async function agregarProducto(producto) {
    return await API("/productos", {
        method: "POST",
        body: JSON.stringify(producto)
    });
}

async function actualizarProducto(id, producto) {
    return await API(`/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(producto)
    });
}

async function eliminarProducto(id) {
    return await API(`/productos/${id}`, {
        method: "DELETE"
    });
}

// ===============================
// CARGAR PRODUCTOS
// ===============================

async function cargarProductos() {
        const result = await API("/productos");
        const productos = Array.isArray(result) ? result : (result.data || []);
        if (typeof mostrar === "function") {
            mostrar(productos);
        }
}

// ===============================
// AGREGAR PRODUCTO (FORM)
// ===============================

const form = document.getElementById("formProducto");

if (form) {
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const producto = {
            nombre: document.getElementById("nombre").value,
            precio: document.getElementById("precio").value,
            imagen: document.getElementById("imagen").value
        };

        await agregarProducto(producto);

        alert("Producto agregado");
        cargarProductos();
        form.reset();
    });
}

// ===============================
// ELIMINAR
// ===============================

async function borrar(id) {
    await eliminarProducto(id);
    cargarProductos();
}

// ===============================
// EDITAR
// ===============================

async function editar(id) {

    const productoActualizado = {
        nombre: prompt("Nuevo nombre"),
        precio: prompt("Nuevo precio")
    };

    await actualizarProducto(id, productoActualizado);

    alert("Producto actualizado");
    cargarProductos();
}

// ===============================
// INIT
// ===============================
cargarProductos();