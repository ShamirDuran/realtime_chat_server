const router = require('express').Router();
const jwtValidation = require('../middlewares/jwt.middleware');
const userController = require('../controllers/user.controller');
const userValidation = require('../routes/validations/user.validation');

router.get('/', jwtValidation, userValidation.getAllValidation, userController.getAll);
router.get('/:id', jwtValidation, userController.getById);

/// User update routes
router.put(
  '/update/name',
  jwtValidation,
  userValidation.updateNameValidation,
  userController.updateName
);

router.put(
  '/update/about',
  jwtValidation,
  userValidation.updateDescriptionValidation,
  userController.updateDescription
);

module.exports = router;
