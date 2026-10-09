import Modelo, { aNumero } from './Modelo';

export class Servicio extends Modelo {
  constructor({ id, nombre, descripcion }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.nombre = nombre;
    /** @type {string | null} */ this.descripcion = descripcion ?? null;
  }
}

export class Cupo extends Modelo {
  constructor({ id, cantidad, disponibles, servicioId, servicio }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.cantidad = cantidad;
    /** @type {number} */ this.disponibles = disponibles;
    /** @type {number} */ this.servicioId = servicioId;
    /** @type {Servicio | null} */ this.servicio = Servicio.fromJSON(servicio);
  }

  get tieneDisponibilidad() {
    return this.disponibles > 0;
  }
}

export class PrecioServicio extends Modelo {
  constructor({ id, precio, fechaVigenciaDesde, fechaVigenciaHasta, servicioId, servicio }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.precio = aNumero(precio);
    /** @type {import('./tipos').FechaISO} */ this.fechaVigenciaDesde = fechaVigenciaDesde;
    /** @type {import('./tipos').FechaISO | null} */ this.fechaVigenciaHasta = fechaVigenciaHasta ?? null;
    /** @type {number} */ this.servicioId = servicioId;
    /** @type {Servicio | null} */ this.servicio = Servicio.fromJSON(servicio);
  }

  /**
   * @param {import('./tipos').FechaISO} [fecha] por defecto, hoy
   */
  estaVigente(fecha = new Date().toISOString().slice(0, 10)) {
    if (this.fechaVigenciaDesde > fecha) return false;
    return this.fechaVigenciaHasta == null || this.fechaVigenciaHasta >= fecha;
  }
}

export class ReservaServicio extends Modelo {
  constructor({ id, cantidad, precioUnitario, montoTotal, reservaId, cupoId, cupo }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.cantidad = cantidad;
    /** @type {number} */ this.precioUnitario = aNumero(precioUnitario);
    /** @type {number} */ this.montoTotal = aNumero(montoTotal);
    /** @type {number} */ this.reservaId = reservaId;
    /** @type {number} */ this.cupoId = cupoId;
    /** @type {Cupo | null} */ this.cupo = Cupo.fromJSON(cupo);
  }

  get nombreServicio() {
    return this.cupo?.servicio?.nombre ?? null;
  }
}
