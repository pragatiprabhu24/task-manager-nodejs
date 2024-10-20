const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const { isAuthenticated } = require('../middleware/auth');


//  get all tasks for the logged-in user, with optional filtering by status or category
router.get('/tasks', isAuthenticated, async (req, res) => {
    try {
       const { status, category } = req.query;
       
     
       const filter = { user: req.session.user._id };
       
   
       if (status) {
          filter.status = status;
       }
       
  
       if (category) {
          filter.category = category;
       }
 

       const tasks = await Task.find(filter).populate('category', 'name'); 
       res.status(200).json({ tasks });
    } catch (error) {
       res.status(500).json({ message: 'Error fetching tasks', error });
    }
 });

//  create a new task
router.post('/tasks', isAuthenticated, async (req, res) => {
    try {
       const { title, description, status, dueDate, category } = req.body;
 
       if (!title) {
          return res.status(400).json({ message: 'Task title is required' });
       }
 
       const newTask = new Task({
          title,
          description,
          status,
          dueDate,
          category,
          user: req.session.user._id
       });
 
       await newTask.save();
       res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
       res.status(500).json({ message: 'Error creating task', error });
    }
 });
 
 // update a task 
 router.put('/tasks/:id', isAuthenticated, async (req, res) => {
    try {
       const { title, description, status, dueDate, category } = req.body;
 
       const updates = {};
       if (title) updates.title = title;
       if (description) updates.description = description;
       if (status) updates.status = status;
       if (dueDate) updates.dueDate = dueDate;
       if (category) updates.category = category; 
 
       const updatedTask = await Task.findOneAndUpdate(
          { _id: req.params.id, user: req.session.user._id },
          updates,
          { new: true }
       );
 
       if (!updatedTask) {
          return res.status(404).json({ message: 'Task not found or not authorized to update' });
       }
 
       res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
       res.status(500).json({ message: 'Error updating task', error });
    }
 });

//  delete a task
router.delete('/tasks/:id', isAuthenticated, async (req, res) => {
   try {
    
      const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.session.user._id });

      if (!deletedTask) {
         return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json({ message: 'Task deleted successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Error deleting task', error });
   }
});

module.exports = router;
