// Configuración del servicio API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const STORAGE_KEY = 'hotel-mock-data';

const defaultMockData = {
  reservas: [
    {
      id: 1,
      habitacionId: 101,
      huespedId: 1,
      fechaInicio: '2026-08-01',
      fechaFin: '2026-08-03',
      montoTotal: 350000,
      estado: 'check-in',
      habitacion: { id: 101, numero: 101, estadoDisponibilidad: 'ocupada', categoria: { denominacion: 'Standard' } },
      huesped: { id: 1, usuario: { username: 'lucia' } },
    },
  ],
  habitaciones: [
    {
      id: 101,
      numero: 101,
      piso: 1,
      estadoDisponibilidad: 'ocupada',
      categoriaId: 1,
      categoria: { id: 1, denominacion: 'Standard', capacidadPersonas: 2 },
    },
    {
      id: 102,
      numero: 102,
      piso: 1,
      estadoDisponibilidad: 'disponible',
      categoriaId: 2,
      categoria: { id: 2, denominacion: 'Doble', capacidadPersonas: 4 },
    },
  ],
  categorias: [
    { id: 1, denominacion: 'Standard', descripcion: 'Habitación básica', capacidadPersonas: 2 },
    { id: 2, denominacion: 'Doble', descripcion: 'Habitación para parejas o familiares', capacidadPersonas: 4 },
  ],
  huespedes: [
    {
      id: 1,
      telefono: '1122334455',
      documentoIdentidad: '12345678',
      ciudad: 'Córdoba',
      provincia: 'Córdoba',
      pais: 'Argentina',
      usuario: { username: 'lucia', email: 'lucia@example.com' },
    },
  ],
};

const loadMockData = () => {
  if (typeof window === 'undefined') return defaultMockData;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultMockData;
  } catch {
    return defaultMockData;
  }
};

const saveMockData = (data) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.mockData = loadMockData();
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.headers,
      });
      return await this._handleResponse(response);
    } catch (error) {
      return this._mockResponse(endpoint, 'GET');
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      return await this._handleResponse(response);
    } catch (error) {
      return this._mockResponse(endpoint, 'POST', data);
    }
  }

  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      return await this._handleResponse(response);
    } catch (error) {
      return this._mockResponse(endpoint, 'PUT', data);
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      return await this._handleResponse(response);
    } catch (error) {
      return this._mockResponse(endpoint, 'DELETE');
    }
  }

  async _handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }
    return await response.json();
  }

  _mockResponse(endpoint, method, data = null) {
    const normalizedEndpoint = endpoint.replace(/\/+$/, '');
    const segments = normalizedEndpoint.split('/').filter(Boolean);

    if (segments[0] === 'reservas') {
      return this._handleMockReservas(segments, method, data);
    }

    if (segments[0] === 'habitaciones') {
      return this._handleMockHabitaciones(segments, method, data);
    }

    if (segments[0] === 'categorias') {
      return this._handleMockCategorias(segments, method, data);
    }

    if (segments[0] === 'huespedes') {
      return this._handleMockHuespedes(segments, method, data);
    }

    return [];
  }

  _handleMockReservas(segments, method, data) {
    const id = Number(segments[1]);
    if (method === 'GET') {
      if (segments.length === 1) return this.mockData.reservas;
      const reserva = this.mockData.reservas.find((item) => item.id === id);
      return reserva || null;
    }

    if (method === 'POST') {
      const nueva = {
        id: Date.now(),
        ...data,
        estado: 'pendiente',
        habitacion: this.mockData.habitaciones.find((h) => h.id === data.habitacionId) || null,
        huesped: this.mockData.huespedes.find((h) => h.id === data.huespedId) || null,
      };
      this.mockData.reservas.unshift(nueva);
      saveMockData(this.mockData);
      return nueva;
    }

    if (method === 'DELETE') {
      this.mockData.reservas = this.mockData.reservas.filter((item) => item.id !== id);
      saveMockData(this.mockData);
      return { ok: true };
    }

    return this.mockData.reservas;
  }

  _handleMockHabitaciones(segments, method, data) {
    const id = Number(segments[1]);
    if (method === 'GET') {
      if (segments.length === 1) return this.mockData.habitaciones;
      const habitacion = this.mockData.habitaciones.find((item) => item.id === id);
      return habitacion || null;
    }

    if (method === 'POST') {
      const nueva = {
        id: Date.now(),
        ...data,
        categoria: this.mockData.categorias.find((c) => c.id === data.categoriaId) || null,
      };
      this.mockData.habitaciones.unshift(nueva);
      saveMockData(this.mockData);
      return nueva;
    }

    if (method === 'PUT') {
      this.mockData.habitaciones = this.mockData.habitaciones.map((item) =>
        item.id === id ? { ...item, ...data, categoria: this.mockData.categorias.find((c) => c.id === data.categoriaId) || item.categoria } : item
      );
      saveMockData(this.mockData);
      return this.mockData.habitaciones.find((item) => item.id === id);
    }

    if (method === 'DELETE') {
      this.mockData.habitaciones = this.mockData.habitaciones.filter((item) => item.id !== id);
      saveMockData(this.mockData);
      return { ok: true };
    }

    return this.mockData.habitaciones;
  }

  _handleMockCategorias(segments, method, data) {
    const id = Number(segments[1]);
    if (method === 'GET') {
      if (segments.length === 1) return this.mockData.categorias;
      const categoria = this.mockData.categorias.find((item) => item.id === id);
      return categoria || null;
    }

    if (method === 'POST') {
      const nueva = { id: Date.now(), ...data };
      this.mockData.categorias.unshift(nueva);
      saveMockData(this.mockData);
      return nueva;
    }

    if (method === 'PUT') {
      this.mockData.categorias = this.mockData.categorias.map((item) =>
        item.id === id ? { ...item, ...data } : item
      );
      saveMockData(this.mockData);
      return this.mockData.categorias.find((item) => item.id === id);
    }

    if (method === 'DELETE') {
      this.mockData.categorias = this.mockData.categorias.filter((item) => item.id !== id);
      saveMockData(this.mockData);
      return { ok: true };
    }

    return this.mockData.categorias;
  }

  _handleMockHuespedes(segments, method, data) {
    const id = Number(segments[1]);
    if (method === 'GET') {
      if (segments.length === 1) return this.mockData.huespedes;
      const huesped = this.mockData.huespedes.find((item) => item.id === id);
      return huesped || null;
    }

    if (method === 'POST' || method === 'PUT') {
      const payload = method === 'POST' ? data : { ...this.mockData.huespedes.find((item) => item.id === id), ...data };
      const nuevo = {
        id: method === 'POST' ? Date.now() : id,
        ...payload,
        usuario: payload.usuario || {
          username: payload.username || 'usuario',
          email: payload.email || 'demo@example.com',
        },
      };
      if (method === 'POST') {
        this.mockData.huespedes.unshift(nuevo);
      } else {
        this.mockData.huespedes = this.mockData.huespedes.map((item) => (item.id === id ? nuevo : item));
      }
      saveMockData(this.mockData);
      return nuevo;
    }

    if (method === 'DELETE') {
      this.mockData.huespedes = this.mockData.huespedes.filter((item) => item.id !== id);
      saveMockData(this.mockData);
      return { ok: true };
    }

    return this.mockData.huespedes;
  }

  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers['Authorization'];
  }
}

export default new ApiService();
