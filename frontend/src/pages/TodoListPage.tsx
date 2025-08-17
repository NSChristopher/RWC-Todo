import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/types';
import { Plus, Edit, Trash2, LogOut, User, Calendar, BarChart3, CheckCircle, Circle, Clock } from 'lucide-react';

const TodoListPage = () => {
  const { user, logout } = useAuth();
  const { todos, loading, createTodo, updateTodo, deleteTodo, toggleTodo, updateSubtask, addSubtask, addNote } = useTodos();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [newSubtask, setNewSubtask] = useState<{ [key: number]: string }>({});
  const [newNote, setNewNote] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, formData);
        setEditingTodo(null);
      } else {
        await createTodo(formData);
      }
      setFormData({ title: '', description: '', dueDate: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
    });
    setShowCreateForm(true);
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setFormData({ title: '', description: '', dueDate: '' });
    setShowCreateForm(false);
  };

  const handleDeleteTodo = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await deleteTodo(id);
    }
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    await toggleTodo(id, completed);
  };

  const handleToggleSubtask = async (subtaskId: number, completed: boolean) => {
    await updateSubtask(subtaskId, completed);
  };

  const handleAddSubtask = async (todoId: number) => {
    const title = newSubtask[todoId];
    if (title && title.trim()) {
      await addSubtask(todoId, title.trim());
      setNewSubtask(prev => ({ ...prev, [todoId]: '' }));
    }
  };

  const handleAddNote = async (todoId: number) => {
    const content = newNote[todoId];
    if (content && content.trim()) {
      await addNote(todoId, content.trim());
      setNewNote(prev => ({ ...prev, [todoId]: '' }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Mi Todoes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/calendar')}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Todo Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Todo</span>
          </Button>
        </div>

        {/* Create/Edit Todo Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingTodo ? 'Edit Todo' : 'Create New Todo'}</CardTitle>
              <CardDescription>
                {editingTodo ? 'Update your todo details' : 'Add a new task to your list'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingTodo ? 'Update Todo' : 'Create Todo'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Todos List */}
        <div className="space-y-4">
          {todos.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No todos yet. Create your first todo to get started!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.id} className={`${todo.completed ? 'opacity-75' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleToggleTodo(todo.id, !todo.completed)}
                        className="mt-1"
                      >
                        {todo.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.title}
                        </CardTitle>
                        <CardDescription>
                          Created {formatDate(todo.createdAt)}
                          {todo.dueDate && (
                            <span className={`ml-2 flex items-center ${isOverdue(todo.dueDate) ? 'text-red-600' : 'text-blue-600'}`}>
                              <Clock className="h-3 w-3 mr-1" />
                              Due {formatDate(todo.dueDate)}
                              {isOverdue(todo.dueDate) && ' (Overdue)'}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(todo)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {(todo.description || todo.subtasks.length > 0 || todo.notes.length > 0) && (
                  <CardContent className="space-y-4">
                    {todo.description && (
                      <p className="text-gray-600 whitespace-pre-wrap">{todo.description}</p>
                    )}

                    {/* Subtasks */}
                    {todo.subtasks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Subtasks:</h4>
                        <div className="space-y-2">
                          {todo.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleSubtask(subtask.id, !subtask.completed)}
                              >
                                {subtask.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                              <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Subtask */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a subtask..."
                        value={newSubtask[todo.id] || ''}
                        onChange={(e) => setNewSubtask(prev => ({ ...prev, [todo.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask(todo.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddSubtask(todo.id)}
                        disabled={!newSubtask[todo.id]?.trim()}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Notes */}
                    {todo.notes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Notes:</h4>
                        <div className="space-y-2">
                          {todo.notes.map((note) => (
                            <div key={note.id} className="bg-yellow-50 p-2 rounded text-sm">
                              {note.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Note */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a note..."
                        value={newNote[todo.id] || ''}
                        onChange={(e) => setNewNote(prev => ({ ...prev, [todo.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNote(todo.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddNote(todo.id)}
                        disabled={!newNote[todo.id]?.trim()}
                      >
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default TodoListPage;