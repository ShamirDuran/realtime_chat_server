const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authValidation = require('./validations/auth.validation');

router.post(
  '/register',
  authValidation.registerValidation,
  authController.register,
  authController.sendVerificationEmail
);

router.post('/login', authValidation.loginValidation, authController.login);
router.get('/verify_account/:token', authController.verify);

router.post(
  '/forgot_password',
  authValidation.forgotPassword,
  authController.forgotPassword
);

router.post(
  '/password_reset',
  authValidation.passwordReset,
  authController.passwordReset
);

module.exports = router;
