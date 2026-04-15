import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/v1/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users.map((u) => u.toPublic()),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/admin/users/:id/role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "moderator", "admin"].includes(role)) {
      throw new ApiError(400, "Invalid role.");
    }

    if (req.params.id === req.user._id.toString()) {
      throw new ApiError(400, "Cannot change your own role.");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    );

    if (!user) throw new ApiError(404, "User not found.");

    res.status(200).json({ success: true, data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/admin/users/:id/toggle-active
export const toggleUserActive = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      throw new ApiError(400, "Cannot deactivate your own account.");
    }

    const user = await User.findById(req.params.id).select(
      "+isActive +refreshTokens",
    );
    if (!user) throw new ApiError(404, "User not found.");

    user.isActive = !user.isActive;
    if (!user.isActive) user.refreshTokens = []; // revoke all sessions on deactivate
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}.`,
      data: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const [userCount, taskCount, roleStats, statusStats] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments({ isArchived: false }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Task.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: userCount,
          byRole: Object.fromEntries(roleStats.map((r) => [r._id, r.count])),
        },
        tasks: {
          total: taskCount,
          byStatus: Object.fromEntries(
            statusStats.map((s) => [s._id, s.count]),
          ),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
