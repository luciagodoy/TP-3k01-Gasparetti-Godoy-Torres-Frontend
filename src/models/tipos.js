// Tipos de dominio compartidos entre los modelos, los servicios y las páginas.
// Los valores salen del backend (los ENUM de los modelos de Sequelize)

/** @typedef {'huesped' | 'empleado' | 'admin'} Rol */

/** @typedef {'pendiente' | 'check-in' | 'check-out' | 'cancelada'} EstadoReserva */

/** @typedef {'disponible' | 'ocupada' | 'mantenimiento'} EstadoHabitacion */

/** @typedef {'activo' | 'inactivo'} EstadoEmpleado */

/** Fecha sin hora (DATEONLY): 'YYYY-MM-DD'. @typedef {string} FechaISO */

export const ROLES = Object.freeze({
  HUESPED: 'huesped',
  EMPLEADO: 'empleado',
  ADMIN: 'admin',
});

export const ROLES_STAFF = Object.freeze([ROLES.EMPLEADO, ROLES.ADMIN]);
export const ROLES_ADMIN = Object.freeze([ROLES.ADMIN]);

export const ESTADOS_RESERVA = Object.freeze({
  PENDIENTE: 'pendiente',
  CHECK_IN: 'check-in',
  CHECK_OUT: 'check-out',
  CANCELADA: 'cancelada',
});

// --- Datos que se envían en las peticiones ---

/**
 * @typedef {Object} CredencialesLogin
 * @property {string} username Usuario o email
 * @property {string} password
 */

/**
 * @typedef {Object} SesionIniciada
 * @property {string} token JWT para el header Authorization
 * @property {import('./personas').User} usuario
 */

/**
 * @typedef {Object} NuevaReservaPropia
 * @property {number} habitacionId
 * @property {FechaISO} fechaInicio
 * @property {FechaISO} fechaFin
 */

/**
 * @typedef {Object} NuevoConsumoPropio
 * @property {number} reservaId
 * @property {number} cupoId
 * @property {number} cantidad
 */

/**
 * @typedef {Object} RegistroHuesped
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string | null} telefono
 * @property {string} documentoIdentidad
 * @property {number} ciudadId
 * @property {string} pais
 */
