// Clase base de los modelos de dominio. Cada subclase declara en su constructor
// qué campos toma del JSON de la API, así una respuesta con datos de más (o con
// tipos "flojos", como los DECIMAL de MySQL que llegan como string) no se filtra
// tal cual a las páginas.
export default class Modelo {
  /**
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
   * @param {object[] | null | undefined} lista
   * @returns {T[]}
   */
  static listaDesdeJSON(lista) {
    return Array.isArray(lista) ? lista.map((item) => this.fromJSON(item)) : [];
  }
}

// Los DECIMAL de MySQL llegan como string ("15000.00"). Se convierten acá una
// sola vez en lugar de esparcir Number(...) por cada página que muestra montos.
// null/undefined se respetan: "sin valor" no es lo mismo que 0.
export const aNumero = (valor) => (valor == null || valor === '' ? valor : Number(valor));
