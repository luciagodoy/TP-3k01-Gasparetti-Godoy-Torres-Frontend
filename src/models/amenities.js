import BaseModel, { toNumber } from './BaseModel';

// An extra service the hotel offers (spa, breakfast, parking...).
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
   * Same rule as the backend: valid from validFrom and, without an end date,
   * still valid. 'YYYY-MM-DD' strings compare correctly as text, without going
   * through Date (which would shift them a day depending on the time zone).
   * @param {import('./types').IsoDate} [date] today by default
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
