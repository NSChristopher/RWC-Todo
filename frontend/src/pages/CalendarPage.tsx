import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User, 
  List, 
  BarChart3, 
  CheckCircle, 
  Circle,
  Clock
} from 'lucide-react';

const CalendarPage = () => {
  const { user, logout } = useAuth();
  const { todos, loading, toggleTodo } = useTodos();
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Group todos by date
  const todosByDate = useMemo(() => {
    const grouped: { [key: string]: Todo[] } = {};
    
    todos.forEach(todo => {
      if (todo.dueDate) {
        const dateKey = new Date(todo.dueDate).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(todo);
      }
    });
    
    return grouped;
  }, [todos]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = date.toDateString();
      const dayTodos = todosByDate[dateKey] || [];
      
      days.push({
        day,
        date,
        dateKey,
        todos: dayTodos,
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < new Date() && date.toDateString() !== new Date().toDateString()
      });
    }

    return days;
  }, [currentDate, todosByDate]);

  const handleToggleTodo = async (id: number, completed: boolean) => {
    await toggleTodo(id, completed);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Mi Todoes Calendar</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/todos')}
                className="flex items-center space-x-2"
              >
                <List className="h-4 w-4" />
                <span>Todo List</span>
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
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{formatMonth(currentDate)}</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigateMonth('prev')}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateMonth('next')}
              className="flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-6">
            {/* Calendar Headers */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((dayData, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 rounded-lg border ${
                    dayData 
                      ? dayData.isToday 
                        ? 'bg-blue-50 border-blue-200' 
                        : dayData.isPast 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-gray-200'
                      : 'border-transparent'
                  }`}
                >
                  {dayData && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        dayData.isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {dayData.day}
                      </div>
                      
                      <div className="space-y-1">
                        {dayData.todos.map(todo => (
                          <div
                            key={todo.id}
                            className={`text-xs p-1 rounded cursor-pointer ${
                              todo.completed 
                                ? 'bg-green-100 text-green-800 line-through' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                            onClick={() => handleToggleTodo(todo.id, !todo.completed)}
                            title={`${todo.title}${todo.description ? ' - ' + todo.description : ''}`}
                          >
                            <div className="flex items-center space-x-1">
                              {todo.completed ? (
                                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                              ) : (
                                <Circle className="h-3 w-3 flex-shrink-0" />
                              )}
                              <span className="truncate">{todo.title}</span>
                            </div>
                          </div>
                        ))}
                        
                        {dayData.todos.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{dayData.todos.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Todos */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Todos</h3>
          <div className="space-y-3">
            {todos
              .filter(todo => !todo.completed && todo.dueDate)
              .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
              .slice(0, 5)
              .map(todo => (
                <Card key={todo.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleTodo(todo.id, true)}
                      >
                        <Circle className="h-5 w-5 text-gray-400" />
                      </button>
                      <div>
                        <h4 className="font-medium">{todo.title}</h4>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Due {new Date(todo.dueDate!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/todos')}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            
            {todos.filter(todo => !todo.completed && todo.dueDate).length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming todos with due dates.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;