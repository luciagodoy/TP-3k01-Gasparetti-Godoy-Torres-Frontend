import api from './api';
import {
  Provincia, Ciudad, CategoriaHabitacion, Habitacion, User, Huesped, Empleado,
  Servicio, Cupo, PrecioServicio, ReservaServicio, Reserva,
} from '../models';

// Arma el query string salteando los filtros vacíos: un <select> sin elegir
// manda '' y la API lo tomaría como "filtrar por vacío" en vez de "sin filtro".
const aQueryString = (filtros) => {
  if (!filtros) return '';
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') params.append(clave, valor);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

/**
 * Factory: crea el servicio CRUD de un recurso REST. Todas las entidades de la
 * API comparten la misma forma (GET /x, GET /x/:id, POST, PUT /x/:id, DELETE
 * /x/:id), así que en vez de repetir esas cinco funciones por recurso se
 * fabrican acá, cada una devolviendo instancias del modelo que le corresponde.
 *
 * @template T
 * @param {string} endpoint ruta base, por ejemplo '/cupos'
 * @param {{ fromJSON: (json: object) => T, listaDesdeJSON: (lista: object[]) => T[] }} Modelo
 * @param {{ envoltorio?: string }} [opciones] clave bajo la que la API devuelve la
 *   entidad al crear/actualizar, si no la devuelve directo (reservas: { mensaje, reserva })
 */
export function crearServicioRecurso(endpoint, Modelo, { envoltorio } = {}) {
  const aModelo = (json) => Modelo.fromJSON(envoltorio && json?.[envoltorio] ? json[envoltorio] : json);

  return {
    /** @param {Record<string, string | number | boolean>} [filtros] @returns {Promise<T[]>} */
    listar: async (filtros) => Modelo.listaDesdeJSON(await api.get(`${endpoint}${aQueryString(filtros)}`)),
    /** @returns {Promise<T | null>} */
    obtener: async (id) => Modelo.fromJSON(await api.get(`${endpoint}/${id}`)),
    /** @returns {Promise<T | null>} */
    crear: async (datos) => aModelo(await api.post(endpoint, datos)),
    /** @returns {Promise<T | null>} */
    actualizar: async (id, datos) => aModelo(await api.put(`${endpoint}/${id}`, datos)),
    eliminar: (id) => api.delete(`${endpoint}/${id}`),
  };
}

export const provinciaService = crearServicioRecurso('/provincias', Provincia);
export const ciudadService = crearServicioRecurso('/ciudades', Ciudad);
export const categoriaService = crearServicioRecurso('/categorias', CategoriaHabitacion);
export const habitacionService = crearServicioRecurso('/habitaciones', Habitacion);
export const servicioService = crearServicioRecurso('/servicios', Servicio);
export const cupoService = crearServicioRecurso('/cupos', Cupo);
export const precioServicioService = crearServicioRecurso('/precios-servicio', PrecioServicio);
export const empleadoService = crearServicioRecurso('/empleados', Empleado);
export const usuarioService = crearServicioRecurso('/usuarios', User);

export const huespedService = {
  ...crearServicioRecurso('/huespedes', Huesped),
  /** Perfil de huésped de la cuenta logueada (admin/empleado no tienen). */
  miPerfil: async () => Huesped.fromJSON(await api.get('/huespedes/me')),
  /** @param {import('../models/tipos').RegistroHuesped} datos */
  registrar: (datos) => api.post('/huespedes/registro', datos),
};

const reservaDe = (respuesta) => Reserva.fromJSON(respuesta?.reserva);

export const reservaService = {
  ...crearServicioRecurso('/reservas', Reserva, { envoltorio: 'reserva' }),
  mias: async () => Reserva.listaDesdeJSON(await api.get('/reservas/mias')),
  /** @param {import('../models/tipos').NuevaReservaPropia} datos */
  crearPropia: async (datos) => reservaDe(await api.post('/reservas/mias', datos)),
  cancelar: async (id) => reservaDe(await api.post(`/reservas/${id}/cancelar`, {})),
  // Endpoints propios y no un PUT con { estado }: el backend valida la
  // transición (sólo pendiente -> check-in -> check-out) y además marca la
  // habitación como ocupada / la libera. Un PUT genérico se saltea todo eso.
  checkIn: async (id) => reservaDe(await api.post(`/reservas/${id}/checkin`, {})),
  /** El backend responde el check-out con el comprobante en PDF. @returns {Promise<Blob>} */
  checkOut: (id) => api.postArchivo(`/reservas/${id}/checkout`, {}),
  /** Vuelve a descargar el comprobante de una reserva ya cerrada. @returns {Promise<Blob>} */
  descargarComprobante: (id) => api.getArchivo(`/reservas/${id}/comprobante`),
};

export const reservaServicioService = {
  ...crearServicioRecurso('/reserva-servicios', ReservaServicio),
  /** @param {import('../models/tipos').NuevoConsumoPropio} datos */
  crearPropio: async (datos) => ReservaServicio.fromJSON(await api.post('/reserva-servicios/mias', datos)),
};

export const authService = {
  /**
   * @param {import('../models/tipos').CredencialesLogin} credenciales
   * @returns {Promise<import('../models/tipos').SesionIniciada>}
   */
  login: async (credenciales) => {
    const { token, usuario } = await api.post('/auth/login', credenciales);
    return { token, usuario: User.fromJSON(usuario) };
  },
};
