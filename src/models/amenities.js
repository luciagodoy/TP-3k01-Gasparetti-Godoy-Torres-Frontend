import BaseModel, { toNumber } from './BaseModel';

// Un servicio extra que ofrece el hotel (spa, desayuno, estacionamiento...).
export class Amenity extends BaseModel {
  constructor({ id, name, description }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.name = name;
    /** @type {string | null} */ this.description = description ?? null;
  }
}

export class AmenityQuota extends BaseModel {
  constructor({ id, quantity, available, amenityId, amenity }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.quantity = quantity;
    /** @type {number} */ this.available = available;
    /** @type {number} */ this.amenityId = amenityId;
    /** @type {Amenity | null} */ this.amenity = Amenity.fromJSON(amenity);
  }

  get hasAvailability() {
    return this.available > 0;
  }
}

export class AmenityPrice extends BaseModel {
  constructor({ id, price, validFrom, validTo, amenityId, amenity }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.price = toNumber(price);
    /** @type {import('./types').IsoDate} */ this.validFrom = validFrom;
    /** @type {import('./types').IsoDate | null} */ this.validTo = validTo ?? null;
    /** @type {number} */ this.amenityId = amenityId;
    /** @type {Amenity | null} */ this.amenity = Amenity.fromJSON(amenity);
  }

  /**
   * Misma regla que el backend: vigente desde validFrom y, sin fecha de fin,
   * sigue vigente. Los strings 'YYYY-MM-DD' se comparan bien como texto, sin
   * pasar por Date (que los correría un día según la zona horaria).
   * @param {import('./types').IsoDate} [date] hoy por defecto
   */
  isValidOn(date = new Date().toISOString().slice(0, 10)) {
    if (this.validFrom > date) return false;
    return this.validTo == null || this.validTo >= date;
  }
}

export class ReservationAmenity extends BaseModel {
  constructor({ id, quantity, unitPrice, totalAmount, reservationId, quotaId, quota }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.quantity = quantity;
    /** @type {number} */ this.unitPrice = toNumber(unitPrice);
    /** @type {number} */ this.totalAmount = toNumber(totalAmount);
    /** @type {number} */ this.reservationId = reservationId;
    /** @type {number} */ this.quotaId = quotaId;
    /** @type {AmenityQuota | null} */ this.quota = AmenityQuota.fromJSON(quota);
  }

  get amenityName() {
    return this.quota?.amenity?.name ?? null;
  }
}
