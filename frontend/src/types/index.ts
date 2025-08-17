export interface User {
  id: number;
  email: string;
  username: string;
  createdAt?: string;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  userId: number;
  user?: User;
  subtasks?: Subtask[];
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  todoId: number;
  todo?: Todo;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  content: string;
  todoId: number;
  todo?: Todo;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
}

export interface CreateSubtaskData {
  title: string;
  todoId: number;
}

export interface UpdateSubtaskData {
  title?: string;
  completed?: boolean;
}

export interface CreateNoteData {
  content: string;
  todoId: number;
}

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  totalSubtasks: number;
  completedSubtasks: number;
  completionRate: number;
}