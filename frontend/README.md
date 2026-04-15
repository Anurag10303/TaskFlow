# TaskFlow Backend v2

Production-grade REST API — JWT via HTTP-only cookies, 3-tier RBAC, refresh token rotation, rate limiting, structured logging.

## Stack
- Node.js 20 + Express 5
- MongoDB + Mongoose
- JWT (access 15m + refresh 7d, HTTP-only cookies)
- bcrypt, helmet, express-rate-limit, express-mongo-sanitize, winston, swagger-ui-express

## Setup

```bash
cp .env.example .env
# fill in MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npm install
npm run dev
```

Server: `http://localhost:5000`  
Swagger: `http://localhost:5000/api/v1/docs`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRES` | Access token expiry (default `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token expiry (default `7d`) |
| `CLIENT_URL` | Frontend origin for CORS |
| `NODE_ENV` | `development` or `production` |

## API Routes

### Auth — `/api/v1/auth`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register, sets HTTP-only cookies |
| POST | `/login` | Public | Login, sets HTTP-only cookies |
| POST | `/refresh` | Public | Rotate refresh token |
| POST | `/logout` | Auth | Clear cookies, revoke refresh token |
| GET | `/me` | Auth | Current user profile |
| PATCH | `/change-password` | Auth | Change password, revoke all sessions |

### Tasks — `/api/v1/tasks`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Auth | List tasks (paginated, filtered) |
| POST | `/` | Auth | Create task |
| GET | `/stats` | Auth | Task statistics |
| GET | `/:id` | Auth | Get task by ID |
| PUT | `/:id` | Auth (owner/mod/admin) | Update task |
| DELETE | `/:id` | Auth (owner/mod/admin) | Delete task |

Query params: `status`, `priority`, `search`, `tags`, `page`, `limit`, `sort`, `archived`

### Admin — `/api/v1/admin` (admin only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/stats` | Platform-wide stats |
| GET | `/users` | List all users |
| PATCH | `/users/:id/role` | Change user role |
| PATCH | `/users/:id/toggle-active` | Activate/deactivate user |

## RBAC Roles

| Role | Permissions |
|------|------------|
| `user` | Own tasks only (create/read/update/delete) |
| `moderator` | All tasks + assign tasks |
| `admin` | Everything + user management |

## Security Features
- HTTP-only cookies (XSS-proof token storage)
- Refresh token rotation with reuse detection
- Multi-device sessions (up to 5 concurrent)
- All sessions revoked on password change
- `helmet` security headers
- `express-mongo-sanitize` NoSQL injection prevention
- Rate limiting: 200 req/15min global, 20 req/15min on auth
- Input validation + sanitization on all endpoints

## Scalability Notes
- **Stateless JWT** — horizontally scalable behind any load balancer
- **MongoDB indexes** on `createdBy + status + createdAt`, `assignedTo + status`, `tags`
- **Token revocation** via DB-stored refresh token list (can swap to Redis for O(1) lookup)
- **Modular structure** — add new modules by creating `model + controller + routes + validator`
- **Swap to microservices** by splitting auth-service and task-service; use shared JWT secret or JWKS