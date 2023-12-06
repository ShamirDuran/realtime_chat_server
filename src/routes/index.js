const router = require('express').Router();
const authRouter = require('../routes/auth.route');
const userRouter = require('../routes/user.route');

router.use('/auth', authRouter);
router.use('/users', userRouter);

module.exports = router;
