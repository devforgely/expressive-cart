const express = require('express');
const router = express.Router();
const CartService = require('../services/CartService');
const { requireAuth } = require('../middleware/auth');
const {
  addCartItemRules,
  updateCartItemRules,
  cartItemIdParam,
  checkoutRules
} = require('../middleware/validate');

const CartServiceInstance = new CartService();

module.exports = (app) => {

  app.use('/cart', requireAuth, router);

  router.get('/', async (req, res, next) => {
    try {
      const { id } = req.user;
      const response = await CartServiceInstance.loadCart(id);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { id } = req.user;
      const response = await CartServiceInstance.create({ userId: id });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });

  router.post('/items', addCartItemRules, async (req, res, next) => {
    try {
      const { id } = req.user;
      const { productId, qty } = req.body;
      const response = await CartServiceInstance.addItem(id, {
        productId,
        quantity: qty
      });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });

  router.put('/items/:cartItemId', updateCartItemRules, async (req, res, next) => {
    try {
      const { cartItemId } = req.params;
      const quantity = req.body.quantity ?? req.body.qty;
      const response = await CartServiceInstance.updateItem(req.user.id, cartItemId, { quantity });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/items/:cartItemId', cartItemIdParam, async (req, res, next) => {
    try {
      const { cartItemId } = req.params;
      const response = await CartServiceInstance.removeItem(req.user.id, cartItemId);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });

  router.post('/checkout', checkoutRules, async (req, res, next) => {
    try {
      const { id } = req.user;
      const { cartId, paymentInfo, shippingAddress, billingAddress } = req.body;
      const response = await CartServiceInstance.checkout(cartId, id, {
        paymentInfo,
        shippingAddress,
        billingAddress
      });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });
};
