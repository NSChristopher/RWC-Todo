import { useState, useEffect } from 'react';
import { Todo, CreateTodoData, UpdateTodoData, CreateSubtaskData, UpdateSubtaskData, CreateNoteData } from '@/types';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/todos', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }

      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData: CreateTodoData) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      const newTodo = await response.json();
      setTodos((prev) => [newTodo, ...prev]);
      return newTodo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  };

  const updateTodo = async (id: number, todoData: UpdateTodoData) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      return updatedTodo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  };

  const createSubtask = async (todoId: number, subtaskData: CreateSubtaskData) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subtaskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create subtask');
      }

      const newSubtask = await response.json();
      // Refresh todos to get updated subtasks
      await fetchTodos();
      return newSubtask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subtask');
      throw err;
    }
  };

  const updateSubtask = async (todoId: number, subtaskId: number, subtaskData: UpdateSubtaskData) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subtaskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }

      const updatedSubtask = await response.json();
      // Refresh todos to get updated subtasks
      await fetchTodos();
      return updatedSubtask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subtask');
      throw err;
    }
  };

  const deleteSubtask = async (todoId: number, subtaskId: number) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subtask');
      }

      // Refresh todos to get updated subtasks
      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subtask');
      throw err;
    }
  };

  const createNote = async (todoId: number, noteData: CreateNoteData) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      // Refresh todos to get updated notes
      await fetchTodos();
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  };

  const deleteNote = async (todoId: number, noteId: number) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      // Refresh todos to get updated notes
      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    createNote,
    deleteNote,
  };
};