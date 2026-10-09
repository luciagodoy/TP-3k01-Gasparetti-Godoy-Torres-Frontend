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

  // leerCuerpo decide cómo se lee una respuesta exitosa: JSON por defecto, o
  // Blob para los endpoints que devuelven un archivo (el comprobante en PDF).
  async _request(endpoint, options, leerCuerpo) {
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
    return this._handleResponse(response, leerCuerpo);
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

  async getArchivo(endpoint) {
    return this._request(endpoint, { method: 'GET' }, (r) => r.blob());
  }

  async postArchivo(endpoint, data) {
    return this._request(endpoint, { method: 'POST', body: JSON.stringify(data) }, (r) => r.blob());
  }

  // Los errores siguen llegando como JSON aunque se pida un archivo: el backend
  // sólo manda el PDF cuando la operación salió bien.
  async _handleResponse(response, leerCuerpo = (r) => r.json()) {
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
    return await leerCuerpo(response);
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
