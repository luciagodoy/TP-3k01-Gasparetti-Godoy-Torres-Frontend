import Modelo from './Modelo';

export class Provincia extends Modelo {
  constructor({ id, nombre }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.nombre = nombre;
  }
}

export class Ciudad extends Modelo {
  constructor({ id, nombre, provinciaId, provincia }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.nombre = nombre;
    /** @type {number} */ this.provinciaId = provinciaId;
    /** @type {Provincia | null} */ this.provincia = Provincia.fromJSON(provincia);
  }

  get nombreCompleto() {
    return this.provincia ? `${this.nombre}, ${this.provincia.nombre}` : this.nombre;
  }
}
