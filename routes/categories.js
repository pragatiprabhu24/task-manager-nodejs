const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { isAuthenticated } = require("../middleware/auth");

// create a new category
router.post("/categories", isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const newCategory = new Category({ name, user: req.session.user._id });
    await newCategory.save();

    res
      .status(201)
      .json({
        message: "Category created successfully",
        category: newCategory,
      });
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
});

//  get all categories of the logged-in user
router.get("/categories", isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.session.user._id });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
});

//  delete a category by ID
router.delete("/categories/:id", isAuthenticated, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.session.user._id,
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
