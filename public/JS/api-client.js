/**
 * API CLIENT - La Lechuza Lectora
 * Gestor centralizado de llamadas al backend
 */

const APIClient = {
    // URL base de la API
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
     */
    async createProduct(productData) {
        return this.post('/productos', productData);
    },

    /**
     * Eliminar un producto
     */
    async deleteProduct(productId) {
        return this.delete(`/productos/${productId}`);
    },

    // --- MÉTODOS DE VENTAS ---

    /**
     * Registrar una venta
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

    // --- MÉTODOS HTTP PRIVADOS (Lógica base) ---

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return await this._handleResponse(response);
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await this._handleResponse(response);
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            return await this._handleResponse(response);
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    },

    /**
     * Procesa la respuesta del servidor
     */
    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
};