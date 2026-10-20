import BaseModel, { toNumber } from './BaseModel';
import { RoomCategory } from './lodging';
import { ADJUSTMENT_TYPE, PRICING_RULE_TYPE } from './types';

// "+30%", "-10%", "+$25.00 por noche", "-$10.00 por noche": the sign goes
// before the currency symbol, never "$-10.00".
const formatAdjustment = (adjustmentType, value) => {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const amount = Math.abs(value);
  return adjustmentType === ADJUSTMENT_TYPE.PERCENTAGE ? `${sign}${amount}%` : `${sign}$${amount.toFixed(2)} por noche`;
};

// One tier of the dynamic pricing: when the measure is in [from, to) the
// nightly price is adjusted by `value`. `to` null = no upper limit.
export class PricingRule extends BaseModel {
  constructor({ id, type, from, to, adjustmentType, value, active, categoryId, category }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {'ocupacion' | 'antelacion'} */ this.type = type;
    /** @type {number} */ this.from = from;
    /** @type {number | null} */ this.to = to ?? null;
    /** @type {'porcentaje' | 'fijo'} */ this.adjustmentType = adjustmentType;
    /** @type {number} */ this.value = toNumber(value);
    /** @type {boolean} */ this.active = active ?? true;
    /** @type {number | null} */ this.categoryId = categoryId ?? null;
    /** @type {RoomCategory | null} */ this.category = RoomCategory.fromJSON(category);
  }

  get isOccupancy() {
    return this.type === PRICING_RULE_TYPE.OCCUPANCY;
  }

  // Shown to the user, hence Spanish.
  get typeLabel() {
    return this.isOccupancy ? 'Ocupación' : 'Antelación';
  }

  get rangeLabel() {
    const unit = this.isOccupancy ? '%' : ' días';
    return this.to === null ? `${this.from}${unit} o más` : `${this.from}${unit} a menos de ${this.to}${unit}`;
  }

  get adjustmentLabel() {
    return formatAdjustment(this.adjustmentType, this.value);
  }

  get scopeLabel() {
    return this.category?.name ?? 'Todas las categorías';
  }
}

/** Price of one night of a quote, with the adjustments that produced it. */
export class NightQuote extends BaseModel {
  constructor({ date, occupancy, basePrice, price, occupancyAdjustment, leadTimeAdjustment }) {
    super();
    /** @type {import('./types').IsoDate} */ this.date = date;
    /** @type {number} */ this.occupancy = toNumber(occupancy);
    /** @type {number} */ this.basePrice = toNumber(basePrice);
    /** @type {number} */ this.price = toNumber(price);
    this.occupancyAdjustment = occupancyAdjustment ?? null;
    this.leadTimeAdjustment = leadTimeAdjustment ?? null;
  }

  get isAdjusted() {
    return this.price !== this.basePrice;
  }

  /** Human description of what changed the price, e.g. "ocupación +30% · antelación -10%". */
  get adjustmentSummary() {
    return [
      this.occupancyAdjustment && `ocupación ${formatAdjustment(this.occupancyAdjustment.adjustmentType, toNumber(this.occupancyAdjustment.value))}`,
      this.leadTimeAdjustment && `antelación ${formatAdjustment(this.leadTimeAdjustment.adjustmentType, toNumber(this.leadTimeAdjustment.value))}`,
    ].filter(Boolean).join(' · ');
  }
}

/** Dynamic price of a stay in one category, computed by the backend night by night. */
export class Quote extends BaseModel {
  constructor({ categoryId, categoryName, startDate, endDate, leadDays, basePricePerNight, total, nights }) {
    super();
    /** @type {number} */ this.categoryId = categoryId;
    /** @type {string} */ this.categoryName = categoryName;
    /** @type {import('./types').IsoDate} */ this.startDate = startDate;
    /** @type {import('./types').IsoDate} */ this.endDate = endDate;
    /** @type {number} */ this.leadDays = leadDays;
    /** @type {number} */ this.basePricePerNight = toNumber(basePricePerNight);
    /** @type {number} */ this.total = toNumber(total);
    /** @type {NightQuote[]} */ this.nights = NightQuote.listFromJSON(nights);
  }

  get averagePerNight() {
    return this.nights.length ? Math.round((this.total / this.nights.length) * 100) / 100 : 0;
  }

  /** True when the rules moved the price away from the base price of the category. */
  get isAdjusted() {
    return this.nights.some((night) => night.isAdjusted);
  }
}
