const AppError = require('../utils/appError');

const emitError = (socket, dataError) => {
  console.log("dataError",dataError)
  socket.emit("clientError", dataError);
  socket.disconnect()
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (socket, err) => {
  emitError(socket, {
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (socket, err) => {
  if (err.isOperational) {
    emitError(socket, {
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR', err);
    emitError(socket, {
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (socket, err) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(socket, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(socket, error);
  }
};