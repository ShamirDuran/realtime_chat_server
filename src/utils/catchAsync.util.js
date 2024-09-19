const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      const errorStatus = 500;
      const errorMsg = 'Internal Server Error';

      console.log(err);

      res.status(errorStatus).json({
        status: false,
        msg: errorMsg,
      });

      next(err);
    });
  };
};

module.exports = catchAsync;
