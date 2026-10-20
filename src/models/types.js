// Domain types shared by models, services and pages. The stored values come from
// the backend and are kept in Spanish because they are data saved in the
// database; the code always uses these constants instead of the raw strings.

/** @typedef {'huesped' | 'empleado' | 'admin'} Role */

/** @typedef {'pendiente' | 'check-in' | 'check-out' | 'cancelada'} ReservationStatus */

/** @typedef {'disponible' | 'ocupada' | 'mantenimiento'} RoomStatus */

/** @typedef {'activo' | 'inactivo'} EmployeeStatus */

/** Date without time, as the API sends it (DATEONLY): 'YYYY-MM-DD'. @typedef {string} IsoDate */

export const ROLES = Object.freeze({
  GUEST: 'huesped',
  EMPLOYEE: 'empleado',
  ADMIN: 'admin',
});

// Same split as the backend's auth.staff / auth.admin: employees and admins
// run the hotel; only accounts and staff management is admin-only.
export const STAFF_ROLES = Object.freeze([ROLES.EMPLOYEE, ROLES.ADMIN]);
export const ADMIN_ROLES = Object.freeze([ROLES.ADMIN]);

export const RESERVATION_STATUS = Object.freeze({
  PENDING: 'pendiente',
  CHECKED_IN: 'check-in',
  CHECKED_OUT: 'check-out',
  CANCELLED: 'cancelada',
});

// Dynamic pricing: what a rule measures and how it changes the price.
export const PRICING_RULE_TYPE = Object.freeze({
  OCCUPANCY: 'ocupacion',
  LEAD_TIME: 'antelacion',
});

export const ADJUSTMENT_TYPE = Object.freeze({
  PERCENTAGE: 'porcentaje',
  FIXED: 'fijo',
});

// --- Data sent in requests ---

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username Username or email
 * @property {string} password
 */

/**
 * @typedef {Object} Session
 * @property {string} token JWT for the Authorization header
 * @property {import('./people').User} user
 */

/**
 * @typedef {Object} NewOwnReservation
 * @property {number} roomId
 * @property {IsoDate} startDate
 * @property {IsoDate} endDate
 * @property {number} [expectedTotal] Total shown to the guest; the API answers
 *   409 if the dynamic price changed since then.
 */

/**
 * @typedef {Object} NewOwnConsumption
 * @property {number} reservationId
 * @property {number} quotaId
 * @property {number} quantity
 */

/**
 * @typedef {Object} GuestRegistration
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string | null} phone
 * @property {string} documentNumber
 * @property {number} cityId
 * @property {string} country
 */
