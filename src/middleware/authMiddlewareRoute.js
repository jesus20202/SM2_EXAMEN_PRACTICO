const userService = require('../services/userService')
const appError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync')
const translatorNext = require('../utils/translatorNext')
const util = require('util');
const promisify = util.promisify;
const jwt = require('jsonwebtoken')


module.exports = catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
  
    if (!token) {
      return next(
        new appError(translatorNext(req,'ERROR_NOT_TOKEN'), 401)
      );
    }
    
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await userService.getUserService(decoded.id);

    if (!currentUser.data) {
      return next(
        new appError(translatorNext(req,'ERROR_USER_NOT_EXIST'),401
        )
      );
    }

    req.userId = currentUser.data._id;
    next();
})