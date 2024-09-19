const router = require('express').Router();
const authRouter = require('../routes/auth.route');
const userRouter = require('../routes/user.route');
const chatRouter = require('../routes/chat.route');

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/chats', chatRouter);

module.exports = router;
