const createError = require('http-errors');
const { body, param, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, errors.array()[0].msg));
  }
  return next();
}

const registerRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('firstName must be 50 characters or fewer'),
  body('lastName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('lastName must be 50 characters or fewer'),
  validate
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

const addCartItemRules = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
  body('qty')
    .isInt({ min: 1 })
    .withMessage('qty must be a positive integer')
    .toInt(),
  validate
];

const updateCartItemRules = [
  param('cartItemId')
    .isInt({ min: 1 })
    .withMessage('cartItemId must be a positive integer')
    .toInt(),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer')
    .toInt(),
  body('qty')
    .optional()
    .isInt({ min: 1 })
    .withMessage('qty must be a positive integer')
    .toInt(),
  validate
];

const cartItemIdParam = [
  param('cartItemId')
    .isInt({ min: 1 })
    .withMessage('cartItemId must be a positive integer')
    .toInt(),
  validate
];

const addressFieldRules = [
  ['fullName', 100, 'full name'],
  ['line1', 200, 'address line'],
  ['city', 100, 'city'],
  ['region', 100, 'state or region'],
  ['postalCode', 20, 'postal code'],
  ['country', 100, 'country']
];

function addressRules(prefix, label) {
  return [
    body(prefix)
      .isObject()
      .withMessage(`${label} is required`),
    ...addressFieldRules.map(([field, max, fieldLabel]) => body(`${prefix}.${field}`)
      .trim()
      .notEmpty()
      .withMessage(`Enter a ${fieldLabel} for the ${label.toLowerCase()}`)
      .isLength({ max })
      .withMessage(`${label} ${fieldLabel} is too long`)),
    body(`${prefix}.line2`)
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ max: 200 })
      .withMessage(`${label} address line 2 is too long`)
  ];
}

const checkoutRules = [
  body('cartId')
    .isInt({ min: 1 })
    .withMessage('cartId must be a positive integer')
    .toInt(),
  body('paymentInfo.id')
    .isString()
    .matches(/^tok_[A-Za-z0-9]+$/)
    .withMessage('A valid card token is required'),
  ...addressRules('shippingAddress', 'Delivery address'),
  ...addressRules('billingAddress', 'Billing address'),
  validate
];

const userIdParam = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer')
    .toInt(),
  validate
];

const updateUserRules = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer')
    .toInt(),
  body('password')
    .not()
    .exists()
    .withMessage('Password cannot be updated here'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('firstName must be 50 characters or fewer'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('lastName must be 50 characters or fewer'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  validate
];

const orderIdParam = [
  param('orderId')
    .trim()
    .custom((value) => {
      if (/^\d+$/.test(value) && Number(value) > 0) return true;
      if (/^EC[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/i.test(value)) return true;
      throw new Error('orderId is invalid');
    }),
  validate
];

const productIdParam = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
  validate
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  addCartItemRules,
  updateCartItemRules,
  cartItemIdParam,
  checkoutRules,
  userIdParam,
  updateUserRules,
  orderIdParam,
  productIdParam
};
