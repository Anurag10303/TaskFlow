import { ApiError } from "../utils/ApiError.js";

// Role hierarchy: user < moderator < admin
const ROLE_LEVELS = { user: 1, moderator: 2, admin: 3 };

/**
 * Restrict to specific roles only
 * Usage: restrictTo("admin") or restrictTo("admin", "moderator")
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Required roles: ${roles.join(", ")}`),
      );
    }
    next();
  };
};

/**
 * Restrict to minimum role level
 * Usage: requireLevel("moderator") — allows moderator AND admin
 */
export const requireLevel = (minRole) => {
  return (req, res, next) => {
    const userLevel = ROLE_LEVELS[req.user.role] ?? 0;
    const required = ROLE_LEVELS[minRole] ?? 99;
    if (userLevel < required) {
      return next(
        new ApiError(403, `Requires at least ${minRole} privileges.`),
      );
    }
    next();
  };
};

/**
 * Check if user owns the resource OR has elevated role
 * Usage: after fetching resource, call this inline
 */
export const canAccess = (resourceOwnerId, userRole) => {
  if (["admin", "moderator"].includes(userRole)) return true;
  return resourceOwnerId?.toString() === userRole.toString();
};
