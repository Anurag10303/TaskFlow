import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}.`);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} — ${message}`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors?.length ? error.errors : undefined,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};