const router = require('express').Router();
const chatController = require('../controllers/chat.controller');
const jwtValidation = require('../middlewares/jwt.middleware');

router.get('/search/:searchTerm', jwtValidation, chatController.searchByTerm);
router.patch('/:chatId/pin', jwtValidation, chatController.togglePinned);

module.exports = router;
