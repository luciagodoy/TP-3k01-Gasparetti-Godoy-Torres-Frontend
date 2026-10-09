import Modelo, { aNumero } from './Modelo';
import { Habitacion } from './alojamiento';
import { Huesped } from './personas';
import { ReservaServicio } from './servicios';
import { ESTADOS_RESERVA } from './tipos';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export default class Reserva extends Modelo {
  constructor({
    id, fechaInicio, fechaFin, estado, montoTotal,
    huespedId, habitacionId, huesped, habitacion, serviciosConsumidos,
  }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {import('./tipos').FechaISO} */ this.fechaInicio = fechaInicio;
    /** @type {import('./tipos').FechaISO} */ this.fechaFin = fechaFin;
    /** @type {import('./tipos').EstadoReserva} */ this.estado = estado;
    /** Monto del alojamiento (sin servicios). @type {number} */ this.montoTotal = aNumero(montoTotal);
    /** @type {number} */ this.huespedId = huespedId;
    /** @type {number} */ this.habitacionId = habitacionId;
    /** @type {Huesped | null} */ this.huesped = Huesped.fromJSON(huesped);
    /** @type {Habitacion | null} */ this.habitacion = Habitacion.fromJSON(habitacion);
    /** @type {ReservaServicio[]} */ this.serviciosConsumidos = ReservaServicio.listaDesdeJSON(serviciosConsumidos);
  }

  /**
   * Noches entre dos fechas 'YYYY-MM-DD'. Replica calcularNoches del backend:
   * se fija la hora en UTC para que la zona horaria local no corra un día.
   * @param {import('./tipos').FechaISO} fechaInicio
   * @param {import('./tipos').FechaISO} fechaFin
   */
  static calcularNoches(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return 0;
    return Math.round((new Date(`${fechaFin}T00:00:00Z`) - new Date(`${fechaInicio}T00:00:00Z`)) / MS_POR_DIA);
  }

  get noches() {
    return Reserva.calcularNoches(this.fechaInicio, this.fechaFin);
  }

  get totalServicios() {
    return this.serviciosConsumidos.reduce((suma, linea) => suma + (linea.montoTotal ?? 0), 0);
  }

  /** Alojamiento + servicios consumidos. */
  get total() {
    return (this.montoTotal ?? 0) + this.totalServicios;
  }

  // Las transiciones válidas son las mismas que valida el backend
  // (cancelarReservaPropia, realizarCheckIn, realizarCheckOut).
  get puedeCancelarse() {
    return this.estado === ESTADOS_RESERVA.PENDIENTE;
  }

  get puedeHacerCheckIn() {
    return this.estado === ESTADOS_RESERVA.PENDIENTE;
  }

  get puedeHacerCheckOut() {
    return this.estado === ESTADOS_RESERVA.CHECK_IN;
  }
}
