const express = require('express');
const router = express.Router();

const OrderService = require('../services/OrderService');
const OrderServiceInstance = new OrderService();
const { requireAuth } = require('../middleware/auth');
const { orderIdParam } = require('../middleware/validate');

module.exports = (app) => {

  app.use('/orders', requireAuth, router);

  router.get('/', async (req, res, next) => {
    try {
      const { id } = req.user;
      const response = await OrderServiceInstance.list(id);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:orderId', orderIdParam, async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const response = await OrderServiceInstance.getForUser(orderId, req.user.id);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });
};
