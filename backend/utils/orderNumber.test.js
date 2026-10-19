const { ALPHABET, createOrderNumber } = require('./orderNumber');

describe('createOrderNumber', () => {
  it('builds a non-numeric code that is not a sequence', () => {
    const numbers = new Set();
    for (let i = 0; i < 200; i += 1) {
      const orderNumber = createOrderNumber();
      expect(orderNumber).toMatch(/^EC[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
      numbers.add(orderNumber);
    }
    expect(numbers.size).toBe(200);
  });

  it('avoids characters that are easy to confuse', () => {
    expect(ALPHABET).not.toMatch(/[01IO]/);
  });
});
