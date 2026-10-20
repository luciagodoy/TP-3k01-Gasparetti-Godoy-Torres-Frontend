import BaseModel, { toNumber } from './BaseModel';

export class RoomCategory extends BaseModel {
  constructor({ id, name, description, capacity, imageUrls, pricePerNight }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.name = name;
    /** @type {string | null} */ this.description = description ?? null;
    /** @type {number} */ this.capacity = capacity;
    /** @type {string[]} */ this.imageUrls = imageUrls ?? [];
    // Base price only: the price of a stay is dynamic and comes from the
    // backend quote (pricingService.quote), never from multiplying this.
    /** @type {number} */ this.pricePerNight = toNumber(pricePerNight);
  }
}

export class Room extends BaseModel {
  constructor({ id, number, floor, status, categoryId, category }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {number} */ this.number = number;
    /** @type {number} */ this.floor = floor;
    /** @type {import('./types').RoomStatus} */ this.status = status;
    /** @type {number} */ this.categoryId = categoryId;
    /** @type {RoomCategory | null} */ this.category = RoomCategory.fromJSON(category);
  }

  get isAvailable() {
    return this.status === 'disponible';
  }
}
