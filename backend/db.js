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
    completed INTEGER DEFAULT 0,
    dueDate DATETIME,
    authorId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES User(id)
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

// Todo-related queries
const createTodo = db.prepare(`
  INSERT INTO Todo (title, description, completed, dueDate, authorId) 
  VALUES (?, ?, ?, ?, ?)
`);

const findAllTodos = db.prepare(`
  SELECT * FROM Todo WHERE authorId = ? ORDER BY createdAt DESC
`);

const findTodoById = db.prepare(`
  SELECT * FROM Todo WHERE id = ? AND authorId = ?
`);

const updateTodo = db.prepare(`
  UPDATE Todo 
  SET title = ?, description = ?, completed = ?, dueDate = ?, updatedAt = CURRENT_TIMESTAMP 
  WHERE id = ?
`);

const deleteTodo = db.prepare(`
  DELETE FROM Todo WHERE id = ?
`);

const createSubtask = db.prepare(`
  INSERT INTO Subtask (title, completed, todoId) 
  VALUES (?, ?, ?)
`);

const findSubtasksByTodoId = db.prepare(`
  SELECT * FROM Subtask WHERE todoId = ? ORDER BY createdAt ASC
`);

const findSubtaskById = db.prepare(`
  SELECT s.*, t.authorId FROM Subtask s 
  JOIN Todo t ON s.todoId = t.id 
  WHERE s.id = ?
`);

const updateSubtask = db.prepare(`
  UPDATE Subtask 
  SET title = ?, completed = ?, updatedAt = CURRENT_TIMESTAMP 
  WHERE id = ?
`);

const createNote = db.prepare(`
  INSERT INTO Note (content, todoId) 
  VALUES (?, ?)
`);

const findNotesByTodoId = db.prepare(`
  SELECT * FROM Note WHERE todoId = ? ORDER BY createdAt ASC
`);

const countTodosByAuthor = db.prepare(`
  SELECT COUNT(*) as count FROM Todo WHERE authorId = ?
`);

const countCompletedTodosByAuthor = db.prepare(`
  SELECT COUNT(*) as count FROM Todo WHERE authorId = ? AND completed = 1
`);

const countSubtasksByAuthor = db.prepare(`
  SELECT COUNT(*) as count FROM Subtask s 
  JOIN Todo t ON s.todoId = t.id 
  WHERE t.authorId = ?
`);

const countCompletedSubtasksByAuthor = db.prepare(`
  SELECT COUNT(*) as count FROM Subtask s 
  JOIN Todo t ON s.todoId = t.id 
  WHERE t.authorId = ? AND s.completed = 1
`);

const findRecentlyCompletedTodos = db.prepare(`
  SELECT id, title, updatedAt FROM Todo 
  WHERE authorId = ? AND completed = 1 
  ORDER BY updatedAt DESC 
  LIMIT 5
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
        data.completed ? 1 : 0, 
        data.dueDate || null, 
        data.authorId
      );
      
      const todoId = result.lastInsertRowid;
      
      // Create subtasks if provided
      const subtasks = [];
      if (data.subtasks && data.subtasks.create) {
        for (const subtaskData of data.subtasks.create) {
          const subtaskResult = createSubtask.run(subtaskData.title, subtaskData.completed ? 1 : 0, todoId);
          subtasks.push({
            id: subtaskResult.lastInsertRowid,
            title: subtaskData.title,
            completed: Boolean(subtaskData.completed),
            todoId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Create notes if provided
      const notes = [];
      if (data.notes && data.notes.create) {
        for (const noteData of data.notes.create) {
          const noteResult = createNote.run(noteData.content, todoId);
          notes.push({
            id: noteResult.lastInsertRowid,
            content: noteData.content,
            todoId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      return {
        id: todoId,
        title: data.title,
        description: data.description || null,
        completed: Boolean(data.completed),
        dueDate: data.dueDate || null,
        authorId: data.authorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks,
        notes
      };
    },
    findMany: ({ where, include, orderBy }) => {
      const todos = findAllTodos.all(where.authorId);
      return todos.map(todo => {
        const subtasks = include?.subtasks ? findSubtasksByTodoId.all(todo.id) : [];
        const notes = include?.notes ? findNotesByTodoId.all(todo.id) : [];
        
        return {
          id: todo.id,
          title: todo.title,
          description: todo.description,
          completed: Boolean(todo.completed),
          dueDate: todo.dueDate,
          authorId: todo.authorId,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
          subtasks: subtasks.map(s => ({
            ...s,
            completed: Boolean(s.completed)
          })),
          notes
        };
      });
    },
    findUnique: ({ where, include }) => {
      const todo = findTodoById.get(where.id, where.authorId);
      if (!todo) return null;
      
      const subtasks = include?.subtasks ? findSubtasksByTodoId.all(todo.id) : [];
      const notes = include?.notes ? findNotesByTodoId.all(todo.id) : [];
      
      return {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: Boolean(todo.completed),
        dueDate: todo.dueDate,
        authorId: todo.authorId,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
        subtasks: subtasks.map(s => ({
          ...s,
          completed: Boolean(s.completed)
        })),
        notes
      };
    },
    update: ({ where, data, include }) => {
      const current = findTodoById.get(where.id);
      if (!current) return null;
      
      const title = data.title ?? current.title;
      const description = data.description !== undefined ? data.description : current.description;
      const completed = data.completed !== undefined ? (data.completed ? 1 : 0) : current.completed;
      const dueDate = data.dueDate !== undefined ? data.dueDate : current.dueDate;
      
      updateTodo.run(title, description, completed, dueDate, where.id);
      
      const subtasks = include?.subtasks ? findSubtasksByTodoId.all(where.id) : [];
      const notes = include?.notes ? findNotesByTodoId.all(where.id) : [];
      
      return {
        id: current.id,
        title,
        description,
        completed: Boolean(completed),
        dueDate,
        authorId: current.authorId,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
        subtasks: subtasks.map(s => ({
          ...s,
          completed: Boolean(s.completed)
        })),
        notes
      };
    },
    delete: ({ where }) => {
      deleteTodo.run(where.id);
      return {};
    },
    count: ({ where }) => {
      return countTodosByAuthor.get(where.authorId).count;
    }
  },
  subtask: {
    create: ({ data }) => {
      const result = createSubtask.run(data.title, data.completed ? 1 : 0, data.todoId);
      return {
        id: result.lastInsertRowid,
        title: data.title,
        completed: Boolean(data.completed),
        todoId: data.todoId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
    findUnique: ({ where, include }) => {
      const subtask = findSubtaskById.get(where.id);
      if (!subtask) return null;
      
      return {
        id: subtask.id,
        title: subtask.title,
        completed: Boolean(subtask.completed),
        todoId: subtask.todoId,
        createdAt: subtask.createdAt,
        updatedAt: subtask.updatedAt,
        todo: include?.todo ? { authorId: subtask.authorId } : undefined
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
    count: ({ where }) => {
      if (where.todo && where.todo.authorId) {
        return countSubtasksByAuthor.get(where.todo.authorId).count;
      }
      if (where.completed !== undefined) {
        return countCompletedSubtasksByAuthor.get(where.todo.authorId).count;
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
    }
  },
  $disconnect: () => {
    db.close();
  }
};