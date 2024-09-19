const { body } = require('express-validator');
const validateResultsMiddleware = require('../../middlewares/validateResults.middleware');

const registerValidation = [
  body('fullName')
    .exists()
    .withMessage('Field fullName is required')
    .notEmpty()
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage('Field fullName must be between 3 and 50 characters')
    .escape()
    .toLowerCase(),
  body('email')
    .exists()
    .withMessage('Field email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password')
    .exists()
    .withMessage('Field password is required')
    .notEmpty()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Field password must be between 6 and 20 characters'),
  validateResultsMiddleware,
];

const loginValidation = [
  body('email')
    .exists()
    .withMessage('Field email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password').exists().withMessage('Field password is required').notEmpty().trim(),
  validateResultsMiddleware,
];

const forgotPassword = [
  body('email')
    .exists()
    .withMessage('Field email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  validateResultsMiddleware,
];

const passwordReset = [
  body('password')
    .exists()
    .withMessage('Field password is required')
    .notEmpty()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Field password must be between 6 and 20 characters'),
  validateResultsMiddleware,
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPassword,
  passwordReset,
};
