// Base class of the domain models. Each subclass declares in its constructor
// which fields it takes from the API JSON, so a response with extra data (or with
// "loose" types, like MySQL DECIMALs that arrive as strings) never leaks as-is
// into the pages.
export default class BaseModel {
  /**
   * Builds an instance from the API JSON. `this` is the subclass it is called on
   * (Reservation.fromJSON creates a Reservation), so no subclass repeats it.
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

// MySQL DECIMALs arrive as strings ("15000.00"). They are converted here once
// instead of sprinkling Number(...) over every page that shows an amount.
// null/undefined are kept: "no value" is not the same as 0.
export const toNumber = (value) => (value == null || value === '' ? value : Number(value));
