# INFT Academic Management System --- Server

Backend API for the INFT Academic Management System.

**Stack:** Node.js · Express · TypeScript · Supabase Auth · PostgreSQL ·
Prisma 7.9.x · Zod · Jest

------------------------------------------------------------------------

## Requirements

Make sure you have installed:

-   Node.js
-   npm
-   A Supabase project
-   A PostgreSQL database

------------------------------------------------------------------------

## Setup

### 1. Install dependencies

From the server directory:

``` bash
npm install
```

### 2. Configure environment variables

Create:

``` text
.env
```

Add:

``` env
DATABASE_URL="your-runtime-postgres-connection-string"
DIRECT_URL="your-direct-postgres-connection-string"

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

PORT=5000
```

### Environment variables

  Variable                      Required   Used for
  ----------------------------- ---------- ------------------------------------
  `DATABASE_URL`                Yes        Prisma runtime database connection
  `DIRECT_URL`                  Yes        Prisma CLI/migrations
  `SUPABASE_URL`                Yes        Supabase project
  `SUPABASE_SERVICE_ROLE_KEY`   Yes        Server-side Supabase Auth
  `PORT`                        No         API port, defaults to `5000`

**Never expose `SUPABASE_SERVICE_ROLE_KEY` to the web or mobile
applications.**

------------------------------------------------------------------------

## 3. Set up the database

Apply the Prisma migrations:

``` bash
npx prisma migrate dev
```

Generate the Prisma client:

``` bash
npx prisma generate
```

The current database contains the application `User` model with:

``` text
id
email
role
createdAt
updatedAt
```

Available roles:

``` text
ADMIN
TEACHER
STUDENT
```

------------------------------------------------------------------------

## 4. Start the server

### Development

``` bash
npm run dev
```

The server runs on:

``` text
http://localhost:5000
```

If you changed `PORT`, use that port instead.

### Production build

``` bash
npm run build
npm start
```

------------------------------------------------------------------------

# API

Base URL:

``` text
http://localhost:5000
```

## Health check

``` http
GET /api/v1/health
```

Example:

``` bash
curl http://localhost:5000/api/v1/health
```

Expected response:

``` json
{
  "success": true,
  "message": "INFT AMS API is running"
}
```

------------------------------------------------------------------------

# Authentication

## Register

``` http
POST /api/auth/register
```

Request:

``` json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Example:

``` bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@example.com\",\"password\":\"password123\"}"
```

New users are registered with:

``` text
role = STUDENT
```

The public registration endpoint does not allow clients to create an
`ADMIN` or `TEACHER` account by sending a role.

------------------------------------------------------------------------

## Login

``` http
POST /api/auth/login
```

Request:

``` json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Example:

``` bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@example.com\",\"password\":\"password123\"}"
```

The successful response provides:

``` text
user
accessToken
refreshToken
```

Save the `accessToken` when calling protected endpoints.

------------------------------------------------------------------------

## Get current user

``` http
GET /api/auth/me
```

Header:

``` http
Authorization: Bearer <accessToken>
```

Example:

``` bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

------------------------------------------------------------------------

## Refresh session

``` http
POST /api/auth/refresh
```

Request:

``` json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

Example:

``` bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

A successful request returns a new session containing an access token
and refresh token.

------------------------------------------------------------------------

## Logout

``` http
POST /api/auth/logout
```

Header:

``` http
Authorization: Bearer <accessToken>
```

Example:

``` bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

------------------------------------------------------------------------

## Admin-only test endpoint

``` http
GET /api/auth/admin-test
```

Requires:

``` http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

Example:

``` bash
curl http://localhost:5000/api/auth/admin-test \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

Only an `ADMIN` user can access this endpoint.

A `STUDENT` or `TEACHER` receives:

``` text
403 Forbidden
```

------------------------------------------------------------------------

# Using the API from a frontend

For protected requests, send the Supabase access token returned by
login:

``` http
Authorization: Bearer <accessToken>
```

Example JavaScript:

``` ts
const response = await fetch("http://localhost:5000/api/auth/me", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const data = await response.json();
```

