import api from './api';
import {
  Province, City, RoomCategory, Room, User, Guest, Employee,
  Amenity, AmenityQuota, AmenityPrice, ReservationAmenity, Reservation, PricingRule, Quote,
} from '../models';

// Arma el query string salteando los filtros vacíos: un <select> sin elegir manda
// '' y la API lo leería como "filtrar por vacío" en vez de "sin filtro".
const toQueryString = (filters) => {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

/**
 * Factory: crea el servicio CRUD de un recurso REST. Todas las entidades de la
 * API tienen la misma forma (GET /x, GET /x/:id, POST, PUT /x/:id, DELETE /x/:id),
 * así que en vez de repetir esas cinco funciones por recurso se arman acá, y
 * cada una devuelve instancias de su modelo.
 *
 * @template T
 * @param {string} endpoint ruta base, p. ej. '/amenity-quotas'
 * @param {{ fromJSON: (json: object) => T, listFromJSON: (list: object[]) => T[] }} Model
 * @param {{ envelope?: string }} [options] clave bajo la que la API devuelve la
 *   entidad al crear/actualizar, cuando no la devuelve directamente (reservations: { message, reservation })
 */
export function createResourceService(endpoint, Model, { envelope } = {}) {
  const toModel = (json) => Model.fromJSON(envelope && json?.[envelope] ? json[envelope] : json);

  return {
    /** @param {Record<string, string | number | boolean>} [filters] @returns {Promise<T[]>} */
    list: async (filters) => Model.listFromJSON(await api.get(`${endpoint}${toQueryString(filters)}`)),
    /** @returns {Promise<T | null>} */
    get: async (id) => Model.fromJSON(await api.get(`${endpoint}/${id}`)),
    /** @returns {Promise<T | null>} */
    create: async (data) => toModel(await api.post(endpoint, data)),
    /** @returns {Promise<T | null>} */
    update: async (id, data) => toModel(await api.put(`${endpoint}/${id}`, data)),
    remove: (id) => api.delete(`${endpoint}/${id}`),
  };
}

export const provinceService = createResourceService('/provinces', Province);
export const cityService = createResourceService('/cities', City);
export const roomCategoryService = createResourceService('/room-categories', RoomCategory);
export const roomService = createResourceService('/rooms', Room);
export const amenityService = createResourceService('/amenities', Amenity);
export const amenityQuotaService = createResourceService('/amenity-quotas', AmenityQuota);
export const amenityPriceService = createResourceService('/amenity-prices', AmenityPrice);
export const employeeService = createResourceService('/employees', Employee);
export const userService = createResourceService('/users', User);
export const pricingRuleService = createResourceService('/pricing-rules', PricingRule);

export const pricingService = {
  /**
   * Precio dinámico de una estadía, noche a noche. Sin categoryId cotiza todas las
   * categorías en una sola petición (la página de búsqueda las necesita todas).
   * @param {{ startDate: string, endDate: string, categoryId?: number }} filters
   * @returns {Promise<Quote[]>}
   */
  quote: async (filters) => Quote.listFromJSON(await api.get(`/pricing/quote${toQueryString(filters)}`)),
};

export const guestService = {
  ...createResourceService('/guests', Guest),
  /** Perfil de huésped de la cuenta logueada (los admins y empleados no tienen). */
  myProfile: async () => Guest.fromJSON(await api.get('/guests/me')),
  /** @param {import('../models/types').GuestRegistration} data */
  register: (data) => api.post('/guests/register', data),
};

const reservationOf = (response) => Reservation.fromJSON(response?.reservation);

export const reservationService = {
  ...createResourceService('/reservations', Reservation, { envelope: 'reservation' }),
  mine: async () => Reservation.listFromJSON(await api.get('/reservations/mine')),
  /** @param {import('../models/types').NewOwnReservation} data */
  createMine: async (data) => reservationOf(await api.post('/reservations/mine', data)),
  cancel: async (id) => reservationOf(await api.post(`/reservations/${id}/cancel`, {})),
  // Endpoints dedicados y no un PUT con { status }: el backend valida la transición
  // (pendiente -> check-in -> check-out) y ocupa/libera la habitación.
  /** @param {{ early?: boolean }} [options] early confirma un check-in antes de las 15:00. */
  checkIn: async (id, options = {}) => reservationOf(await api.post(`/reservations/${id}/check-in`, options)),
  /**
   * El backend responde el check-out con el comprobante PDF.
   * @param {{ late?: boolean }} [options] late confirma un check-out después de las 10:00.
   * @returns {Promise<Blob>}
   */
  checkOut: (id, options = {}) => api.postFile(`/reservations/${id}/check-out`, options),
  /** Vuelve a descargar el comprobante de una reserva ya cerrada. @returns {Promise<Blob>} */
  downloadReceipt: (id) => api.getFile(`/reservations/${id}/receipt`),
};

export const reservationAmenityService = {
  ...createResourceService('/reservation-amenities', ReservationAmenity),
  /** @param {import('../models/types').NewOwnConsumption} data */
  createMine: async (data) => ReservationAmenity.fromJSON(await api.post('/reservation-amenities/mine', data)),
};

export const authService = {
  /**
   * @param {import('../models/types').LoginCredentials} credentials
   * @returns {Promise<import('../models/types').Session>}
   */
  login: async (credentials) => {
    const { token, user } = await api.post('/auth/login', credentials);
    return { token, user: User.fromJSON(user) };
  },
};
