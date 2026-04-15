import User from "../models/user.model.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
} from "../utils/tokens.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const issueTokens = (res, user) => {
  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Set HTTP-only cookies
  res.cookie("access_token", accessToken, accessCookieOptions());
  res.cookie("refresh_token", refreshToken, refreshCookieOptions());

  return { accessToken, refreshToken };
};

// POST /api/v1/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(409, "Email already registered.");

    const user = await User.create({ name, email, password });
    const { refreshToken } = issueTokens(res, user);

    // Store hashed refresh token
    user.refreshTokens = [refreshToken];
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshTokens +isActive",
    );
    if (!user) throw new ApiError(401, "Invalid email or password.");
    if (!user.isActive)
      throw new ApiError(403, "Account deactivated. Contact support.");

    const valid = await user.comparePassword(password);
    if (!valid) throw new ApiError(401, "Invalid email or password.");

    const { refreshToken } = issueTokens(res, user);

    // Keep max 5 refresh tokens per user (multi-device)
    user.refreshTokens = [
      ...(user.refreshTokens || []).slice(-4),
      refreshToken,
    ];
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/refresh
export const refreshTokens = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw new ApiError(401, "No refresh token.");

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      res.clearCookie("access_token", clearCookieOptions());
      res.clearCookie("refresh_token", clearCookieOptions());
      throw new ApiError(
        401,
        "Invalid or expired refresh token. Please log in again.",
      );
    }

    const user = await User.findById(decoded.id).select(
      "+refreshTokens +isActive",
    );
    if (!user || !user.isActive) throw new ApiError(401, "User not found.");

    // Token rotation — invalidate old, issue new
    const tokenIndex = user.refreshTokens.indexOf(token);
    if (tokenIndex === -1) {
      // Token reuse detected — revoke all tokens (security breach)
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      res.clearCookie("access_token", clearCookieOptions());
      res.clearCookie("refresh_token", clearCookieOptions());
      throw new ApiError(401, "Token reuse detected. All sessions revoked.");
    }

    const { refreshToken: newRefresh } = issueTokens(res, user);
    user.refreshTokens[tokenIndex] = newRefresh;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: "Tokens refreshed." });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/logout
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;

    if (token && req.user) {
      const user = await User.findById(req.user._id).select("+refreshTokens");
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save({ validateBeforeSave: false });
      }
    }

    res.clearCookie("access_token", clearCookieOptions());
    res.clearCookie("refresh_token", {
      ...clearCookieOptions(),
      path: "/api/v1/auth/refresh",
    });

    res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toPublic() });
};

// PATCH /api/v1/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select(
      "+password +refreshTokens",
    );

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new ApiError(400, "Current password is incorrect.");

    user.password = newPassword;
    user.refreshTokens = []; // revoke all sessions on password change
    await user.save();

    res.clearCookie("access_token", clearCookieOptions());
    res.clearCookie("refresh_token", clearCookieOptions());

    res
      .status(200)
      .json({
        success: true,
        message: "Password changed. Please log in again.",
      });
  } catch (err) {
    next(err);
  }
};
