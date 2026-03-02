# Todo App Backend

A production-ready REST API for Todo Application built with Node.js, Express, and MySQL. This backend provides complete user authentication and todo management features with JWT tokens, rate limiting, background job queue for emails, and comprehensive error handling.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Todo Management](#todo-management)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Authentication](#authentication-1)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Logging](#logging)
- [Project Features Details](#project-features-details)

## Features

### User Authentication

- **User Registration** - Create new account with username, email, and password
- **User Login** - Authenticate with email and password
- **Token Refresh** - Obtain new access token using refresh token
- **User Logout** - Securely logout with token blacklisting
- **Password Security** - Bcrypt hashing with salt for secure password storage

### Todo Management

- **Create Todo** - Add new todo with title, description, due date, and priority
- **Get All Todos** - Retrieve todos with pagination, filtering, and sorting
- **Get Todo by ID** - Retrieve specific todo details
- **Update Todo** - Modify todo information
- **Delete Todo** - Remove todo from database
- **Toggle Completion** - Mark todo as complete/incomplete
- **Priority Levels** - Support for low, medium, and high priority todos
- **Due Date** - Optional due date for each todo

### Security & Performance

- **JWT Authentication** - Access tokens (1 hour) and refresh tokens (7 days)
- **Token Blacklisting** - Invalidated tokens stored for secure logout
- **Rate Limiting** - 100 requests per minute per IP
- **CORS Support** - Configurable cross-origin resource sharing
- **SQL Injection Prevention** - Prepared statements for all queries
- **Error Logging** - Comprehensive error logging to file

### Background Job Queue

- **Email Queue System** - Asynchronous processing for email tasks
- **Job Status Tracking** - Pending, processing, completed, and failed states
- **Automatic Retry** - Failed jobs can be reprocessed
- **Email Notifications** - Verification emails and password change notifications

### API Design

- **RESTful API** - Standard HTTP methods and status codes
- **JSON Responses** - Consistent JSON format for all responses
- **Pagination** - Configurable page size and page number
- **Filtering** - Filter todos by completion status and priority
- **Sorting** - Sort todos by creation date

## Tech Stack

| Technology     | Purpose               | Version |
| -------------- | --------------------- | ------- |
| Node.js        | JavaScript runtime    | ^18.x   |
| Express.js     | Web framework         | ^4.18.2 |
| MySQL          | Database              | ^8.0    |
| mysql2         | MySQL driver          | ^3.17.0 |
| JSON Web Token | Authentication        | ^9.0.2  |
| bcryptjs       | Password hashing      | ^2.4.3  |
| dotenv         | Environment variables | ^16.3.1 |
| cors           | CORS middleware       | ^2.8.5  |
| nodemailer     | Email sending         | ^6.9.8  |
| module-alias   | Path aliases          | ^2.2.3  |
| nodemon        | Development tool      | ^3.0.2  |

## Project Structure

```
src/
├── app.js                      # Application entry point
├── queue.js                    # Background job queue processor
├── config/
│   ├── app.config.js          # Application configuration
│   ├── constants.js           # Application constants
│   ├── database.js            # Database connection pool
│   └── nodemailer.js          # Email transporter configuration
├── controllers/
│   ├── auth.controller.js     # Authentication controllers
│   └── todo.controller.js     # Todo CRUD controllers
├── middlewares/
│   ├── authRequired.js        # JWT authentication middleware
│   ├── errorHandler.js        # Global error handler
│   ├── notFound.js            # 404 handler
│   ├── rateLimiter.js         # Rate limiting middleware
│   └── response.js            # Response helper middleware
├── models/
│   ├── user.model.js           # User database operations
│   ├── todo.model.js          # Todo database operations
│   ├── revokedToken.model.js  # Token blacklisting operations
│   └── queue.model.js         # Queue job operations
├── routes/
│   ├── auth.route.js          # Authentication routes
│   └── todo.route.js          # Todo management routes
├── services/
│   ├── auth.service.js        # Authentication business logic
│   ├── todo.service.js        # Todo business logic
│   ├── email.service.js       # Email sending service
│   └── queue.service.js       # Queue management service
├── tasks/
│   ├── index.js               # Task loader
│   ├── demoTask.js            # Demo task
│   ├── sendVerifyEmailTask.js # Email verification task
│   └── sendPasswordChangeEmailTask.js # Password change task
└── utils/
    └── sleep.js               # Sleep utility
```

## API Endpoints

### Authentication

| Method | Endpoint                        | Description               | Access  | Body Parameters                                     |
| ------ | ------------------------------- | ------------------------- | ------- | --------------------------------------------------- |
| POST   | `/api/auth/register`            | Register new user         | Public  | `username`, `email`, `password`                     |
| POST   | `/api/auth/login`               | Login user                | Public  | `email`, `password`                                 |
| POST   | `/api/auth/verify-email`        | Verify user email         | Public  | `token`                                             |
| POST   | `/api/auth/resend-verify-email` | Resend verification email | Private | -                                                   |
| POST   | `/api/auth/refresh-token`       | Refresh access token      | Public  | `refresh_token`                                     |
| POST   | `/api/auth/logout`              | Logout user               | Private | -                                                   |
| POST   | `/api/auth/change-password`     | Change user password      | Private | `currentPassword`, `newPassword`, `confirmPassword` |

### Todo Management

All todo endpoints require authentication via Bearer token in the Authorization header.

| Method | Endpoint                | Description               | Query Parameters                                                |
| ------ | ----------------------- | ------------------------- | --------------------------------------------------------------- |
| GET    | `/api/todos`            | Get all todos (paginated) | `page`, `limit`, `completed`, `priority`, `sortBy`, `sortOrder` |
| POST   | `/api/todos`            | Create new todo           | `title`, `description`, `dueDate`, `priority`                   |
| GET    | `/api/todos/:id`        | Get todo by ID            | -                                                               |
| PUT    | `/api/todos/:id`        | Update todo               | `title`, `description`, `completed`, `priority`                 |
| DELETE | `/api/todos/:id`        | Delete todo               | -                                                               |
| PATCH  | `/api/todos/:id/toggle` | Toggle todo completion    | -                                                               |

### Health Check

| Method | Endpoint  | Description          | Access |
| ------ | --------- | -------------------- | ------ |
| GET    | `/health` | Server health status | Public |

## Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **MySQL** (version 8.0 or higher)
- **npm** (comes with Node.js)

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd todo-app-backend
```

2. Install dependencies:

```bash
npm install
```

### Configuration

1. Create a `.env` file in the project root directory:

```bash
cp .env.example .env
```

2. Edit the `.env` file with your configuration:

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
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

# Rate Limiter Configuration
RATE_LIMITER_WINDOW_MS=60000
RATE_LIMITER_MAX_REQUESTS=100

# Pagination Configuration
PAGINATION_DEFAULT_PAGE=1
PAGINATION_DEFAULT_LIMIT=10
PAGINATION_MAX_LIMIT=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# Google Email Configuration
GOOGLE_APP_USER=your_email@gmail.com
GOOGLE_APP_PASSWORD=your_app_password

# Queue Configuration
QUEUE_POLL_INTERVAL=1000
```

### Database Setup

The application will automatically create the required database tables on startup. However, you can manually create the database first:

```sql
CREATE DATABASE todo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Running the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Running the Queue Worker

The queue worker processes background jobs like sending verification emails and password change notifications. Run it in a separate terminal:

```bash
npm run queue
```

The queue worker will:

1. Poll the database every second for pending jobs
2. Process jobs asynchronously
3. Update job status (pending → processing → completed/failed)
4. Retry failed jobs automatically on next poll

## Environment Variables

| Variable                    | Description             | Default     | Required |
| --------------------------- | ----------------------- | ----------- | -------- |
| `PORT`                      | Server port             | 3000        | No       |
| `NODE_ENV`                  | Environment             | development | No       |
| `DB_HOST`                   | MySQL host              | localhost   | Yes      |
| `DB_PORT`                   | MySQL port              | 3306        | Yes      |
| `DB_NAME`                   | Database name           | todo_app    | Yes      |
| `DB_USER`                   | MySQL username          | root        | Yes      |
| `DB_PASSWORD`               | MySQL password          | -           | Yes      |
| `JWT_ACCESS_SECRET`         | Access token secret     | -           | Yes      |
| `JWT_REFRESH_SECRET`        | Refresh token secret    | -           | Yes      |
| `JWT_ACCESS_EXPIRES_IN`     | Access token expiry     | 1h          | No       |
| `JWT_REFRESH_EXPIRES_IN`    | Refresh token expiry    | 7d          | No       |
| `JWT_ALGORITHM`             | JWT algorithm           | HS256       | No       |
| `RATE_LIMITER_WINDOW_MS`    | Rate limit window (ms)  | 60000       | No       |
| `RATE_LIMITER_MAX_REQUESTS` | Max requests per window | 100         | No       |
| `PAGINATION_DEFAULT_PAGE`   | Default page number     | 1           | No       |
| `PAGINATION_DEFAULT_LIMIT`  | Default items per page  | 10          | No       |
| `PAGINATION_MAX_LIMIT`      | Maximum items per page  | 100         | No       |
| `FRONTEND_URL`              | Allowed CORS origin     | -           | No       |
| `GOOGLE_APP_USER`           | Gmail email address     | -           | No       |
| `GOOGLE_APP_PASSWORD`       | Gmail app password      | -           | No       |
| `QUEUE_POLL_INTERVAL`       | Queue poll interval(ms) | 1000        | No       |

## Database Schema

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Todos Table

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  user_id INT NOT NULL,
  due_date DATE,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Revoked Tokens Table

```sql
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(512) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expires_at (expires_at),
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Queue Jobs Table

```sql
CREATE TABLE IF NOT EXISTS queue_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  payload TEXT NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Access Token**: Short-lived token (default: 1 hour) used for API requests
2. **Refresh Token**: Long-lived token (default: 7 days) used to obtain new access tokens

### Authentication Flow

1. **Register**: POST `/api/auth/register` → Returns access token and refresh token
2. **Login**: POST `/api/auth/login` → Returns access token and refresh token
3. **API Requests**: Include `Authorization: Bearer <access_token>` header
4. **Refresh Token**: POST `/api/auth/refresh-token` with refresh token to get new access token
5. **Logout**: POST `/api/auth/logout` → Token is blacklisted

### Protected Routes

Include the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Request/Response Examples

### Register User

**Request:**

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": "1h"
}
```

### Login User

**Request:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": "1h"
}
```

### Create Todo

**Request:**

```http
POST /api/todos
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the todo app backend",
  "dueDate": "2024-12-31",
  "priority": "high"
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Complete project",
    "description": "Finish the todo app backend",
    "completed": false,
    "user_id": 1,
    "due_date": "2024-12-31",
    "priority": "high",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Todos (with pagination)

**Request:**

```http
GET /api/todos?page=1&limit=10&completed=false&priority=high
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Todos retrieved successfully",
  "todos": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the todo app backend",
      "completed": false,
      "user_id": 1,
      "due_date": "2024-12-31",
      "priority": "high",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Refresh Token

**Request:**

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "message": "Token refreshed successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": "1h"
}
```

### Logout

**Request:**

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

## Error Handling

The API uses conventional HTTP status codes:

| Status Code | Description           |
| ----------- | --------------------- |
| 200         | Success               |
| 201         | Created               |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 404         | Not Found             |
| 429         | Too Many Requests     |
| 500         | Internal Server Error |

### Error Response Format

```json
{
  "status": "error",
  "error": "Error details",
  "message": "Human-readable error message"
}
```

### Common Error Messages

- `No token provided` - Missing Authorization header
- `Invalid token` - Token is invalid or expired
- `Token expired` - Access token has expired
- `User with this email already exists` - Duplicate email on registration
- `User with this username already exists` - Duplicate username on registration
- `Invalid email or password` - Incorrect login credentials
- `Todo not found` - Todo ID doesn't exist or belongs to another user
- `Please provide username, email, and password` - Missing required fields
- `Title is required` - Missing todo title

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per minute per IP address
- **Headers**: Response includes rate limit headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when the limit resets

When the limit is exceeded, the API returns a `429 Too Many Requests` error:

```json
{
  "error": "Quá nhiều requests"
}
```

## Logging

The application logs errors to the `logs/` directory:

- **Error Log**: `logs/error.log`

Error logs include:

- Timestamp
- HTTP method
- Request URL
- Client IP
- Error message
- Stack trace

## Project Features Details

### Middleware

1. **authRequired** - Validates JWT access token from Authorization header
2. **rateLimiter** - Implements sliding window rate limiting
3. **errorHandler** - Catches and formats all errors
4. **response** - Provides helper methods for JSON responses
5. **notFound** - Handles undefined routes

### Security Measures

1. **Password Hashing**: Uses bcrypt with salt factor 10
2. **SQL Injection Prevention**: Uses prepared statements via mysql2
3. **JWT Algorithm Restriction**: Only accepts HS256 algorithm
4. **Token Blacklisting**: Stores invalidated tokens in database
5. **CORS Configuration**: Configurable allowed origins

### Database

1. **Connection Pooling**: Uses mysql2 connection pool for efficient connection management
2. **Auto Table Creation**: Tables are created automatically on server start
3. **Foreign Key Constraints**: Ensures data integrity
4. **Indexes**: Optimized for common queries

### Queue System

The background job queue uses a polling mechanism to process asynchronous tasks:

1. **Job Types**:
   - `sendVerifyEmail` - Sends email verification links to new users
   - `sendPasswordChangeEmail` - Notifies users when password is changed

2. **Job Status Flow**:
   - `pending` → Job is waiting to be processed
   - `processing` → Job is currently being handled
   - `completed` → Job finished successfully
   - `failed` → Job encountered an error (will be retried on next poll)

3. **Processing Flow**:
   - Queue worker polls database every second
   - Fetches oldest pending job
   - Executes corresponding task handler
   - Updates job status based on result
   - Continues to next job

4. **Email Service**:
   - Uses Nodemailer with Gmail SMTP
   - Requires Google App Password for authentication
   - Supports both text and HTML email content

### Module Aliases

The project uses `module-alias` for cleaner import paths:

| Alias | Path   |
| ----- | ------ |
| `@/`  | `src/` |

Example usage:

```javascript
const userModel = require("@/models/user.model"); // src/models/user.model
```

## License

MIT License - Feel free to use this project for your own purposes.
