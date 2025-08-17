import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/types';
import { LogOut, User, Home, Calendar, BarChart3, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const CalendarPage = () => {
  const { user, logout } = useAuth();
  const { todos, loading } = useTodos();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get current month's dates
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your calendar...</div>
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
                  className="text-blue-600"
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Todo Calendar</h2>
          <p className="text-gray-600">View your todos scheduled across the month</p>
        </div>

        {/* Calendar Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center font-medium text-gray-500 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const dateKey = date.toDateString();
                const dayTodos = todosByDate[dateKey] || [];
                const isOtherMonth = !isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-32 p-2 border-r border-b last:border-r-0 ${
                      isOtherMonth ? 'bg-gray-50' : 'bg-white'
                    } ${isTodayDate ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isOtherMonth
                            ? 'text-gray-400'
                            : isTodayDate
                            ? 'text-blue-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {isTodayDate && (
                        <span className="text-xs text-blue-600 font-medium">Today</span>
                      )}
                    </div>

                    {/* Todos for this date */}
                    <div className="space-y-1">
                      {dayTodos.slice(0, 3).map(todo => (
                        <div
                          key={todo.id}
                          className={`text-xs p-1 rounded cursor-pointer ${
                            todo.completed
                              ? 'bg-green-100 text-green-800 line-through'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                          onClick={() => navigate('/todos')}
                        >
                          {todo.title}
                        </div>
                      ))}
                      
                      {dayTodos.length > 3 && (
                        <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                             onClick={() => navigate('/todos')}>
                          +{dayTodos.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span className="text-sm">Pending Todos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span className="text-sm">Completed Todos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-sm">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Todos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Upcoming Todos
            </CardTitle>
            <CardDescription>Todos scheduled for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const today = new Date();
              const nextWeek = new Date(today);
              nextWeek.setDate(today.getDate() + 7);
              
              const upcomingTodos = todos.filter(todo => {
                if (!todo.dueDate) return false;
                const dueDate = new Date(todo.dueDate);
                return dueDate >= today && dueDate <= nextWeek;
              }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

              if (upcomingTodos.length === 0) {
                return (
                  <p className="text-gray-500 text-center py-4">
                    No todos scheduled for the next 7 days
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {upcomingTodos.map(todo => (
                    <div
                      key={todo.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        todo.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(todo.dueDate!).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/todos')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CalendarPage;