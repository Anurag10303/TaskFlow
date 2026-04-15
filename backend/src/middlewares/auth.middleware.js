import { verifyAccessToken } from "../utils/tokens.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    // Read from HTTP-only cookie (primary) or Authorization header (API clients)
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) throw new ApiError(401, "Not authenticated. Please log in.");

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("+isActive");

    if (!user) throw new ApiError(401, "User no longer exists.");
    if (!user.isActive)
      throw new ApiError(403, "Your account has been deactivated.");

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return next(new ApiError(401, "Session expired. Please log in again."));
    if (err.name === "JsonWebTokenError")
      return next(new ApiError(401, "Invalid token."));
    next(err);
  }
};
