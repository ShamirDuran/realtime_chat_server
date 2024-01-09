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

module.exports = {
  getAllValidation,
};
