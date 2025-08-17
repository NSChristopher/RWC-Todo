import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { Todo, Subtask } from '@/types';
import { Plus, Edit, Trash2, LogOut, User, Calendar, Home, BarChart3, Check, X } from 'lucide-react';

const TodoListPage = () => {
  const { user, logout } = useAuth();
  const { todos, loading, createTodo, updateTodo, deleteTodo, createSubtask, updateSubtask, deleteSubtask, createNote, deleteNote } = useTodos();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showSubtaskForm, setShowSubtaskForm] = useState<number | null>(null);
  const [showNoteForm, setShowNoteForm] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, formData);
        setEditingTodo(null);
      } else {
        await createTodo(formData);
        setShowCreateForm(false);
      }
      
      setFormData({ title: '', description: '', dueDate: '' });
    } catch (error) {
      console.error('Error saving todo:', error);
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

  const handleToggleComplete = async (todo: Todo) => {
    try {
      await updateTodo(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleToggleSubtaskComplete = async (todo: Todo, subtask: Subtask) => {
    try {
      await updateSubtask(todo.id, subtask.id, { completed: !subtask.completed });
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  const handleCreateSubtask = async (todoId: number) => {
    if (!subtaskTitle.trim()) return;
    
    try {
      await createSubtask(todoId, { title: subtaskTitle, todoId });
      setSubtaskTitle('');
      setShowSubtaskForm(null);
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const handleCreateNote = async (todoId: number) => {
    if (!noteContent.trim()) return;
    
    try {
      await createNote(todoId, { content: noteContent, todoId });
      setNoteContent('');
      setShowNoteForm(null);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your todos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Mi Todoes</h1>
              <nav className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/todos')}
                  className="text-blue-600"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Todos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.username}</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Todo Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Todos</h2>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </Button>
          </div>

          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingTodo ? 'Edit Todo' : 'Create New Todo'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="What needs to be done?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add some notes about this todo..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date (optional)</Label>
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingTodo(null);
                        setFormData({ title: '', description: '', dueDate: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Todos List */}
        <div className="space-y-4">
          {todos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No todos yet. Create your first one above!</p>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.id} className={todo.completed ? 'opacity-75' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleComplete(todo)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.title}
                        </CardTitle>
                        <CardDescription>
                          {todo.dueDate && (
                            <span className="text-blue-600 mr-2">
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          Created {new Date(todo.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(todo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(todo.description || todo.subtasks?.length || todo.notes?.length) && (
                  <CardContent>
                    {todo.description && (
                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">{todo.description}</p>
                    )}
                    
                    {/* Subtasks */}
                    {todo.subtasks && todo.subtasks.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Subtasks:</h4>
                        <div className="space-y-2">
                          {todo.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={subtask.completed}
                                  onCheckedChange={() => handleToggleSubtaskComplete(todo, subtask)}
                                />
                                <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                                  {subtask.title}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteSubtask(todo.id, subtask.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Subtask */}
                    <div className="mb-4">
                      {showSubtaskForm === todo.id ? (
                        <div className="flex space-x-2">
                          <Input
                            value={subtaskTitle}
                            onChange={(e) => setSubtaskTitle(e.target.value)}
                            placeholder="Add a subtask..."
                            className="text-sm"
                          />
                          <Button size="sm" onClick={() => handleCreateSubtask(todo.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowSubtaskForm(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowSubtaskForm(todo.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Subtask
                        </Button>
                      )}
                    </div>

                    {/* Notes */}
                    {todo.notes && todo.notes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                        <div className="space-y-2">
                          {todo.notes.map((note) => (
                            <div key={note.id} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-200 flex justify-between items-start">
                              <p className="text-sm text-gray-700">{note.content}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNote(todo.id, note.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Note */}
                    <div>
                      {showNoteForm === todo.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Add a note..."
                            className="text-sm"
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleCreateNote(todo.id)}>
                              <Check className="h-3 w-3 mr-1" />
                              Add Note
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowNoteForm(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowNoteForm(todo.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Note
                        </Button>
                      )}
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