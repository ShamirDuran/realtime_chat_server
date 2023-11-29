const router = require('express').Router();
const authRouter = require('../routes/auth.route');

router.use('/auth', authRouter);

module.exports = router;
