const express = require('express');
const authRouter = require('./auth');
const cartRouter = require('./cart');
const orderRouter = require('./order');
const productRouter = require('./product');
const userRouter = require('./user');

module.exports = (app, passport) => {
  // Create a master router for all API endpoints
  const apiRouter = express.Router();

  authRouter(apiRouter, passport);
  cartRouter(apiRouter);
  orderRouter(apiRouter);
  productRouter(apiRouter);
  userRouter(apiRouter);

  // Mount the master router to the main app with the prefix
  app.use('/api', apiRouter);
}