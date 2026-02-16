# Todo App Backend

A REST API for Todo App with JWT Authentication built with Node.js, Express, and MySQL.

## Features

- **User Authentication**
  - Register new user
  - Login with email/password
  - Refresh access token
  - Logout with token blacklisting

- **Todo Management**
  - Create todo
  - Get all todos (with pagination)
  - Get todo by ID
  - Update todo
  - Delete todo
  - Toggle todo completion

- **Security**
  - JWT access token (expires in 1 hour)
  - JWT refresh token (expires in 7 days)
  - Password hashing with bcrypt
  - Token blacklisting for logout

## Project Structure

```
src/
├── app.js                    # Main application entry point
├── config/
│   ├── index.js             # Configuration
│   ├── database.js          # Sequelize database connection
│   └── initDb.js            # Database initialization
├── controllers/
│   ├── auth.controller.js   # Auth controller
│   └── todo.controller.js   # Todo controller
├── middlewares/
│   └── authRequired.js      # Authentication middleware
├── models/
│   ├── user.model.js        # User model (Sequelize)
│   ├── todo.model.js        # Todo model (Sequelize)
│   └── revokedToken.model.js # Revoked token model (Sequelize)
├── routes/
│   ├── auth.route.js        # Auth routes
│   └── todo.route.js        # Todo routes
└── services/
    ├── auth.service.js      # Auth business logic
    └── todo.service.js      # Todo business logic
```

## API Endpoints

### Authentication

| Method | Endpoint            | Description          | Access  |
| ------ | ------------------- | -------------------- | ------- |
| POST   | /auth/register      | Register new user    | Public  |
| POST   | /auth/login         | Login user           | Public  |
| POST   | /auth/refresh-token | Refresh access token | Public  |
| POST   | /auth/logout        | Logout user          | Private |

### Todos

| Method | Endpoint          | Description       | Access  |
| ------ | ----------------- | ----------------- | ------- |
| GET    | /todos            | Get all todos     | Private |
| POST   | /todos            | Create todo       | Private |
| GET    | /todos/:id        | Get todo by ID    | Private |
| PUT    | /todos/:id        | Update todo       | Private |
| DELETE | /todos/:id        | Delete todo       | Private |
| PATCH  | /todos/:id/toggle | Toggle completion | Private |

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`

3. Make sure MySQL is running and create a database:

```sql
CREATE DATABASE todo_app;
```

Or let the app create the database automatically on startup.

4. Run the server:

```bash
npm run dev  # Development
npm start    # Production
```

## Environment Variables

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_app
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

## Database Tables

The application will create the following tables automatically:

- `users` - User accounts
- `todos` - Todo items
- `revoked_tokens` - Blacklisted tokens for logout
