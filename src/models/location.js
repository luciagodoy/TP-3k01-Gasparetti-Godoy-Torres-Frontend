import BaseModel from './BaseModel';

export class Province extends BaseModel {
  constructor({ id, name }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.name = name;
  }
}

export class City extends BaseModel {
  constructor({ id, name, provinceId, province }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.name = name;
    /** @type {number} */ this.provinceId = provinceId;
    /** @type {Province | null} */ this.province = Province.fromJSON(province);
  }

  /** "Rosario, Santa Fe" cuando vino incluida la provincia; si no, sólo el nombre. */
  get fullName() {
    return this.province ? `${this.name}, ${this.province.name}` : this.name;
  }
}
