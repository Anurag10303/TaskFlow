export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "TaskFlow API",
    version: "2.0.0",
    description:
      "Scalable REST API with JWT (HTTP-only cookies), RBAC (user/moderator/admin), task management, and admin panel.",
  },
  servers: [
    { url: "http://localhost:5000/api/v1", description: "Development" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: "HTTP-only cookie set on login/register",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", example: "jane@example.com" },
          role: { type: "string", enum: ["user", "moderator", "admin"] },
          isActive: { type: "boolean" },
          lastLogin: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["todo", "in-progress", "review", "done"],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          tags: { type: "array", items: { type: "string" } },
          dueDate: { type: "string", format: "date-time", nullable: true },
          assignedTo: { $ref: "#/components/schemas/User" },
          createdBy: { $ref: "#/components/schemas/User" },
          isArchived: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", example: "jane@example.com" },
                  password: { type: "string", example: "Password1" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created. Sets access_token + refresh_token cookies.",
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "OK. Sets HTTP-only cookies." },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token using refresh_token cookie",
        security: [],
        responses: {
          200: { description: "New access_token cookie set." },
          401: { description: "Invalid or expired refresh token" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout — clears cookies and revokes refresh token",
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: { description: "Not authenticated" },
        },
      },
    },
    "/auth/change-password": {
      patch: {
        tags: ["Auth"],
        summary: "Change password (revokes all sessions)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password changed, all sessions revoked" },
        },
      },
    },
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks (paginated, filterable)",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["todo", "in-progress", "review", "done"],
            },
          },
          {
            name: "priority",
            in: "query",
            schema: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "tags",
            in: "query",
            schema: { type: "string" },
            description: "Comma-separated tags",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", default: "-createdAt" },
          },
        ],
        responses: { 200: { description: "Paginated task list" } },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: {
                    type: "string",
                    enum: ["todo", "in-progress", "review", "done"],
                  },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                  },
                  tags: { type: "array", items: { type: "string" } },
                  dueDate: { type: "string", format: "date-time" },
                  assignedTo: {
                    type: "string",
                    description: "User ID (admin/moderator only)",
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Task created" } },
      },
    },
    "/tasks/stats": {
      get: {
        tags: ["Tasks"],
        summary: "Get task statistics",
        responses: { 200: { description: "Stats by status and priority" } },
      },
    },
    "/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Task" },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Update task",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Platform-wide stats (admin only)",
        responses: {
          200: { description: "Stats" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin only)",
        parameters: [
          { name: "role", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "User list" } },
      },
    },
    "/admin/users/{id}/role": {
      patch: {
        tags: ["Admin"],
        summary: "Change user role (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["user", "moderator", "admin"],
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Role updated" } },
      },
    },
    "/admin/users/{id}/toggle-active": {
      patch: {
        tags: ["Admin"],
        summary: "Activate/deactivate user (admin only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Status toggled" } },
      },
    },
  },
};
