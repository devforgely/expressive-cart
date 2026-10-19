const createError = require('http-errors');

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return next(createError(401, 'Authentication required'));
}

function requireSelf(req, res, next) {
  const requestedId = Number(req.params.userId);
  const sessionId = Number(req.user && req.user.id);

  if (!sessionId || requestedId !== sessionId) {
    return next(createError(403, 'You can only access your own account'));
  }

  return next();
}

module.exports = {
  requireAuth,
  requireSelf
};
