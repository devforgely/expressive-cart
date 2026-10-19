const createError = require('http-errors');

function paymentFailure(err) {
  if (err && err.type === 'StripeCardError') {
    if (err.decline_code === 'insufficient_funds') {
      return createError(402, 'Your card was declined because of insufficient funds.');
    }
    if (err.code === 'incorrect_number' || err.code === 'invalid_number') {
      return createError(402, 'Your card number is invalid.');
    }
    if (err.code === 'expired_card') {
      return createError(402, 'Your card was declined because it has expired.');
    }
    if (err.code === 'incorrect_cvc') {
      return createError(402, 'Your card was declined because the security code is incorrect.');
    }
    return createError(402, 'Your card was declined.');
  }

  if (err && err.type === 'StripeAuthenticationError') {
    return createError(500, 'Payment is not configured.');
  }

  if (err && err.type === 'StripeInvalidRequestError') {
    return createError(400, 'The card details could not be used. Enter the card again.');
  }

  if (err && err.status) {
    return err;
  }

  return createError(502, 'Payment could not be processed. Please try again.');
}

function cardFromCharge(charge) {
  const card = (charge && charge.payment_method_details && charge.payment_method_details.card)
    || (charge && charge.source)
    || {};

  return {
    last4: card.last4 || null,
    brand: card.brand || null
  };
}

module.exports = {
  paymentFailure,
  cardFromCharge
};
