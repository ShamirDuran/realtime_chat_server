const router = require('express').Router();
const jwtValidation = require('../middlewares/jwt.middleware');
const userController = require('../controllers/user.controller');

router.get('/:id', jwtValidation, userController.getById);
router.get('/getAll', jwtValidation, userController.getAll);

module.exports = router;
