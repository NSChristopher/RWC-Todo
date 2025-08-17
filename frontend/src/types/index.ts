export interface User {
  id: number;
  email: string;
  username: string;
  createdAt?: string;
}

export interface Post {
  id: number;
  title: string;
  content?: string;
  published: boolean;
  authorId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  todoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  content: string;
  todoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  authorId: number;
  subtasks: Subtask[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  totalSubtasks: number;
  completedSubtasks: number;
  recentlyCompleted: Array<{
    id: number;
    title: string;
    updatedAt: string;
  }>;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  dueDate?: string;
  subtasks?: Array<{ title: string; completed?: boolean }>;
  notes?: Array<{ content: string }>;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface CreatePostData {
  title: string;
  content?: string;
  published?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  published?: boolean;
}