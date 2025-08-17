const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const db = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Direct database access for complex queries
const database = new Database(path.join(__dirname, '..', 'prisma', 'dev.db'));

// Get all todos for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const todos = db.todo.findMany({
      where: {
        authorId: req.user.userId
      },
      include: {
        subtasks: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        notes: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single todo
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = db.todo.findUnique({
      where: { 
        id: parseInt(id),
        authorId: req.user.userId
      },
      include: {
        subtasks: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        notes: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new todo
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, dueDate, subtasks = [], notes = [] } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = db.todo.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        authorId: req.user.userId,
        subtasks: {
          create: subtasks.map(subtask => ({
            title: subtask.title,
            completed: subtask.completed || false
          }))
        },
        notes: {
          create: notes.map(note => ({
            content: note.content
          }))
        }
      },
      include: {
        subtasks: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        notes: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update todo
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate } = req.body;

    // Check if todo belongs to user
    const existingTodo = db.todo.findUnique({
      where: { 
        id: parseInt(id),
        authorId: req.user.userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = db.todo.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null })
      },
      include: {
        subtasks: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        notes: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete todo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if todo belongs to user
    const existingTodo = db.todo.findUnique({
      where: { 
        id: parseInt(id),
        authorId: req.user.userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    db.todo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subtask
router.put('/subtasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    // Check if subtask belongs to user's todo
    const subtask = db.subtask.findUnique({
      where: { id: parseInt(id) },
      include: {
        todo: true
      }
    });

    if (!subtask || subtask.todo.authorId !== req.user.userId) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    const updatedSubtask = db.subtask.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed })
      }
    });

    res.json(updatedSubtask);
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add subtask
router.post('/:todoId/subtasks', authenticateToken, async (req, res) => {
  try {
    const { todoId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Check if todo belongs to user
    const todo = db.todo.findUnique({
      where: { 
        id: parseInt(todoId),
        authorId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const subtask = db.subtask.create({
      data: {
        title,
        todoId: parseInt(todoId)
      }
    });

    res.status(201).json(subtask);
  } catch (error) {
    console.error('Create subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add note
router.post('/:todoId/notes', authenticateToken, async (req, res) => {
  try {
    const { todoId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if todo belongs to user
    const todo = db.todo.findUnique({
      where: { 
        id: parseInt(todoId),
        authorId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const note = db.note.create({
      data: {
        content,
        todoId: parseInt(todoId)
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalTodos = db.todo.count({
      where: { authorId: userId }
    });

    const completedTodos = db.todo.findMany({
      where: { 
        authorId: userId,
        completed: true 
      }
    }).length;

    const allSubtasks = db.subtask.count({
      where: {
        todo: {
          authorId: userId
        }
      }
    });

    const completedSubtasks = db.subtask.count({
      where: {
        completed: true,
        todo: {
          authorId: userId
        }
      }
    });

    const recentlyCompletedQuery = database.prepare(`
      SELECT id, title, updatedAt FROM Todo 
      WHERE authorId = ? AND completed = 1 
      ORDER BY updatedAt DESC 
      LIMIT 5
    `);
    const recentlyCompleted = recentlyCompletedQuery.all(userId);

    res.json({
      totalTodos,
      completedTodos,
      totalSubtasks: allSubtasks,
      completedSubtasks,
      recentlyCompleted
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;