const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// GET tutte le attività
router.get('/', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

// POST aggiungere una nuova attività
router.post('/', async (req, res) => {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
});

// PUT modificare un'attività
router.put('/:id', async (req, res) => {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
});

// DELETE eliminare un'attività
router.delete('/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task eliminato' });
});

module.exports = router;
