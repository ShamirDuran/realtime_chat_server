const { query } = require('express-validator');
const validateResultsMiddleware = require('../../middlewares/validateResults.middleware');

const getAllValidation = [
  query('name').optional().isString().withMessage('name must be a string').toLowerCase(),
  query('onlyEnabled')
    .optional()
    .isBoolean()
    .withMessage('onlyEnabled must be a boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a number'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a number'),
  validateResultsMiddleware,
];

const updateNameValidation = [
  body('name')
    .isString('name must be a string')
    .length({ min: 3, max: 15 }, 'name must be between 3 and 15 characters')
    .required('name is required'),
  validateResultsMiddleware,
];

const updateDescriptionValidation = [
  body('description')
    .optional()
    .isString('description must be a string')
    .max(100, 'description must be less than 100 characters'),
  validateResultsMiddleware,
];

module.exports = {
  getAllValidation,
  updateNameValidation,
  updateDescriptionValidation,
};
