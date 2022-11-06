import { Request, Response, NextFunction } from 'express';

import ErrorResponse from '../utils/Error';
import Logging from '../utils/log';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };

  // log the error in developer console
  Logging.error(err.stack);

  // Bad Mongoose ID Error
  if (err.name === 'CastError') {
    const message = 'Quelque chose ne va pas. Essayez à nouveau';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Duplicate Field Error
  // @ts-ignore
  if (err.code === 11000) {
    const message = 'Une valeur entrée en double !!!';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(
      (value: any) => value.message
    );
    error = new ErrorResponse(message.join(''), 400);
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || err.message || 'Server Error',
  });
};

export default errorHandler;
