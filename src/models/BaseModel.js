// Clase base de los modelos de dominio. Cada subclase declara en su constructor
// qué campos toma del JSON de la API.
export default class BaseModel {
  /**
   * Construye una instancia a partir del JSON de la API. `this` es la subclase
   * sobre la que se llama (Reservation.fromJSON crea una Reservation), así
   * ninguna subclase lo repite.
   * @template T
   * @this {new (json: object) => T}
   * @param {object | null | undefined} json
   * @returns {T | null}
   */
  static fromJSON(json) {
    return json == null ? null : new this(json);
  }

  /**
   * @template T
   * @this {{ fromJSON: (json: object) => T }}
   * @param {object[] | null | undefined} list
   * @returns {T[]}
   */
  static listFromJSON(list) {
    return Array.isArray(list) ? list.map((item) => this.fromJSON(item)) : [];
  }
}

// Los DECIMALs de MySQL llegan como strings . Se convierten una
// sola vez en vez de usar Number(...) por cada página que muestra un monto.
// null/undefined se conservan.
export const toNumber = (value) => (value == null || value === '' ? value : Number(value));
