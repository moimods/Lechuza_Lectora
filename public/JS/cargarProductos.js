let currentPage = 1;
const LIMIT = 12;

async function cargarProductos(page = 1) {

    try {

        const res = await fetch(
            `/api/productos?page=${page}&limit=${LIMIT}`,
            { credentials: "include" }
        );

        const result = await res.json();

        pintarProductos(result.data);
        renderPagination(result.pagination);

        currentPage = page;

    } catch (error) {
        console.error(error);
    }
}