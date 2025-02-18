const express = require("express");
const router = express.Router();
const Task = require("../models/task");

const { body, validationResult } = require("express-validator");

const validateTask = [
  body("title").isLength({ min: 1 }).withMessage("Title is required"),
  body("description")
    .isLength({ min: 1 })
    .withMessage("Description is required"),
  body("completed").isBoolean().withMessage("Completed must be a boolean"),
];

const authMiddleware = require("../middlewares/authMiddleware");

// GET all tasks
router.get("/", authMiddleware, async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// POST add a new task
router.post("/", authMiddleware, validateTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

// PUT update a task
router.put("/:id", authMiddleware, validateTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedTask);
});

// DELETE remove a task
router.delete("/:id", authMiddleware, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

module.exports = router;
