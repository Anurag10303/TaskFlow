# TaskFlow — Full-Stack Task Management Platform

> Production-grade REST API with JWT authentication, 3-tier RBAC, and a React dashboard.  
> Built as a Backend Developer Intern assignment deliverable.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo & Docs](#live-demo--docs)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth Endpoints](#auth-endpoints)
  - [Task Endpoints](#task-endpoints)
  - [Admin Endpoints](#admin-endpoints)
- [Authentication Architecture](#authentication-architecture)
- [Role-Based Access Control](#role-based-access-control)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Frontend Features](#frontend-features)
- [Scalability Notes](#scalability-notes)
- [Assignment Checklist](#assignment-checklist)

---

## Overview

TaskFlow is a full-stack web application for task management that demonstrates:

- Secure user registration and login with **JWT (HTTP-only cookies)**
- **3-tier Role-Based Access Control** (user / moderator / admin)
- Full **CRUD** for tasks with filtering, pagination, tags, priorities, and due dates
- **Swagger/OpenAPI 3.0** interactive documentation
- A clean **React 19 + Vite** frontend dashboard
- Production-ready security hardening and modular architecture

---

## Live Demo & Docs

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000/api/v1` |
| Swagger Docs | `http://localhost:5000/api/v1/docs` |
| Health Check | `http://localhost:5000/health` |

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 5.x | Web framework |
| MongoDB | — | Database |
| Mongoose | 9.x | ODM |
| JSON Web Token | 9.x | Auth tokens |
| bcrypt | 6.x | Password hashing |
| helmet | 8.x | Security headers |
| express-rate-limit | 8.x | Rate limiting |
| express-validator | 7.x | Input validation |
| mongo-sanitize | 1.x | NoSQL injection prevention |
| winston | 3.x | Structured logging |
| swagger-ui-express | 5.x | API documentation |
| morgan | 1.x | HTTP request logging |
| cookie-parser | 1.x | Cookie parsing |
| cors | 2.x | Cross-origin resource sharing |
| nodemon | 3.x | Development auto-reload |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI framework |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Vite | 8.x | Build tool & dev server |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── logs/                        # Winston log files
│   └── src/
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── swagger.js           # OpenAPI 3.0 spec
│       ├── controllers/
│       │   ├── admin.controller.js  # Admin operations
│       │   ├── auth.controller.js   # Auth logic
│       │   └── task.controller.js   # Task CRUD
│       ├── middlewares/
│       │   ├── auth.middleware.js   # JWT protection
│       │   ├── error.middleware.js  # Global error handler
│       │   └── role.middleware.js   # RBAC guards
│       ├── models/
│       │   ├── task.model.js        # Task schema + indexes
│       │   └── user.model.js        # User schema + hooks
│       ├── routes/
│       │   ├── admin.routes.js
│       │   ├── auth.routes.js
│       │   └── task.routes.js
│       ├── utils/
│       │   ├── ApiError.js          # Custom error class
│       │   ├── logger.js            # Winston logger
│       │   └── tokens.js            # JWT helpers + cookie options
│       ├── validations/
│       │   └── validators.js        # express-validator chains
│       ├── app.js                   # Express app setup
│       └── server.js               # Entry point
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js             # Axios instance + refresh interceptor
        ├── context/
        │   └── AuthContext.jsx      # Auth state management
        ├── css/
        │   ├── auth.css             # Login/Register styles
        │   ├── Dashboard.css        # Dashboard styles
        │   └── Landing.css          # Landing page styles
        ├── pages/
        │   ├── Landing.jsx          # Public landing page
        │   ├── Dashboard.jsx        # Protected task dashboard
        │   ├── Login.jsx            # Login page
        │   └── Register.jsx         # Register page
        ├── App.jsx                  # Routes definition
        └── main.jsx                 # React entry point
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn**

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 4. Start development server
npm run dev
# Server starts at http://localhost:5000
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Opens at http://localhost:5173
```

The frontend Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskflow
# For Atlas: mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskflow

# JWT Secrets (use long random strings — 64+ chars recommended)
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars_here

# Token Expiry
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS — frontend origin
CLIENT_URL=http://localhost:5173
```

> **Security Note:** Never commit `.env` to version control. Add it to `.gitignore`.

---

## API Reference

All responses follow a consistent JSON format:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | [ ... ],
  "pagination": { "total": 42, "page": 1, "limit": 10, "pages": 5 },
  "errors": ["Validation error 1", "..."]
}
```

### Auth Endpoints

Base path: `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | Public | Register new user. Sets HTTP-only cookies. |
| `POST` | `/login` | Public | Login. Sets HTTP-only cookies. |
| `POST` | `/refresh` | Public | Rotate refresh token. Issues new access token. |
| `POST` | `/logout` | 🔒 Auth | Clear cookies, revoke refresh token. |
| `GET` | `/me` | 🔒 Auth | Get current user profile. |
| `PATCH` | `/change-password` | 🔒 Auth | Change password. Revokes all sessions. |

**Register / Login Request Body:**
```json
{
  "name": "Jane Doe",       // register only
  "email": "jane@example.com",
  "password": "Password1"   // min 8 chars, 1 uppercase, 1 number
}
```

**Response (201/200):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": {
    "id": "664abc...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "isActive": true,
    "lastLogin": "2024-...",
    "createdAt": "2024-..."
  }
}
```

---

### Task Endpoints

Base path: `/api/v1/tasks` — all require authentication.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/` | 🔒 Auth | List tasks. Paginated, filterable. |
| `POST` | `/` | 🔒 Auth | Create a new task. |
| `GET` | `/stats` | 🔒 Auth | Task statistics (by status & priority). |
| `GET` | `/:id` | 🔒 Auth | Get task by ID. |
| `PUT` | `/:id` | 🔒 Owner/Mod/Admin | Update task. |
| `DELETE` | `/:id` | 🔒 Owner/Mod/Admin | Delete task. |

**Query Parameters (GET `/`):**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `todo \| in-progress \| review \| done` | Filter by status |
| `priority` | `low \| medium \| high \| critical` | Filter by priority |
| `search` | `string` | Full-text search on title/description |
| `tags` | `string` | Comma-separated tag filter |
| `page` | `integer` | Page number (default: 1) |
| `limit` | `integer` | Results per page (default: 10, max: 100) |
| `sort` | `string` | Sort field (e.g., `-createdAt`, `dueDate`) |
| `archived` | `true \| false` | Show archived tasks |

**Create Task Request Body:**
```json
{
  "title": "Design landing page",
  "description": "Create hero, features, and CTA sections",
  "status": "in-progress",
  "priority": "high",
  "tags": ["design", "frontend"],
  "dueDate": "2024-12-31",
  "assignedTo": "userId123"  // admin/moderator only
}
```

---

### Admin Endpoints

Base path: `/api/v1/admin` — **admin role only**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stats` | Platform-wide user + task statistics |
| `GET` | `/users` | List all users (paginated, searchable) |
| `PATCH` | `/users/:id/role` | Change a user's role |
| `PATCH` | `/users/:id/toggle-active` | Activate / deactivate user account |

---

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Authentication Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Client                 Server                  Database        │
│     │                      │                        │            │
│     │─── POST /login ──────►│                        │            │
│     │                      │──── verify password ──►│            │
│     │                      │◄─── user data ─────────│            │
│     │                      │                        │            │
│     │◄── access_token ─────│  (HTTP-only cookie,    │            │
│     │    (15 min)           │   15 min, path: /)     │            │
│     │◄── refresh_token ────│  (HTTP-only cookie,    │            │
│     │    (7 days)           │   7d, path: /refresh)  │            │
│     │                      │──── store refresh ────►│            │
│     │                      │    token in DB          │            │
│     │                      │                        │            │
│     │─── API request ──────►│                        │            │
│     │   (cookie auto-sent) │──── verify access ─────┤            │
│     │◄── 200 response ─────│    token               │            │
│     │                      │                        │            │
│     │─── (token expired) ──►│                        │            │
│     │◄── 401 ──────────────│                        │            │
│     │                      │                        │            │
│     │─── POST /refresh ────►│                        │            │
│     │   (refresh cookie)   │──── verify + rotate ──►│            │
│     │◄── new access_token ─│    old ──► new refresh │            │
│     │                      │                        │            │
└─────────────────────────────────────────────────────────────────┘
```

**Key properties:**
- Access tokens stored in HTTP-only cookies → immune to XSS attacks
- Refresh tokens stored in DB → can be revoked server-side
- Token rotation on every refresh → old token invalidated immediately
- Reuse detection: if a stolen token is used, ALL sessions are revoked
- Up to **5 concurrent device sessions** per user
- Password change → all sessions revoked automatically

---

## Role-Based Access Control

```
┌─────────────────────────────────────────────────┐
│                  Role Hierarchy                  │
│                                                  │
│   admin (level 3)                                │
│     ├── Everything below                         │
│     ├── User management (activate/deactivate)    │
│     ├── Role assignment                          │
│     └── Platform-wide statistics                 │
│                                                  │
│   moderator (level 2)                            │
│     ├── Everything below                         │
│     ├── View ALL tasks                           │
│     ├── Edit/delete ANY task                     │
│     └── Assign tasks to users                    │
│                                                  │
│   user (level 1)                                 │
│     ├── Create tasks                             │
│     ├── View own tasks + assigned tasks          │
│     └── Edit/delete own tasks only               │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

### User Model

```javascript
{
  name:              String (2–50 chars, required),
  email:             String (unique, lowercase, validated),
  password:          String (hashed with bcrypt 12 rounds, select: false),
  role:              enum ['user', 'moderator', 'admin'] (default: 'user'),
  refreshTokens:     [String] (select: false, max 5),
  isActive:          Boolean (default: true),
  lastLogin:         Date,
  passwordChangedAt: Date,
  createdAt:         Date (auto),
  updatedAt:         Date (auto)
}
```

### Task Model

```javascript
{
  title:       String (3–120 chars, required),
  description: String (max 1000 chars),
  status:      enum ['todo', 'in-progress', 'review', 'done'] (default: 'todo'),
  priority:    enum ['low', 'medium', 'high', 'critical'] (default: 'medium'),
  tags:        [String] (max 5 tags),
  dueDate:     Date (nullable),
  assignedTo:  ObjectId → User (ref),
  createdBy:   ObjectId → User (ref, required),
  isArchived:  Boolean (default: false),
  createdAt:   Date (auto),
  updatedAt:   Date (auto)
}

// Compound indexes for query performance:
{ createdBy: 1, status: 1, createdAt: -1 }
{ assignedTo: 1, status: 1 }
{ tags: 1 }
```

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 12 salt rounds |
| Token storage | HTTP-only cookies (XSS-proof) |
| Token expiry | Access: 15 min · Refresh: 7 days |
| Token rotation | New refresh token on every use |
| Reuse detection | Revoke all sessions on stolen token reuse |
| Security headers | `helmet` (CSP, HSTS, X-Frame-Options, etc.) |
| Rate limiting | 200 req/15 min global · 20 req/15 min on auth routes |
| Input validation | `express-validator` on all endpoints |
| NoSQL injection | `mongo-sanitize` middleware |
| CORS | Whitelist-only origins with credentials |
| Request size limit | 10kb body limit |
| Error handling | Operational errors only exposed to client |
| Logging | Winston with file + console transports |

---

## Frontend Features

- **Landing page** — Hero, features grid, API routes showcase, CTA
- **Register** — Real-time password strength indicator, validation
- **Login** — JWT cookie-based auth, auto-redirect
- **Dashboard** — Task grid with filters, search, pagination
- **Task CRUD** — Create/edit modal, inline delete with optimistic UI
- **Stats bar** — Live counts by status (todo, in-progress, review, done)
- **Toast notifications** — Success/error feedback
- **Role display** — Color-coded role badge (user/moderator/admin)
- **Auto token refresh** — Axios interceptor silently refreshes expired tokens
- **Responsive** — Mobile-first CSS with breakpoints at 768px and 480px
- **Skeleton loading** — Animated placeholders during data fetch

---

## Scalability Notes

### Current Architecture (Monolith)
The application follows a clean **MVC monolith** with clearly separated concerns, making it easy to extract services later.

### Horizontal Scaling
- **Stateless JWT**: The API is fully stateless at the request level. Any number of server instances can handle any request — no session affinity required.
- Deploy behind an **Nginx / AWS ALB** load balancer without any code changes.

### Database Scaling
- **Compound indexes** on `createdBy + status + createdAt`, `assignedTo + status`, and `tags` cover the most common query patterns.
- MongoDB supports **replica sets** (read scaling) and **sharding** (write scaling) as data grows.
- Swap refresh token storage to **Redis** for O(1) token lookups at scale.

### Caching (Recommended Next Step)
```
Redis Layer:
  - Cache GET /tasks responses by user + filter hash (TTL: 30s)
  - Cache /tasks/stats (TTL: 60s)
  - Store refresh tokens (O(1) lookup vs MongoDB O(log n))
  - Session blacklist for instant logout propagation
```

### Microservices Migration Path
The modular structure allows clean extraction:
```
taskflow-auth-service    (auth routes + user model)
taskflow-task-service    (task routes + task model)
taskflow-admin-service   (admin routes)
taskflow-gateway         (Nginx / Kong API gateway)
```
Services communicate via **shared JWT secret** or **JWKS endpoint**.

### Deployment Readiness
- **Docker-ready**: Each service needs only a `Dockerfile` + `docker-compose.yml`
- **Environment-based config**: All secrets via `.env` / Kubernetes secrets
- **Graceful shutdown**: `SIGTERM` / `SIGINT` handlers close connections cleanly
- **Health endpoint**: `GET /health` for load balancer probes
- **Structured logging**: Winston JSON logs ready for ELK / Datadog ingestion

---

## Assignment Checklist

### ✅ Backend (Primary Focus)
- [x] User registration & login APIs with **password hashing** (bcrypt 12 rounds)
- [x] **JWT authentication** via HTTP-only cookies (access + refresh token rotation)
- [x] **Role-based access control** — user, moderator, admin
- [x] Full **CRUD APIs** for tasks (create, read, update, delete)
- [x] **API versioning** (`/api/v1/...`)
- [x] Global **error handling** with consistent response format
- [x] **Input validation** on all endpoints (express-validator)
- [x] **API documentation** — Swagger UI at `/api/v1/docs` (OpenAPI 3.0)
- [x] **MongoDB** schema with Mongoose ODM and compound indexes

### ✅ Basic Frontend (Supportive)
- [x] Built with **React 19 + Vite**
- [x] **Landing page** — public marketing page
- [x] **Register & Login** UI with client-side validation
- [x] **Protected dashboard** — requires JWT (redirects if unauthenticated)
- [x] **CRUD actions** — create, edit, delete tasks from the UI
- [x] **Error/success messages** from API responses (toast notifications)

### ✅ Security & Scalability
- [x] Secure JWT token handling (HTTP-only cookies, rotation, reuse detection)
- [x] Input **sanitization** (mongo-sanitize) & **validation** (express-validator)
- [x] **Scalable project structure** — modular MVC, easy to add new modules
- [x] **Rate limiting** (global + auth-specific)
- [x] **Helmet** security headers
- [x] **Logging** with Winston (console + file transports)
- [x] **Scalability notes** documented (Redis, microservices, Docker path)

---

## Quick Start Summary

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev

# Visit:
# http://localhost:5173        ← Landing page
# http://localhost:5173/register ← Create account
# http://localhost:5173/login    ← Sign in
# http://localhost:5173/dashboard ← Task dashboard
# http://localhost:5000/api/v1/docs ← Swagger UI
```

---

*Built for the Primetrade.ai Backend Developer Intern assignment. All core requirements implemented and production-ready.*