const express = require("express");
const router = express.Router();
const Task = require("../models/task");

const authMiddleware = require("../middlewares/auth");
const { validationResult, validateTask } = require("../middlewares/validation");

// GET all tasks for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create a new task
router.post("/", authMiddleware, validateTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if a task with the same title already exists for the user
    const existingTask = await Task.findOne({
      title: req.body.title,
      user: req.user.userId,
    });
    if (existingTask) {
      return res
        .status(400)
        .json({ error: "A task with this title already exists" });
    }

    const newTask = new Task({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed,
      user: req.user.userId,
    });

    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update a task (only if it belongs to the user)
router.put("/:id", authMiddleware, validateTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if another task with the same title already exists for the user
    const existingTask = await Task.findOne({
      title: req.body.title,
      user: req.user.userId,
      _id: { $ne: req.params.id },
    });
    if (existingTask) {
      return res
        .status(400)
        .json({ error: "A task with this title already exists" });
    }

    Object.assign(task, req.body);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE remove a task (only if it belongs to the user)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
