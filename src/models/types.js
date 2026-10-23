// Tipos de dominio compartidos por modelos, servicios y páginas. Los valores
// guardados vienen del backend, el código siempre usa estas constantes en vez de los strings sueltos.

/** @typedef {'huesped' | 'empleado' | 'admin'} Role */

/** @typedef {'pendiente' | 'check-in' | 'check-out' | 'cancelada'} ReservationStatus */

/** @typedef {'disponible' | 'ocupada' | 'mantenimiento'} RoomStatus */

/** @typedef {'activo' | 'inactivo'} EmployeeStatus */

/** @typedef {string} IsoDate */

export const ROLES = Object.freeze({
  GUEST: 'huesped',
  EMPLOYEE: 'empleado',
  ADMIN: 'admin',
});
export const STAFF_ROLES = Object.freeze([ROLES.EMPLOYEE, ROLES.ADMIN]);
export const ADMIN_ROLES = Object.freeze([ROLES.ADMIN]);

export const RESERVATION_STATUS = Object.freeze({
  PENDING: 'pendiente',
  CHECKED_IN: 'check-in',
  CHECKED_OUT: 'check-out',
  CANCELLED: 'cancelada',
});
export const PRICING_RULE_TYPE = Object.freeze({
  OCCUPANCY: 'ocupacion',
  LEAD_TIME: 'antelacion',
});

export const ADJUSTMENT_TYPE = Object.freeze({
  PERCENTAGE: 'porcentaje',
  FIXED: 'fijo',
});


/**
 * @typedef {Object} LoginCredentials
 * @property {string} username Usuario o email
 * @property {string} password
 */

/**
 * @typedef {Object} Session
 * @property {string} token JWT para el header Authorization
 * @property {import('./people').User} user
 */

/**
 * @typedef {Object} NewOwnReservation
 * @property {number} roomId
 * @property {IsoDate} startDate
 * @property {IsoDate} endDate
 * @property {number} [expectedTotal] Total que se le mostró al huésped; la API
 *   responde 409 si el precio dinámico cambió desde entonces.
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
