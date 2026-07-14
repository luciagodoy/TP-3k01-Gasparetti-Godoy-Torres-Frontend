// Configuración del servicio API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Realiza una petición GET
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.headers,
      });
      return await this._handleResponse(response);
    } catch (error) {
      throw new Error(`Error en GET ${endpoint}: ${error.message}`);
    }
  }

  /**
   * Realiza una petición POST
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      return await this._handleResponse(response);
    } catch (error) {
      throw new Error(`Error en POST ${endpoint}: ${error.message}`);
    }
  }

  /**
   * Realiza una petición PUT
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      return await this._handleResponse(response);
    } catch (error) {
      throw new Error(`Error en PUT ${endpoint}: ${error.message}`);
    }
  }

  /**
   * Realiza una petición DELETE
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      return await this._handleResponse(response);
    } catch (error) {
      throw new Error(`Error en DELETE ${endpoint}: ${error.message}`);
    }
  }

  /**
   * Maneja la respuesta del servidor
   */
  async _handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Establece un token de autenticación
   */
  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Elimina el token de autenticación
   */
  clearAuthToken() {
    delete this.headers['Authorization'];
  }
}

export default new ApiService();
