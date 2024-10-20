const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const { isAuthenticated } = require("../middleware/auth");

// Create a new category
router.post("/categories", isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const newCategory = new Category({ name, user: req.user.userId });
    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
});

// Get all categories of the logged-in user
router.get("/categories", isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.userId });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
});

// Edit a category by ID
router.put("/categories/:id", isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { name },
      { new: true } 
    );

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found or not authorized to edit" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
});

// Delete a category by ID
router.delete("/categories/:id", isAuthenticated, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found or not authorized to delete" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
});

module.exports = router;
