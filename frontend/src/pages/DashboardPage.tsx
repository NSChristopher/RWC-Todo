import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { LogOut, User, Home, Calendar, BarChart3, CheckCircle2, Circle, Target } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { stats, loading } = useStats();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your progress...</div>
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
                  className="text-blue-600"
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Progress Dashboard</h2>
          <p className="text-gray-600">Keep track of your accomplishments and stay motivated!</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Todos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
                <Circle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTodos}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedTodos} completed
                </p>
              </CardContent>
            </Card>

            {/* Completed Todos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Todos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedTodos}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0}% of todos
                </p>
              </CardContent>
            </Card>

            {/* Total Subtasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subtasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubtasks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedSubtasks} completed
                </p>
              </CardContent>
            </Card>

            {/* Overall Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedTodos + stats.completedSubtasks} of {stats.totalTodos + stats.totalSubtasks} tasks
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Chart */}
        {stats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Completion Progress</CardTitle>
              <CardDescription>
                Your overall progress across all todos and subtasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Todos Progress</span>
                  <span>{stats.completedTodos}/{stats.totalTodos}</span>
                </div>
                <Progress 
                  value={stats.totalTodos > 0 ? (stats.completedTodos / stats.totalTodos) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtasks Progress</span>
                  <span>{stats.completedSubtasks}/{stats.totalSubtasks}</span>
                </div>
                <Progress 
                  value={stats.totalSubtasks > 0 ? (stats.completedSubtasks / stats.totalSubtasks) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span>Overall Progress</span>
                  <span>{stats.completedTodos + stats.completedSubtasks}/{stats.totalTodos + stats.totalSubtasks}</span>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational Messages */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">🎉 Great Work!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">
                  {stats.completedTodos > 0 || stats.completedSubtasks > 0
                    ? `You've completed ${stats.completedTodos + stats.completedSubtasks} tasks! Keep up the excellent work!`
                    : "You're ready to tackle your first todo! Every journey begins with a single step."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">💪 Keep Going!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">
                  {stats.completionRate >= 75
                    ? "You're almost there! Outstanding progress!"
                    : stats.completionRate >= 50
                    ? "You're halfway there! Great momentum!"
                    : stats.completionRate > 0
                    ? "Every step counts! You're making progress!"
                    : "Ready to start your productivity journey? Add your first todo!"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to your favorite sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/todos')}>
                <Home className="h-4 w-4 mr-2" />
                View All Todos
              </Button>
              <Button variant="outline" onClick={() => navigate('/calendar')}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;