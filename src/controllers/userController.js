const jwt = require('jsonwebtoken')

const userService = require('../services/userService')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')

const catchAsync = require('../utils/catchAsync')
const requireField = require('./../utils/requireField')
const translatorNext = require('../utils/translatorNext')


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
  const tokenMessage = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
  //res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
    
  //if (process.env.NODE_ENV === 'production') token = undefined;

  res.status(statusCode).json({
    status: 'success',
    tokenMessage,
    data: {
      user
    }
  });
};

exports.registerUserController = catchAsync(async (req,res,next)=>{
  const {token,externalUserId,userName} = req.body

  if (requireField(token,externalUserId,userName)) {
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
  }
  const response = await userService.registerUserService(token,externalUserId,userName) 

  createSendToken(response.data, response.status, res);
})


exports.updateSettingUserController = catchAsync(async (req,res,next)=>{

    const {id:userId} = req.params

    const {notification,language} = req.body

    if (requireField(notification,language)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await userService.updateSettingUserService(userId,notification,language) 

    resSend(res,{statusCode:response.status,status:response.success,data:response.data})
})


exports.getAllUserController = catchAsync(async (req,res,next)=>{
  const id = req.userId
  console.log("id",id)
  const response = await userService.getAllUserService({ _id: { $ne: id } });

  resSend(res,{statusCode:response.status,status:response.success,data:response.data})
})

exports.getUserController = catchAsync(async (req,res,next)=>{
    const {id:userId} = req.params

    if (requireField(userId)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await userService.getUserService(userId) 

    resSend(res,{statusCode:response.status,status:response.success,data:response.data})
})

exports.updateStatusUserController = catchAsync(async (req, res, next) => {
    const { id: userId } = req.params;
    const { status } = req.body;

    if (requireField(userId) || requireField(status)) {
        return next(new appError(translatorNext(req, 'MISSING_REQUIRED_FIELDS'), 400));
    }

    if (!['online', 'offline', 'away'].includes(status)) {
        return next(new appError(translatorNext(req, 'INVALID_STATUS_VALUE'), 400));
    }

    const response = await userService.updateStatusUserService(userId, status);

    resSend(res, { statusCode: response.status, status: response.success, data: response.data });
});