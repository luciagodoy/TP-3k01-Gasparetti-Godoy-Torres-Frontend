// Cliente HTTP para la API del backend.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Se muestra cuando fetch ni siquiera llega a la API (backend caído, CORS mal
// configurado, sin internet). Antes este servicio devolvía datos de prueba en ese
// caso.
const NETWORK_ERROR_MESSAGE =
  'No pudimos conectarnos con el servidor. Verificá tu conexión e intentá de nuevo.';

// La API responde los errores como { error, message? }: `error` es un título
// corto y `message` lo explica. Se muestran los dos para que el usuario sepa qué
// corregir.
const errorMessageFrom = (body, status) =>
  [body.error, body.message].filter(Boolean).join(': ') || `HTTP Error: ${status}`;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // readBody decide cómo se lee una respuesta exitosa: JSON por defecto, o un Blob
  // para los endpoints que devuelven un archivo (el comprobante PDF).
  async _request(endpoint, options, readBody) {
    let response;
    try {
      response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: this.headers,
      });
    } catch (cause) {
      const error = new Error(NETWORK_ERROR_MESSAGE);
      error.isNetworkError = true;
      error.cause = cause;
      throw error;
    }
    return this._handleResponse(response, readBody);
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

  async getFile(endpoint) {
    return this._request(endpoint, { method: 'GET' }, (r) => r.blob());
  }

  async postFile(endpoint, data) {
    return this._request(endpoint, { method: 'POST', body: JSON.stringify(data) }, (r) => r.blob());
  }

  // Los errores llegan como JSON aunque se haya pedido un archivo: el backend sólo
  // manda el PDF cuando la operación salió bien.
  async _handleResponse(response, readBody = (r) => r.json()) {
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      // 401 = la sesión ya no es válida. 403 (sesión válida, rol no permitido) no debe
      // cerrar la sesión, sólo muestra el error.
      if (response.status === 401 && this._onUnauthorized) {
        this._onUnauthorized();
      }
      const error = new Error(errorMessageFrom(body, response.status));
      error.status = response.status;
      // Algunos errores traen un código para reconocerlos (p. ej. LATE_CHECK_OUT).
      if (body.code) error.code = body.code;
      // Los formularios traen un mensaje por campo inválido: { email: '...' }.
      if (body.fields) error.fields = body.fields;
      throw error;
    }
    if (response.status === 204) return null;
    return await readBody(response);
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

// Singleton: todos los servicios comparten la misma instancia (y por lo tanto el mismo token).
export default new ApiService();
