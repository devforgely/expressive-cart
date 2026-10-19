const express = require('express');
const request = require('supertest');
const { registerRules, addCartItemRules, checkoutRules } = require('./validate');

function buildApp(path, rules) {
  const app = express();
  app.use(express.json());
  app.post(path, rules, (req, res) => res.status(200).json(req.body));
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
}

describe('validation middleware', () => {
  it('rejects invalid registration payloads', async () => {
    const app = buildApp('/register', registerRules);
    const response = await request(app)
      .post('/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });

  it('accepts a valid registration payload', async () => {
    const app = buildApp('/register', registerRules);
    const response = await request(app)
      .post('/register')
      .send({ email: 'shopper@example.com', password: 'password123' });

    expect(response.status).toBe(200);
  });

  it('keeps apostrophes and ampersands in names', async () => {
    const app = buildApp('/register', registerRules);
    const response = await request(app)
      .post('/register')
      .send({
        email: 'shopper@example.com',
        password: 'password123',
        firstName: "Anne-Marie O'Brien",
        lastName: 'Smith & Sons'
      });

    expect(response.status).toBe(200);
    expect(response.body.firstName).toBe("Anne-Marie O'Brien");
    expect(response.body.lastName).toBe('Smith & Sons');
  });

  it('rejects cart items without a positive qty', async () => {
    const app = buildApp('/items', addCartItemRules);
    const response = await request(app)
      .post('/items')
      .send({ productId: 1, qty: 0 });

    expect(response.status).toBe(400);
  });

  it('requires a delivery and billing address at checkout', async () => {
    const app = buildApp('/checkout', checkoutRules);
    const response = await request(app)
      .post('/checkout')
      .send({ cartId: 1, paymentInfo: { id: 'tok_test' } });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/address/i);
  });

  it('accepts checkout when both addresses are complete', async () => {
    const app = buildApp('/checkout', checkoutRules);
    const address = {
      fullName: 'Ada Lovelace',
      line1: '1 Analytical Engine',
      line2: '',
      city: 'London',
      region: 'Greater London',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom'
    };
    const response = await request(app)
      .post('/checkout')
      .send({
        cartId: 1,
        paymentInfo: { id: 'tok_test' },
        shippingAddress: address,
        billingAddress: { ...address, line1: '2 Billing Road' }
      });

    expect(response.status).toBe(200);
  });
});
