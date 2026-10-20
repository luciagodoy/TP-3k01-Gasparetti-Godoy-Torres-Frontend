import { describe, it, expect } from 'vitest';
import { PricingRule, Quote } from './pricing';
import { ADJUSTMENT_TYPE, PRICING_RULE_TYPE } from './types';

describe('PricingRule', () => {
  it('describes an occupancy tier without upper limit', () => {
    const rule = PricingRule.fromJSON({
      id: 1, type: PRICING_RULE_TYPE.OCCUPANCY, from: 80, to: null,
      adjustmentType: ADJUSTMENT_TYPE.PERCENTAGE, value: '30.00', categoryId: null,
    });

    expect(rule.typeLabel).toBe('Ocupación');
    expect(rule.rangeLabel).toBe('80% o más');
    expect(rule.adjustmentLabel).toBe('+30%');
    expect(rule.scopeLabel).toBe('Todas las categorías');
  });

  it('describes a lead-time discount of a category', () => {
    const rule = PricingRule.fromJSON({
      id: 2, type: PRICING_RULE_TYPE.LEAD_TIME, from: 61, to: 365,
      adjustmentType: ADJUSTMENT_TYPE.PERCENTAGE, value: -10, categoryId: 3, category: { id: 3, name: 'Suite' },
    });

    expect(rule.rangeLabel).toBe('61 días a menos de 365 días');
    expect(rule.adjustmentLabel).toBe('-10%');
    expect(rule.scopeLabel).toBe('Suite');
  });

  it('puts the sign of a fixed amount before the currency symbol', () => {
    const fixed = (value) => PricingRule.fromJSON({ id: 3, type: PRICING_RULE_TYPE.LEAD_TIME, from: 0, adjustmentType: ADJUSTMENT_TYPE.FIXED, value });

    expect(fixed(-10).adjustmentLabel).toBe('-$10.00 por noche');
    expect(fixed(25).adjustmentLabel).toBe('+$25.00 por noche');
  });
});

describe('Quote', () => {
  const quote = Quote.fromJSON({
    categoryId: 1, categoryName: 'Standard', startDate: '2026-11-01', endDate: '2026-11-03',
    leadDays: 12, basePricePerNight: '100.00', total: '230.00',
    nights: [
      { date: '2026-11-01', occupancy: 0, basePrice: 100, price: 100, occupancyAdjustment: null, leadTimeAdjustment: null },
      {
        date: '2026-11-02', occupancy: 90, basePrice: 100, price: 130,
        occupancyAdjustment: { ruleId: 1, adjustmentType: ADJUSTMENT_TYPE.PERCENTAGE, value: 30 }, leadTimeAdjustment: null,
      },
    ],
  });

  it('averages the nightly price', () => {
    expect(quote.averagePerNight).toBe(115);
  });

  it('knows when the rules moved the price and explains why', () => {
    expect(quote.isAdjusted).toBe(true);
    expect(quote.nights[0].adjustmentSummary).toBe('');
    expect(quote.nights[1].adjustmentSummary).toBe('ocupación +30%');
  });
});
