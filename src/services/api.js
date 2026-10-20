// HTTP client for the backend API.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Shown when fetch does not even reach the API (backend down, wrong CORS, no
// internet). This service used to return mock data in that case, so the app
// looked like it worked while showing made-up reservations: a visible error is
// better than a silent lie. The text is shown to the user, hence Spanish.
const NETWORK_ERROR_MESSAGE =
  'No pudimos conectarnos con el servidor. Verificá tu conexión e intentá de nuevo.';

// The API answers errors as { error, message? }: `error` is a short title and
// `message` explains it. Both are shown so the user knows what to fix.
const errorMessageFrom = (body, status) =>
  [body.error, body.message].filter(Boolean).join(': ') || `HTTP Error: ${status}`;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // readBody decides how a successful response is read: JSON by default, or a
  // Blob for the endpoints that return a file (the PDF receipt).
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

  // Errors still arrive as JSON even when a file was requested: the backend only
  // sends the PDF when the operation succeeded.
  async _handleResponse(response, readBody = (r) => r.json()) {
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      // 401 = the session is no longer valid. 403 (valid session, role not
      // allowed) must not log the user out, it only shows the error.
      if (response.status === 401 && this._onUnauthorized) {
        this._onUnauthorized();
      }
      const error = new Error(errorMessageFrom(body, response.status));
      error.status = response.status;
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

// Singleton: every service shares the same instance (and therefore the same token).
export default new ApiService();
