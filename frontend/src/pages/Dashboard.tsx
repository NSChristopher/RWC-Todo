import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTodoStats } from '@/hooks/useTodos';
import { Plus, LogOut, User, Calendar, List, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { stats, loading } = useTodoStats();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCompletionPercentage = () => {
    if (!stats || stats.totalTodos === 0) return 0;
    return Math.round((stats.completedTodos / stats.totalTodos) * 100);
  };

  const getSubtaskCompletionPercentage = () => {
    if (!stats || stats.totalSubtasks === 0) return 0;
    return Math.round((stats.completedSubtasks / stats.totalSubtasks) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Mi Todoes Dashboard</h1>
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
                onClick={() => navigate('/calendar')}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your productivity and progress.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/todos')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Todo</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTodos || 0}</div>
              <p className="text-xs text-muted-foreground">
                All your todos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Todos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.completedTodos || 0}</div>
              <p className="text-xs text-muted-foreground">
                {getCompletionPercentage()}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Todos</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {(stats?.totalTodos || 0) - (stats?.completedTodos || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Still to complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subtasks Done</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.completedSubtasks || 0}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats?.totalSubtasks || 0} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Todo Progress</CardTitle>
              <CardDescription>Your overall todo completion progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Todos Completed</span>
                    <span>{getCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Completed</div>
                    <div className="text-green-600 text-xl font-bold">{stats?.completedTodos || 0}</div>
                  </div>
                  <div>
                    <div className="font-medium">Remaining</div>
                    <div className="text-orange-600 text-xl font-bold">
                      {(stats?.totalTodos || 0) - (stats?.completedTodos || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subtask Progress</CardTitle>
              <CardDescription>Progress on individual subtasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtasks Completed</span>
                    <span>{getSubtaskCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getSubtaskCompletionPercentage()}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Completed</div>
                    <div className="text-blue-600 text-xl font-bold">{stats?.completedSubtasks || 0}</div>
                  </div>
                  <div>
                    <div className="font-medium">Remaining</div>
                    <div className="text-orange-600 text-xl font-bold">
                      {(stats?.totalSubtasks || 0) - (stats?.completedSubtasks || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recently Completed */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recently Completed 🎉</h3>
          {stats?.recentlyCompleted && stats.recentlyCompleted.length > 0 ? (
            <div className="space-y-4">
              {stats.recentlyCompleted.map((todo) => (
                <Card key={todo.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium line-through text-gray-600">{todo.title}</h4>
                        <p className="text-sm text-gray-500">
                          Completed {new Date(todo.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No completed todos yet. Keep working on your goals!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Motivation Section */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Keep Going! 💪</h3>
              <p className="text-blue-100 mb-4">
                {stats?.completedTodos === 0 
                  ? "Start your productivity journey by creating your first todo!"
                  : `You've completed ${stats?.completedTodos} todo${stats?.completedTodos === 1 ? '' : 's'} so far. That's amazing progress!`
                }
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/todos')}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Todo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/calendar')}
                  className="flex items-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Calendar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;