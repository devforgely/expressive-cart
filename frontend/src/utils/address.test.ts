import { describe, expect, it } from 'vitest';
import { addressesMatch, emptyAddress, formatAddressLines, validateAddress } from './address';

describe('validateAddress', () => {
  it('requires the delivery fields and allows a blank second line', () => {
    const errors = validateAddress(emptyAddress());
    expect(errors.line2).toBeUndefined();
    expect(errors.fullName).toBeTruthy();
    expect(errors.postalCode).toBeTruthy();
  });

  it('accepts a complete address', () => {
    expect(validateAddress({
      fullName: 'Ada Lovelace',
      line1: '1 Analytical Engine',
      line2: '',
      city: 'London',
      region: 'Greater London',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom'
    })).toEqual({});
  });
});

describe('addressesMatch', () => {
  const address = {
    fullName: 'Ada Lovelace',
    line1: '1 Analytical Engine',
    line2: '',
    city: 'London',
    region: 'Greater London',
    postalCode: 'SW1A 1AA',
    country: 'United Kingdom'
  };

  it('treats the same address as a match, including surrounding spaces', () => {
    expect(addressesMatch(address, { ...address, city: ' London ' })).toBe(true);
  });

  it('treats a different postal code as a different address', () => {
    expect(addressesMatch(address, { ...address, postalCode: 'EC1A 1BB' })).toBe(false);
  });
});

describe('formatAddressLines', () => {
  it('joins the city, region, and postal code onto one line', () => {
    expect(formatAddressLines({
      fullName: 'Ada Lovelace',
      line1: '1 Analytical Engine',
      line2: 'Flat 2',
      city: 'London',
      region: 'Greater London',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom'
    })).toEqual([
      'Ada Lovelace',
      '1 Analytical Engine',
      'Flat 2',
      'London, Greater London, SW1A 1AA',
      'United Kingdom'
    ]);
  });
});
