const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authValidation = require('./validations/auth.validation');

router.post(
  '/register',
  authValidation.registerValidation,
  authController.register,
  authController.sendOtp
);

router.post('/login', authValidation.loginValidation, authController.login);

module.exports = router;
