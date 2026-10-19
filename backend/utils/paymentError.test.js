const { cardFromCharge, paymentFailure } = require('./paymentError');

describe('paymentFailure', () => {
  it('explains an insufficient-funds decline', () => {
    const err = paymentFailure({
      type: 'StripeCardError',
      code: 'card_declined',
      decline_code: 'insufficient_funds',
      message: 'Your card has insufficient funds.'
    });

    expect(err.status).toBe(402);
    expect(err.message).toBe('Your card was declined because of insufficient funds.');
  });

  it('explains a generic card decline', () => {
    const err = paymentFailure({
      type: 'StripeCardError',
      code: 'card_declined',
      decline_code: 'generic_decline',
      message: 'Your card was declined.'
    });

    expect(err.status).toBe(402);
    expect(err.message).toBe('Your card was declined.');
  });

  it('explains an invalid card number', () => {
    const err = paymentFailure({
      type: 'StripeCardError',
      code: 'incorrect_number',
      message: 'Your card number is incorrect.'
    });

    expect(err.status).toBe(402);
    expect(err.message).toBe('Your card number is invalid.');
  });
});

describe('cardFromCharge', () => {
  it('reads the brand and last four digits from the charge', () => {
    expect(cardFromCharge({
      payment_method_details: { card: { brand: 'visa', last4: '4242' } }
    })).toEqual({ brand: 'visa', last4: '4242' });
  });
});