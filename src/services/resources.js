import api from './api';
import {
  Province, City, RoomCategory, Room, User, Guest, Employee,
  Amenity, AmenityQuota, AmenityPrice, ReservationAmenity, Reservation, PricingRule, Quote,
} from '../models';

// Builds the query string skipping empty filters: an unselected <select> sends ''
// and the API would read it as "filter by empty" instead of "no filter".
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
 * Factory: creates the CRUD service of a REST resource. Every API entity has the
 * same shape (GET /x, GET /x/:id, POST, PUT /x/:id, DELETE /x/:id), so instead of
 * repeating those five functions per resource they are built here, each one
 * returning instances of its model.
 *
 * @template T
 * @param {string} endpoint base path, e.g. '/amenity-quotas'
 * @param {{ fromJSON: (json: object) => T, listFromJSON: (list: object[]) => T[] }} Model
 * @param {{ envelope?: string }} [options] key under which the API returns the
 *   entity on create/update, when it does not return it directly (reservations: { message, reservation })
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
   * Dynamic price of a stay, night by night. Without categoryId it quotes every
   * category in one request (the search page needs them all).
   * @param {{ startDate: string, endDate: string, categoryId?: number }} filters
   * @returns {Promise<Quote[]>}
   */
  quote: async (filters) => Quote.listFromJSON(await api.get(`/pricing/quote${toQueryString(filters)}`)),
};

export const guestService = {
  ...createResourceService('/guests', Guest),
  /** Guest profile of the logged-in account (admins and employees have none). */
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
  // Dedicated endpoints and not a PUT with { status }: the backend validates the
  // transition (pending -> check-in -> check-out) and occupies/frees the room.
  checkIn: async (id) => reservationOf(await api.post(`/reservations/${id}/check-in`, {})),
  /** The backend answers the check-out with the PDF receipt. @returns {Promise<Blob>} */
  checkOut: (id) => api.postFile(`/reservations/${id}/check-out`, {}),
  /** Downloads the receipt of an already closed reservation again. @returns {Promise<Blob>} */
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
