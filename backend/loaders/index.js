const expressLoader = require('./express');
const passportLoader = require('./passport');
const routeLoader = require('../routes');
const swaggerLoader = require('./swagger');

module.exports = async (app) => {

  const expressApp = await expressLoader(app);
  const passport = await passportLoader(expressApp);

  await routeLoader(app, passport);
  await swaggerLoader(app);

  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return res.status(status).send({ message });
  });
};
