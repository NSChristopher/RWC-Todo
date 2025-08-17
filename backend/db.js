const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Simple SQLite database initialization
const db = new Database(path.join(__dirname, 'prisma', 'dev.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    published INTEGER DEFAULT 0,
    authorId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES User(id)
  );

  CREATE TABLE IF NOT EXISTS Todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    dueDate DATETIME,
    completed INTEGER DEFAULT 0,
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
  );

  CREATE TABLE IF NOT EXISTS Subtask (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    todoId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (todoId) REFERENCES Todo(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Note (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    todoId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (todoId) REFERENCES Todo(id) ON DELETE CASCADE
  );
`);

// Simple ORM-like interface
const createUser = db.prepare(`
  INSERT INTO User (email, username, password) 
  VALUES (?, ?, ?)
`);

const findUserByEmail = db.prepare(`
  SELECT * FROM User WHERE email = ?
`);

const findUserById = db.prepare(`
  SELECT * FROM User WHERE id = ?
`);

const createPost = db.prepare(`
  INSERT INTO Post (title, content, published, authorId) 
  VALUES (?, ?, ?, ?)
`);

const findAllPosts = db.prepare(`
  SELECT p.*, u.username, u.email 
  FROM Post p 
  JOIN User u ON p.authorId = u.id 
  ORDER BY p.createdAt DESC
`);

const findPostById = db.prepare(`
  SELECT p.*, u.username, u.email 
  FROM Post p 
  JOIN User u ON p.authorId = u.id 
  WHERE p.id = ?
`);

const updatePost = db.prepare(`
  UPDATE Post 
  SET title = ?, content = ?, published = ?, updatedAt = CURRENT_TIMESTAMP 
  WHERE id = ?
`);

const deletePost = db.prepare(`
  DELETE FROM Post WHERE id = ?
`);

// Todo queries
const createTodo = db.prepare(`
  INSERT INTO Todo (title, description, dueDate, userId) 
  VALUES (?, ?, ?, ?)
`);

const findAllTodosByUser = db.prepare(`
  SELECT * FROM Todo WHERE userId = ? ORDER BY createdAt DESC
`);

const findTodoById = db.prepare(`
  SELECT * FROM Todo WHERE id = ?
`);

const findTodoByIdAndUser = db.prepare(`
  SELECT * FROM Todo WHERE id = ? AND userId = ?
`);

const updateTodo = db.prepare(`
  UPDATE Todo 
  SET title = ?, description = ?, dueDate = ?, completed = ?, updatedAt = CURRENT_TIMESTAMP 
  WHERE id = ?
`);

const deleteTodo = db.prepare(`
  DELETE FROM Todo WHERE id = ?
`);

const countTodosByUser = db.prepare(`
  SELECT COUNT(*) as count FROM Todo WHERE userId = ?
`);

const countCompletedTodosByUser = db.prepare(`
  SELECT COUNT(*) as count FROM Todo WHERE userId = ? AND completed = 1
`);

// Subtask queries
const createSubtask = db.prepare(`
  INSERT INTO Subtask (title, todoId) 
  VALUES (?, ?)
`);

const findSubtasksByTodoId = db.prepare(`
  SELECT * FROM Subtask WHERE todoId = ? ORDER BY createdAt DESC
`);

const findSubtaskById = db.prepare(`
  SELECT * FROM Subtask WHERE id = ?
`);

const updateSubtask = db.prepare(`
  UPDATE Subtask 
  SET title = ?, completed = ?, updatedAt = CURRENT_TIMESTAMP 
  WHERE id = ?
`);

const deleteSubtask = db.prepare(`
  DELETE FROM Subtask WHERE id = ?
`);

const countSubtasksByUser = db.prepare(`
  SELECT COUNT(*) as count FROM Subtask s 
  JOIN Todo t ON s.todoId = t.id 
  WHERE t.userId = ?
`);

const countCompletedSubtasksByUser = db.prepare(`
  SELECT COUNT(*) as count FROM Subtask s 
  JOIN Todo t ON s.todoId = t.id 
  WHERE t.userId = ? AND s.completed = 1
`);

// Note queries
const createNote = db.prepare(`
  INSERT INTO Note (content, todoId) 
  VALUES (?, ?)
`);

const findNotesByTodoId = db.prepare(`
  SELECT * FROM Note WHERE todoId = ? ORDER BY createdAt DESC
`);

const deleteNote = db.prepare(`
  DELETE FROM Note WHERE id = ?
`);

module.exports = {
  user: {
    create: (data) => {
      const result = createUser.run(data.email, data.username, data.password);
      return { id: result.lastInsertRowid, ...data };
    },
    findUnique: ({ where }) => {
      if (where.email) return findUserByEmail.get(where.email);
      if (where.id) return findUserById.get(where.id);
      return null;
    },
    findFirst: ({ where }) => {
      if (where.OR) {
        for (const condition of where.OR) {
          if (condition.email) {
            const user = findUserByEmail.get(condition.email);
            if (user) return user;
          }
          if (condition.username) {
            const user = db.prepare('SELECT * FROM User WHERE username = ?').get(condition.username);
            if (user) return user;
          }
        }
      }
      return null;
    }
  },
  post: {
    create: ({ data, include }) => {
      const result = createPost.run(data.title, data.content, data.published ? 1 : 0, data.authorId);
      const post = findPostById.get(result.lastInsertRowid);
      return {
        id: result.lastInsertRowid,
        title: data.title,
        content: data.content,
        published: Boolean(data.published),
        authorId: data.authorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: post.authorId,
          username: post.username,
          email: post.email
        }
      };
    },
    findMany: ({ include, orderBy }) => {
      const posts = findAllPosts.all();
      return posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        published: Boolean(post.published),
        authorId: post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          id: post.authorId,
          username: post.username,
          email: post.email
        }
      }));
    },
    findUnique: ({ where, include }) => {
      const post = findPostById.get(where.id);
      if (!post) return null;
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        published: Boolean(post.published),
        authorId: post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          id: post.authorId,
          username: post.username,
          email: post.email
        }
      };
    },
    update: ({ where, data, include }) => {
      const current = findPostById.get(where.id);
      if (!current) return null;
      
      const title = data.title ?? current.title;
      const content = data.content !== undefined ? data.content : current.content;
      const published = data.published !== undefined ? (data.published ? 1 : 0) : current.published;
      
      updatePost.run(title, content, published, where.id);
      
      return {
        id: current.id,
        title,
        content,
        published: Boolean(published),
        authorId: current.authorId,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
        author: {
          id: current.authorId,
          username: current.username,
          email: current.email
        }
      };
    },
    delete: ({ where }) => {
      deletePost.run(where.id);
      return {};
    }
  },
  todo: {
    create: ({ data, include }) => {
      const result = createTodo.run(
        data.title, 
        data.description || null, 
        data.dueDate || null, 
        data.userId
      );
      const todo = {
        id: result.lastInsertRowid,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate || null,
        completed: false,
        userId: data.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (include?.subtasks) {
        todo.subtasks = [];
      }
      if (include?.notes) {
        todo.notes = [];
      }
      if (include?.user) {
        const user = findUserById.get(data.userId);
        todo.user = {
          id: user.id,
          username: user.username,
          email: user.email
        };
      }
      
      return todo;
    },
    findMany: ({ where, include, orderBy }) => {
      const todos = findAllTodosByUser.all(where.userId);
      return todos.map(todo => {
        const result = {
          id: todo.id,
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate,
          completed: Boolean(todo.completed),
          userId: todo.userId,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt
        };
        
        if (include?.subtasks) {
          result.subtasks = findSubtasksByTodoId.all(todo.id).map(subtask => ({
            id: subtask.id,
            title: subtask.title,
            completed: Boolean(subtask.completed),
            todoId: subtask.todoId,
            createdAt: subtask.createdAt,
            updatedAt: subtask.updatedAt
          }));
        }
        if (include?.notes) {
          result.notes = findNotesByTodoId.all(todo.id).map(note => ({
            id: note.id,
            content: note.content,
            todoId: note.todoId,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
          }));
        }
        if (include?.user) {
          const user = findUserById.get(todo.userId);
          result.user = {
            id: user.id,
            username: user.username,
            email: user.email
          };
        }
        
        return result;
      });
    },
    findFirst: ({ where }) => {
      const todo = findTodoByIdAndUser.get(where.id, where.userId);
      if (!todo) return null;
      return {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        completed: Boolean(todo.completed),
        userId: todo.userId,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt
      };
    },
    update: ({ where, data, include }) => {
      const current = findTodoById.get(where.id);
      if (!current) return null;
      
      const title = data.title ?? current.title;
      const description = data.description !== undefined ? data.description : current.description;
      const dueDate = data.dueDate !== undefined ? data.dueDate : current.dueDate;
      const completed = data.completed !== undefined ? (data.completed ? 1 : 0) : current.completed;
      
      updateTodo.run(title, description, dueDate, completed, where.id);
      
      const result = {
        id: current.id,
        title,
        description,
        dueDate,
        completed: Boolean(completed),
        userId: current.userId,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      if (include?.subtasks) {
        result.subtasks = findSubtasksByTodoId.all(current.id).map(subtask => ({
          id: subtask.id,
          title: subtask.title,
          completed: Boolean(subtask.completed),
          todoId: subtask.todoId,
          createdAt: subtask.createdAt,
          updatedAt: subtask.updatedAt
        }));
      }
      if (include?.notes) {
        result.notes = findNotesByTodoId.all(current.id).map(note => ({
          id: note.id,
          content: note.content,
          todoId: note.todoId,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }));
      }
      if (include?.user) {
        const user = findUserById.get(current.userId);
        result.user = {
          id: user.id,
          username: user.username,
          email: user.email
        };
      }
      
      return result;
    },
    delete: ({ where }) => {
      deleteTodo.run(where.id);
      return {};
    },
    count: ({ where }) => {
      if (where.userId) {
        const result = countTodosByUser.get(where.userId);
        return result.count;
      }
      return 0;
    }
  },
  subtask: {
    create: ({ data }) => {
      const result = createSubtask.run(data.title, data.todoId);
      return {
        id: result.lastInsertRowid,
        title: data.title,
        completed: false,
        todoId: data.todoId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
    update: ({ where, data }) => {
      const current = findSubtaskById.get(where.id);
      if (!current) return null;
      
      const title = data.title ?? current.title;
      const completed = data.completed !== undefined ? (data.completed ? 1 : 0) : current.completed;
      
      updateSubtask.run(title, completed, where.id);
      
      return {
        id: current.id,
        title,
        completed: Boolean(completed),
        todoId: current.todoId,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString()
      };
    },
    delete: ({ where }) => {
      deleteSubtask.run(where.id);
      return {};
    },
    count: ({ where }) => {
      if (where.todo && where.todo.userId) {
        const result = countSubtasksByUser.get(where.todo.userId);
        return result.count;
      }
      return 0;
    }
  },
  note: {
    create: ({ data }) => {
      const result = createNote.run(data.content, data.todoId);
      return {
        id: result.lastInsertRowid,
        content: data.content,
        todoId: data.todoId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
    delete: ({ where }) => {
      deleteNote.run(where.id);
      return {};
    }
  },
  // Helper for statistics
  getStats: (userId) => {
    const totalTodos = countTodosByUser.get(userId).count;
    const completedTodos = countCompletedTodosByUser.get(userId).count;
    const totalSubtasks = countSubtasksByUser.get(userId).count;
    const completedSubtasks = countCompletedSubtasksByUser.get(userId).count;
    
    return {
      totalTodos,
      completedTodos,
      totalSubtasks,
      completedSubtasks
    };
  },
  $disconnect: () => {
    db.close();
  }
};