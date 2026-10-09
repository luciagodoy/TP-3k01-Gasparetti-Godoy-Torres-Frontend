import Modelo, { aNumero } from './Modelo';

export class CategoriaHabitacion extends Modelo {
  constructor({ id, denominacion, descripcion, capacidadPersonas, imagenesUrl, precioNoche }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.denominacion = denominacion;
    /** @type {string | null} */ this.descripcion = descripcion ?? null;
    /** @type {number} */ this.capacidadPersonas = capacidadPersonas;
    /** @type {string[]} */ this.imagenesUrl = imagenesUrl ?? [];
    /** @type {number} */ this.precioNoche = aNumero(precioNoche);
  }

  /** Precio del alojamiento por una cantidad de noches (sin servicios). */
  precioPorNoches(noches) {
    return noches > 0 ? noches * (this.precioNoche ?? 0) : 0;
  }
}

export class Habitacion extends Modelo {
  constructor({ id, numero, piso, estadoDisponibilidad, categoriaId, categoria }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.numero = numero;
    /** @type {number} */ this.piso = piso;
    /** @type {import('./tipos').EstadoHabitacion} */ this.estadoDisponibilidad = estadoDisponibilidad;
    /** @type {number} */ this.categoriaId = categoriaId;
    /** @type {CategoriaHabitacion | null} */ this.categoria = CategoriaHabitacion.fromJSON(categoria);
  }

  get estaDisponible() {
    return this.estadoDisponibilidad === 'disponible';
  }
}
