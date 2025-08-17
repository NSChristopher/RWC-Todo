const express = require('express');
const db = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user statistics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total todos
    const totalTodos = await db.todo.count({
      where: { userId }
    });

    // Get completed todos
    const completedTodos = await db.todo.count({
      where: { 
        userId,
        completed: true 
      }
    });

    // Get total subtasks
    const totalSubtasks = await db.subtask.count({
      where: { 
        todo: { userId }
      }
    });

    // Get completed subtasks
    const completedSubtasks = await db.subtask.count({
      where: { 
        completed: true,
        todo: { userId }
      }
    });

    // Calculate completion rate
    const totalTasks = totalTodos + totalSubtasks;
    const completedTasks = completedTodos + completedSubtasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const stats = {
      totalTodos,
      completedTodos,
      totalSubtasks,
      completedSubtasks,
      completionRate: Math.round(completionRate * 100) / 100 // Round to 2 decimal places
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;