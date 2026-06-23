import { ApiError } from '../util/ApiError.js';

export const errorHandler = (err, req, res, next) => {
 if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    err = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  const response = {
    success: err.success,
    statusCode: err.statusCode,
    message: err.message,
    errors: err.errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  return res.status(err.statusCode).json(response);
};

export default errorHandler;