The backend verifies the token through Supabase and then finds the
corresponding application user in Prisma.

The relationship is:

``` text
Supabase Auth user.id
        =
Prisma User.id
```

------------------------------------------------------------------------

# Request validation

Authentication request bodies are validated with Zod.

Registration and login require:

``` text
valid email
password with at least 8 characters
```

Invalid requests return:

``` text
400 Bad Request
```

------------------------------------------------------------------------

# Available npm commands

``` bash
# Install dependencies
npm install

# Development server
npm run dev

# Build TypeScript
npm run build

# Start production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

------------------------------------------------------------------------

# Prisma commands

After changing `prisma/schema.prisma`:

``` bash
npx prisma migrate dev
npx prisma generate
```

For inspecting the database during development:

``` bash
npx prisma studio
```

Do not manually edit files inside:

``` text
src/generated/prisma/
```

They are generated by Prisma.

------------------------------------------------------------------------

# Project structure

``` text
server/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── prisma.ts
│   │   └── supabase.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── validate.middleware.ts
│   │
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       ├── auth.routes.ts
│   │       ├── auth.schema.ts
│   │       └── auth.service.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   └── auth/
│       └── auth.test.ts
│
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

------------------------------------------------------------------------

# Authentication flow

``` text
Client
  │
  ├── Register/Login
  ▼
Express API
  │
  ▼
Supabase Auth
  │
  ├── access token
  └── refresh token
  │
  ▼
Prisma User
  │
  └── role
```

For protected requests:

``` text
Client
  │
  │ Authorization: Bearer <token>
  ▼
authMiddleware
  │
  ▼
Supabase token verification
  │
  ▼
Prisma User lookup
  │
  ▼
req.user
  │
  ▼
Controller
```

For role-protected requests:

``` text
authMiddleware
      ↓
requireRole(...)
      ↓
controller
```

------------------------------------------------------------------------

# Common errors

### `401 Authentication required`

No valid Bearer token was provided.

Check:

``` http
Authorization: Bearer <accessToken>
```

### `401 Invalid or expired token`

The Supabase access token is invalid or expired. Log in again or refresh
the session.

### `404 User account not found`

The Supabase Auth user exists, but the corresponding Prisma `User`
record does not exist.

### `403 Forbidden`

The user is authenticated but does not have the role required by the
endpoint.

### `409 Email already registered`

The email is already registered.

### Database connection errors

Check:

``` env
DATABASE_URL
DIRECT_URL
```

and verify that PostgreSQL is reachable.

### Supabase errors

Check:

``` env
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

------------------------------------------------------------------------

# Tests

Run:

``` bash
npm test
```

The current authentication tests cover registration, login, `/me`,
refresh, logout, authentication middleware, and role authorization.

For coverage:

``` bash
npm run test:coverage
```

------------------------------------------------------------------------

# Security

Keep the following secrets server-side:

``` text
DATABASE_URL
DIRECT_URL
SUPABASE_SERVICE_ROLE_KEY
```

Do not commit `.env`.

Do not send the service role key to a frontend.

Do not allow public registration to choose privileged roles.

Protected API requests must use the access token:

``` http
Authorization: Bearer <accessToken>
```

------------------------------------------------------------------------

# Current backend scope

The server currently provides the authentication and authorization
foundation for the Academic Management System.

Implemented:

-   Supabase authentication
-   User registration
-   Login
-   Logout
-   Access-token authentication
-   Refresh-token flow
-   Current-user endpoint
-   Role-based authorization
-   Prisma user storage
-   Zod validation
-   Centralized error handling
-   Authentication tests

The academic modules such as students, courses, attendance, grades,
timetable, notifications, fees, and reports are not part of the current
server implementation yet.

------------------------------------------------------------------------

# Quick Start

If the environment is already configured, the shortest setup is:

``` bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Then open:

``` text
http://localhost:5000/api/v1/health
```

If it returns:

``` json
{
  "success": true,
  "message": "INFT AMS API is running"
}
```

the server is running correctly.
