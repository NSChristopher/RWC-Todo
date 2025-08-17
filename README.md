# Mi Todoes

A complete todo management application built with modern web technologies. Keep track of your tasks, create subtasks, add notes, and view your progress on a beautiful dashboard with calendar integration.

## 📦 Tech Stack

| Layer               | Technology                       | Purpose                                     |
| ------------------- | -------------------------------- | ------------------------------------------- |
| **Frontend**        | React 18 + TypeScript + Vite     | Modern React with fast development          |
| **Styling**         | Tailwind CSS + ShadCN UI         | Utility-first CSS with beautiful components |
| **Icons & UI**      | Lucide React + Sonner            | Icons and toast notifications               |
| **Backend**         | Express.js + Node.js             | RESTful API server                          |
| **Database**        | SQLite + better-sqlite3           | High-performance embedded database          |
| **Auth**            | JWT + HTTP-only Cookies          | Secure authentication flow                  |
| **Dev Environment** | GitHub Codespaces + Devcontainer | Consistent development environment          |

## ✨ Features

- 🔐 **Complete Authentication**: Register, login, logout with JWT
- ✅ **Todo Management**: Create, edit, complete, and delete todos
- 📅 **Due Dates**: Set optional due dates for your tasks
- 🎯 **Subtasks**: Break down complex todos into manageable subtasks
- 📝 **Notes**: Add detailed notes to your todos
- 📊 **Progress Dashboard**: Visualize your completion rates and statistics
- 📅 **Calendar View**: See your todos organized by due date
- 🎨 **Beautiful UI**: Tailwind CSS with ShadCN components
- 🔒 **Protected Routes**: Both frontend and backend route protection
- 📱 **Responsive Design**: Mobile-first approach
- 🚀 **Fast Development**: Hot reload for both frontend and backend
- 🛡️ **Type Safety**: Full TypeScript support
- 🍞 **Toast Notifications**: User feedback with Sonner

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
├── .devcontainer/             # GitHub Codespaces configuration
│   └── devcontainer.json
├── backend/                   # Express.js API
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── todos.js          # Todo CRUD routes
│   │   ├── stats.js          # Statistics routes
│   │   └── posts.js          # Legacy posts routes
│   ├── package.json
│   ├── db.js                 # SQLite database with better-sqlite3
│   └── index.js              # Express server
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/           # ShadCN UI components
│   │   ├── pages/
│   │   │   ├── Home.tsx      # Landing page
│   │   │   ├── Login.tsx     # Login page
│   │   │   ├── Register.tsx  # Registration page
│   │   │   ├── TodoListPage.tsx # Main todo management
│   │   │   ├── DashboardPage.tsx # Progress dashboard
│   │   │   └── CalendarPage.tsx # Calendar view
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx   # Authentication hook
│   │   │   ├── useTodos.ts   # Todo management hook
│   │   │   └── useStats.ts   # Statistics hook
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios configuration
│   │   │   └── utils.ts      # Utility functions
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript definitions
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── tailwind.config.js    # Tailwind configuration
│   └── vite.config.ts        # Vite configuration
├── documentation/             # Project documentation, guidelines, planning, templates
│   ├── planning/
│   ├── guidelines/
│   ├── templates/
│   └── docs/
├── package.json              # Root package.json
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

### Todos (`/api/todos`)

- `GET /api/todos` - Get all todos for current user (protected)
- `GET /api/todos/:id` - Get single todo (protected)
- `POST /api/todos` - Create todo (protected)
- `PUT /api/todos/:id` - Update todo (protected)
- `DELETE /api/todos/:id` - Delete todo (protected)
- `POST /api/todos/:id/subtasks` - Create subtask (protected)
- `PUT /api/todos/:todoId/subtasks/:subtaskId` - Update subtask (protected)
- `DELETE /api/todos/:todoId/subtasks/:subtaskId` - Delete subtask (protected)
- `POST /api/todos/:id/notes` - Create note (protected)
- `DELETE /api/todos/:todoId/notes/:noteId` - Delete note (protected)

### Statistics (`/api/stats`)

- `GET /api/stats` - Get user completion statistics (protected)

## 🛠️ Development Scripts

```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev

# Start backend only
npm run backend:dev

# Start frontend only
npm run frontend:dev

# Build frontend
npm run frontend:build

# The database is automatically initialized when the backend starts
# No additional database setup required - using SQLite with better-sqlite3
```

## 🎨 Customization

### Adding New Database Models

1. Update the database schema in `backend/db.js`:

   ```javascript
   // Add new table creation in the db.exec() section
   CREATE TABLE IF NOT EXISTS YourModel (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Add database methods:

   ```javascript
   // Add prepared statements and ORM methods
   const createYourModel = db.prepare(`INSERT INTO YourModel (name) VALUES (?)`);
   // ... add to module.exports
   ```

3. Create API routes in `backend/routes/`
4. Add corresponding hooks and types in frontend

### Styling and Theming

- Modify `frontend/tailwind.config.js` for theme customization
- Update CSS variables in `frontend/src/index.css`
- Customize ShadCN components in `frontend/src/components/ui/`

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend
PORT=5000
JWT_SECRET=your-secret-key

# Database (optional for SQLite)
DATABASE_URL="file:./dev.db"
```

## 🚢 Deployment

### Frontend (Vercel, Netlify, etc.)

1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `frontend/dist` folder
3. Configure environment variables for API URL

### Backend (Railway, Heroku, etc.)

1. Deploy the `backend` folder
2. Set environment variables
3. Use a production database (PostgreSQL, MySQL)

### Full Stack (Railway, Render)

1. Use the root package.json for deployment
2. Configure build and start scripts
3. Set up environment variables

## 📚 Documentation

- [React 18 Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ShadCN UI Documentation](https://ui.shadcn.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Introduction](https://jwt.io/introduction)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or run into issues, please:

1. Check the [documentation](documentation/)
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy coding!** 🚀
