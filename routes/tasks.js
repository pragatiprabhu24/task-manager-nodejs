const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const { isAuthenticated } = require("../middleware/auth");

// Get all tasks

router.get("/tasks", isAuthenticated, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 8 } = req.query;

    const filter = { user: req.user.userId };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const tasks = await Task.find(filter)
      .populate("category", "name")
      .skip(skip)
      .limit(limitNumber);

    const totalTasks = await Task.countDocuments(filter);

    res.status(200).json({
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// Create a new task
router.post("/tasks", isAuthenticated, async (req, res) => {
  try {
    const { title, description, status, dueDate, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const newTask = new Task({
      title,
      description,
      status,
      dueDate,
      category: category || undefined,
      user: req.user.userId,
    });

    await newTask.save();

    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
});

// Update a task
router.put("/tasks/:id", isAuthenticated, async (req, res) => {
  try {
    const { title, description, status, dueDate, category } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (status) updates.status = status;
    if (dueDate) updates.dueDate = dueDate;
    if (category) updates.category = category;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updates,
      { new: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or not authorized to update" });
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
});

// Delete a task
router.delete("/tasks/:id", isAuthenticated, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
});

module.exports = router;
