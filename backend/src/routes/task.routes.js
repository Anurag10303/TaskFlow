import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createTaskValidator,
  updateTaskValidator,
  taskQueryValidator,
  validate,
} from "../validations/validators.js";

const router = express.Router();

router.use(protect); // all task routes require auth

router.get("/stats", getTaskStats);
router.get("/", taskQueryValidator, validate, getTasks);
router.post("/", createTaskValidator, validate, createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTaskValidator, validate, updateTask);
router.delete("/:id", deleteTask);

export default router;
