import { describe, it, expect } from 'vitest';
import { isValidQuantity } from './quantity';

describe('isValidQuantity', () => {
  it.each([1, 2, '1', '10'])('acepta %s', (value) => {
    expect(isValidQuantity(value)).toBe(true);
  });

  it.each([0, '0', -1, '1.5', 1.5, '', 'abc'])('rechaza %s', (value) => {
    expect(isValidQuantity(value)).toBe(false);
  });
});
