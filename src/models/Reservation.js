import BaseModel, { toNumber } from './BaseModel';
import { Room } from './lodging';
import { Guest } from './people';
import { ReservationAmenity } from './amenities';
import { RESERVATION_STATUS } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default class Reservation extends BaseModel {
  constructor({ id, startDate, endDate, status, totalAmount, guestId, roomId, guest, room, consumedAmenities }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {import('./types').IsoDate} */ this.startDate = startDate;
    /** @type {import('./types').IsoDate} */ this.endDate = endDate;
    /** @type {import('./types').ReservationStatus} */ this.status = status;
    /** @type {number} */ this.totalAmount = toNumber(totalAmount);
    /** @type {number} */ this.guestId = guestId;
    /** @type {number} */ this.roomId = roomId;
    /** @type {Guest | null} */ this.guest = Guest.fromJSON(guest);
    /** @type {Room | null} */ this.room = Room.fromJSON(room);
    /** @type {ReservationAmenity[]} */ this.consumedAmenities = ReservationAmenity.listFromJSON(consumedAmenities);
  }

  /**
   * Noches entre dos fechas 'YYYY-MM-DD'. Igual que en el backend: la hora se
   * fija en UTC para que la zona horaria local no corra un día.
   * @param {import('./types').IsoDate} startDate
   * @param {import('./types').IsoDate} endDate
   */
  static calculateNights(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    return Math.round((new Date(`${endDate}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`)) / MS_PER_DAY);
  }

  get nights() {
    return Reservation.calculateNights(this.startDate, this.endDate);
  }

  get amenitiesTotal() {
    return this.consumedAmenities.reduce((sum, line) => sum + (line.totalAmount ?? 0), 0);
  }

  /** Alojamiento + servicios consumidos. */
  get total() {
    return (this.totalAmount ?? 0) + this.amenitiesTotal;
  }
  get canBeCancelled() {
    return this.status === RESERVATION_STATUS.PENDING;
  }

  get canCheckIn() {
    return this.status === RESERVATION_STATUS.PENDING;
  }

  get canCheckOut() {
    return this.status === RESERVATION_STATUS.CHECKED_IN;
  }

  /** Una estadía en curso no se borra: primero hay que hacer el check-out. */
  get canBeDeleted() {
    return this.status !== RESERVATION_STATUS.CHECKED_IN;
  }
}
