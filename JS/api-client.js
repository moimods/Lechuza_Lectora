<<<<<<< HEAD
/**
 * API CLIENT - Gestor centralizado de llamadas al backend
 * Este archivo centraliza todas las llamadas a la API para mantener el código limpio
 */

const APIClient = {
    // URL base de la API (ajusta según tu configuración)
    baseURL: 'http://localhost:3000/api',

    // --- MÉTODOS DE USUARIOS ---
    
    /**
     * Registrar un nuevo usuario
     * @param {Object} userData - {nombre, email, password, telefono}
     */
    async registerUser(userData) {
        return this.post('/registro', userData);
    },

    /**
     * Login de usuario
     * @param {string} email
     * @param {string} password
     */
    async loginUser(email, password) {
        return this.post('/login', { email, password });
    },

    // --- MÉTODOS DE PRODUCTOS ---

    /**
     * Obtener todos los productos
     * @param {boolean} disponibles - Si es true, solo trae productos con stock
     */
    async getProducts(disponibles = false) {
        return this.get(`/productos?disponibles=${disponibles}`);
    },

    /**
     * Obtener un producto específico
     * @param {number} productId
     */
    async getProduct(productId) {
        return this.get(`/productos/${productId}`);
    },

    /**
     * Crear un nuevo producto (requiere autenticación de admin)
     * @param {Object} productData
     */
    async createProduct(productData) {
        return this.post('/productos', productData);
    },

    /**
     * Eliminar un producto
     * @param {number} productId
     */
    async deleteProduct(productId) {
        return this.delete(`/productos/${productId}`);
    },

    // --- MÉTODOS DE VENTAS ---

    /**
     * Registrar una venta
     * @param {Object} saleData - {id_usuario, id_direccion, total, productos}
     */
    async registerSale(saleData) {
        return this.post('/ventas/registrar', saleData);
    },

    /**
     * Obtener reportes de ventas mensuales
     */
    async getMonthlySalesReport() {
        return this.get('/reportes/ventas-mensuales');
    },

    // --- MÉTODOS HTTP PRIVADOS ---

    /**
     * Método GET privado
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    },

    /**
     * Método POST privado
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    },

    /**
     * Método DELETE privado
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    }
};
=======
// API client code

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
    }

    async post(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
    }
}

// Usage Example:
// const apiClient = new ApiClient('https://api.example.com');
// apiClient.get('/data').then(data => console.log(data));
>>>>>>> 8f85dd1101edd13231a5807a1fe6243e7f21665d
