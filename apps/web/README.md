# Academic Management System — Web

The web application for the **Academic Management System**, built with React, TypeScript, and Vite.

## Tech Stack

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui
* Lucide React
* Oxlint

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

`VITE_API_URL` should point to the backend API.

### Start development server

```bash
npm run dev
```

Make sure the backend server is running as well.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server with HMR.

```bash
npm run build
```

Builds the application for production.

```bash
npm run lint
```

Runs Oxlint.

```bash
npm run preview
```

Locally previews the production build.

## Project Structure

```text
web/
├── public/
├── src/
│   ├── api/                 # API client
│   ├── assets/              # Static assets
│   ├── components/          # Reusable UI components
│   │   └── ui/
│   ├── features/            # Feature-specific code
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── student/
│   │   └── teacher/
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utility functions
│   ├── routes/              # Routing and route guards
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── public/
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Current Features

The web application currently includes:

* User registration
* User login
* Authentication state management
* Access and refresh token handling
* Logout
* Protected routes
* Role-based routing
* Admin dashboard
* Teacher dashboard
* Student dashboard
* Centralized API client
* Reusable UI components

More features will be added as development continues.

## Authentication

Authentication is handled through the backend API.

The web application communicates with:

```text
/api/auth/
```

The current authentication flow supports:

```text
Register
   ↓
Login
   ↓
Authenticated session
   ↓
Role-based dashboard
```

Current roles include:

```text
ADMIN
TEACHER
STUDENT
PARENT
```

The frontend handles authentication state and route protection, while the backend remains responsible for actual authorization and business logic.

## Backend

The web application communicates with the Express backend through the configured API URL.

For local development:

```text
Web     → http://localhost:5173
Server  → http://localhost:5000
```

Configure the API connection using:

```env
VITE_API_URL=http://localhost:5000/api
```

API requests should use the centralized client:

```text
src/api/client.ts
```

## Development Guidelines

Keep feature-specific code inside:

```text
src/features/
```

Reusable UI components belong inside:

```text
src/components/
```

API communication should use:

```text
src/api/client.ts
```

Routing and route protection should be handled inside:

```text
src/routes/
```

Follow the existing structure and conventions when adding new features.

## Oxlint

The project uses **Oxlint** for linting.

For production applications, type-aware linting can be enabled by installing `oxlint-tsgolint` and updating `.oxlintrc.json`.

Example:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": [
      "warn",
      {
        "allowConstantExport": true
      }
    ]
  }
}
```

See the [Oxlint documentation](https://oxc.rs/docs/guide/usage/linter/rules) for available rules and categories.

## Future Development

The application will continue to expand with features such as:

* Student management
* Courses and classes
* Attendance
* Grades and assessments
* Timetable
* Notifications
* Reports and analytics
* Role-specific functionality

The README should only be updated when there are meaningful changes to the project's setup, structure, or development workflow.
