import Task from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/v1/tasks
export const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      tags,
      page = 1,
      limit = 10,
      sort = "-createdAt",
      archived,
    } = req.query;

    const filter = {};

    // Admins/moderators see all tasks; users see own + assigned
    if (req.user.role === "user") {
      filter.$or = [{ createdBy: req.user._id }, { assignedTo: req.user._id }];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (archived === "true") filter.isArchived = true;
    else filter.isArchived = false;

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagList };
    }

    if (search) {
      filter.$or = [
        ...(filter.$or || []),
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const allowedSorts = [
      "createdAt",
      "-createdAt",
      "dueDate",
      "-dueDate",
      "priority",
      "title",
    ];
    const sortField = allowedSorts.includes(sort) ? sort : "-createdAt";

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email")
        .sort(sortField)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/tasks/:id
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email");

    if (!task) throw new ApiError(404, "Task not found.");

    const isOwner = task.createdBy._id.toString() === req.user._id.toString();
    const isAssigned =
      task.assignedTo?._id?.toString() === req.user._id.toString();
    const isElevated = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isAssigned && !isElevated) {
      throw new ApiError(403, "Not authorized to view this task.");
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, tags, dueDate, assignedTo } =
      req.body;

    // Only admins/moderators can assign tasks to others
    const assignee =
      ["admin", "moderator"].includes(req.user.role) && assignedTo
        ? assignedTo
        : req.user._id;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      tags: tags?.map((t) => t.toLowerCase().trim()) ?? [],
      dueDate: dueDate || null,
      assignedTo: assignee,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: "createdBy", select: "name email role" },
      { path: "assignedTo", select: "name email" },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw new ApiError(404, "Task not found.");

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const isElevated = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isElevated) {
      throw new ApiError(403, "Not authorized to update this task.");
    }

    const allowed = [
      "title",
      "description",
      "status",
      "priority",
      "tags",
      "dueDate",
    ];
    // Only admin can reassign
    if (isElevated) allowed.push("assignedTo", "isArchived");

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    if (req.body.tags) {
      task.tags = req.body.tags.map((t) => t.toLowerCase().trim());
    }

    await task.save();
    await task.populate([
      { path: "createdBy", select: "name email role" },
      { path: "assignedTo", select: "name email" },
    ]);

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw new ApiError(404, "Task not found.");

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const isElevated = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isElevated) {
      throw new ApiError(403, "Not authorized to delete this task.");
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: "Task deleted." });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/tasks/stats  (admin/moderator only)
export const getTaskStats = async (req, res, next) => {
  try {
    const matchStage =
      req.user.role === "user"
        ? {
            $match: {
              $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
              isArchived: false,
            },
          }
        : { $match: { isArchived: false } };

    const [statusStats, priorityStats, totalCount] = await Promise.all([
      Task.aggregate([
        matchStage,
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        matchStage,
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Task.countDocuments(
        req.user.role === "user"
          ? {
              $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
              isArchived: false,
            }
          : { isArchived: false },
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        byStatus: Object.fromEntries(statusStats.map((s) => [s._id, s.count])),
        byPriority: Object.fromEntries(
          priorityStats.map((p) => [p._id, p.count]),
        ),
      },
    });
  } catch (err) {
    next(err);
  }
};
