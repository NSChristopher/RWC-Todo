import { useState, useEffect } from 'react';
import { Todo, CreateTodoData, UpdateTodoData, TodoStats } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch todos');
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (data: CreateTodoData) => {
    try {
      const response = await api.post('/todos', data);
      setTodos(prev => [response.data, ...prev]);
      toast.success('Todo created successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create todo';
      toast.error(message);
      throw error;
    }
  };

  const updateTodo = async (id: number, data: UpdateTodoData) => {
    try {
      const response = await api.put(`/todos/${id}`, data);
      setTodos(prev => prev.map(todo => todo.id === id ? response.data : todo));
      toast.success('Todo updated successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update todo';
      toast.error(message);
      throw error;
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('Todo deleted successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete todo';
      toast.error(message);
      throw error;
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await api.put(`/todos/${id}`, { completed });
      setTodos(prev => prev.map(todo => todo.id === id ? response.data : todo));
      toast.success(completed ? 'Todo completed!' : 'Todo marked as incomplete');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update todo';
      toast.error(message);
      throw error;
    }
  };

  const updateSubtask = async (subtaskId: number, completed: boolean) => {
    try {
      const response = await api.put(`/todos/subtasks/${subtaskId}`, { completed });
      // Update the local state to reflect the subtask change
      setTodos(prev => prev.map(todo => ({
        ...todo,
        subtasks: todo.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed } : subtask
        )
      })));
      toast.success(completed ? 'Subtask completed!' : 'Subtask marked as incomplete');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update subtask';
      toast.error(message);
      throw error;
    }
  };

  const addSubtask = async (todoId: number, title: string) => {
    try {
      const response = await api.post(`/todos/${todoId}/subtasks`, { title });
      // Update the local state to add the new subtask
      setTodos(prev => prev.map(todo =>
        todo.id === todoId
          ? { ...todo, subtasks: [...todo.subtasks, response.data] }
          : todo
      ));
      toast.success('Subtask added!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to add subtask';
      toast.error(message);
      throw error;
    }
  };

  const addNote = async (todoId: number, content: string) => {
    try {
      const response = await api.post(`/todos/${todoId}/notes`, { content });
      // Update the local state to add the new note
      setTodos(prev => prev.map(todo =>
        todo.id === todoId
          ? { ...todo, notes: [...todo.notes, response.data] }
          : todo
      ));
      toast.success('Note added!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to add note';
      toast.error(message);
      throw error;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    loading,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    updateSubtask,
    addSubtask,
    addNote,
  };
};

export const useTodoStats = () => {
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todos/stats/overview');
      setStats(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch todo stats');
      console.error('Error fetching todo stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    fetchStats,
  };
};