// Configuración del servicio API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mensaje para cuando fetch ni siquiera llega a la API (backend caído, CORS mal
// configurado, sin internet). Antes de esto el servicio devolvía datos mock en
// ese caso, así que la app parecía funcionar y mostraba reservas inventadas:
// preferimos un error visible a una mentira silenciosa.
const ERROR_DE_RED =
  'No pudimos conectarnos con el servidor. Verificá tu conexión e intentá de nuevo.';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  async _request(endpoint, options) {
    let response;
    try {
      response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: this.headers,
      });
    } catch (causa) {
      const error = new Error(ERROR_DE_RED);
      error.esErrorDeRed = true;
      error.cause = causa;
      throw error;
    }
    return this._handleResponse(response);
  }

  async get(endpoint) {
    return this._request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this._request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  async put(endpoint, data) {
    return this._request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  }

  async delete(endpoint) {
    return this._request(endpoint, { method: 'DELETE' });
  }

  async _handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401 && this._onUnauthorized) {
        this._onUnauthorized();
      }
      const err = new Error(error.error || error.mensaje || `HTTP Error: ${response.status}`);
      err.status = response.status;
      throw err;
    }
    if (response.status === 204) return null;
    return await response.json();
  }

  onUnauthorized(callback) {
    this._onUnauthorized = callback;
  }

  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers['Authorization'];
  }
}

export default new ApiService();
