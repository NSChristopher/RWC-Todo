const express = require('express');
const db = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all todos for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const todos = await db.todo.findMany({
      where: { userId: req.user.userId },
      include: {
        subtasks: true,
        notes: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
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
    const todo = await db.todo.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      },
      include: {
        subtasks: true,
        notes: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
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
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = await db.todo.create({
      data: {
        title,
        description,
        dueDate: dueDate || null,
        userId: req.user.userId
      },
      include: {
        subtasks: true,
        notes: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
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
    const { title, description, dueDate, completed } = req.body;

    const existingTodo = await db.todo.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;
    if (completed !== undefined) updateData.completed = completed;

    const todo = await db.todo.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        subtasks: true,
        notes: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
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

    const existingTodo = await db.todo.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await db.todo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subtask
router.post('/:id/subtasks', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Verify todo belongs to user
    const todo = await db.todo.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const subtask = await db.subtask.create({
      data: {
        title,
        todoId: parseInt(id)
      }
    });

    res.status(201).json(subtask);
  } catch (error) {
    console.error('Create subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subtask
router.put('/:todoId/subtasks/:subtaskId', authenticateToken, async (req, res) => {
  try {
    const { todoId, subtaskId } = req.params;
    const { title, completed } = req.body;

    // Verify todo belongs to user
    const todo = await db.todo.findFirst({
      where: { 
        id: parseInt(todoId),
        userId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const subtask = await db.subtask.update({
      where: { id: parseInt(subtaskId) },
      data: updateData
    });

    res.json(subtask);
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subtask
router.delete('/:todoId/subtasks/:subtaskId', authenticateToken, async (req, res) => {
  try {
    const { todoId, subtaskId } = req.params;

    // Verify todo belongs to user
    const todo = await db.todo.findFirst({
      where: { 
        id: parseInt(todoId),
        userId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await db.subtask.delete({
      where: { id: parseInt(subtaskId) }
    });

    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create note
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify todo belongs to user
    const todo = await db.todo.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const note = await db.note.create({
      data: {
        content,
        todoId: parseInt(id)
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete note
router.delete('/:todoId/notes/:noteId', authenticateToken, async (req, res) => {
  try {
    const { todoId, noteId } = req.params;

    // Verify todo belongs to user
    const todo = await db.todo.findFirst({
      where: { 
        id: parseInt(todoId),
        userId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await db.note.delete({
      where: { id: parseInt(noteId) }
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;