# Organization-Based Academic Management System

## 1. Overview

The Academic Management System is being designed as a **generalized organization-based platform** rather than a system tied to a single school, college, or institution.

The system should allow multiple independent organizations to use the same application while keeping their users and academic data completely separated.

Examples of organizations could eventually include:

- Colleges
- Schools
- Universities
- Coaching institutes
- Training institutes
- Educational organizations

The first version will intentionally keep the architecture simple.

We will **not** build a complex enterprise permission system at this stage. Instead, the system will use three core concepts:

```text
User
Organization
Membership
```

A membership connects a user to an organization and determines the user's role within that organization.

---

# 2. Core Architecture

The fundamental relationship will be:

```text
User
  │
  ▼
Membership
  │
  ├── Organization
  │
  └── Role
```

For example:

```text
Himanshu
   │
   ▼
Membership
   │
   ├── ABC College
   └── SUPER_ADMIN
```

Another user could be:

```text
Rahul
   │
   ▼
Membership
   │
   ├── ABC College
   └── STUDENT
```

The important idea is that a **user is a person**, while a **membership describes that person's relationship with an organization**.

---

# 3. Why Organizations?

The current system assumes that there is only one institution.

That creates a limitation:

```text
System
 ├── Admin
 ├── Teacher
 └── Student
```

There is no clear separation between different institutions.

The new architecture changes this to:

```text
System
│
├── Organization A
│   ├── Super Admin
│   ├── Admins
│   ├── Teachers
│   └── Students
│
├── Organization B
│   ├── Super Admin
│   ├── Admins
│   ├── Teachers
│   └── Students
│
└── Organization C
    ├── Super Admin
    ├── Admins
    ├── Teachers
    └── Students
```

This allows the same application to support multiple organizations without mixing their data.

---

# 4. Main Entities

## 4.1 User

A `User` represents a person who has an account in the system.

A user should contain identity-related information such as:

```text
User
├── id
├── email
├── name
└── profile information
```

The user should **not** be permanently defined as an admin, teacher, or student.

Instead, their role comes from their membership.

---

# 5. Organization

An `Organization` represents an institution using the system.

Examples:

```text
ABC College
XYZ University
PQR Academy
```

Basic structure:

```text
Organization
├── id
├── name
└── other organization information
```

Each organization owns its own academic data.

---

# 6. Membership

`Membership` connects a user to an organization.

It contains:

```text
Membership
├── id
├── userId
├── organizationId
└── role
```

The role will initially be one of:

```text
SUPER_ADMIN
ADMIN
TEACHER
STUDENT
```

For example:

```text
User: Rahul
Organization: ABC College
Role: STUDENT
```

creates a membership:

```text
Rahul
   │
   └── ABC College → STUDENT
```

This approach is much more flexible than storing a global role directly on the user.

---

# 7. Roles

The first version will have four roles.

## SUPER_ADMIN

The person who creates the organization becomes its Super Admin.

The Super Admin has complete control over that organization.

Responsibilities can include:

- Managing the organization
- Managing admins
- Managing teachers
- Managing students
- Managing academic data
- Managing courses
- Managing organization settings

There will initially be **one Super Admin per organization**.

---

## ADMIN

Admins help manage the organization.

Initially, admins can manage areas such as:

- Students
- Teachers
- Courses
- Attendance
- Grades
- Other academic data

We will **not initially restrict admins to departments**.

Department-level administration can be added later if the project requires it.

---

## TEACHER

Teachers primarily work with academic data.

They can eventually:

- View assigned students
- View assigned courses
- Mark attendance
- Manage grades
- View academic information

The exact teacher capabilities will be implemented as the related modules are developed.

---

## STUDENT

Students are primarily consumers of academic information.

They can eventually:

- View their profile
- View courses
- View attendance
- View grades
- View other information made available to them

---

# 8. Organization Creation Flow

The first important user flow will be organization creation.

```text
User signs up
      │
      ▼
Create Organization
      │
      ▼
Organization created
      │
      ▼
Membership created
      │
      ▼
Role = SUPER_ADMIN
```

For example:

```text
Himanshu creates:

ABC College
```

The system automatically creates:

```text
User
Himanshu

Organization
ABC College

Membership
Himanshu → ABC College → SUPER_ADMIN
```

The user does not need to separately assign themselves the Super Admin role.

---

# 9. Student Joining an Organization

Students should be able to join an organization.

The initial version should keep this flow simple.

```text
Student signs up
      │
      ▼
Join Organization
      │
      ▼
Search/select organization
      │
      ▼
Membership created
      │
      ▼
Role = STUDENT
```

For example:

```text
Student
   │
   ▼
Search "ABC College"
   │
   ▼
Join
   │
   ▼
ABC College → STUDENT
```

An invitation or approval system is **not required in the first version**.

If the project later requires stronger onboarding controls, we can add:

- Invitations
- Join requests
- Admin approval
- Organization codes

These should be considered future improvements rather than initial requirements.

---

# 10. Teacher Creation

Teachers can be added by an authorized organization administrator.

Initial flow:

```text
Super Admin / Admin
        │
        ▼
Create or invite teacher
        │
        ▼
Teacher account
        │
        ▼
Membership
        │
        ▼
Role = TEACHER
```

An existing student may also eventually be assigned the teacher role.

This should not be treated as physically converting the user from one type of person into another.

Instead, their organization membership/role changes.

The underlying user account remains the same.

---

# 11. Multi-Organization Support

The architecture should allow a user to belong to more than one organization.

For example:

```text
User
 │
 ├── Organization A → SUPER_ADMIN
 │
 └── Organization B → TEACHER
```

This capability does not need to be exposed heavily in the first version, but the database design should not prevent it.

This is one of the main reasons we are using `Membership`.

---

# 12. Organization Context

Once a user logs in, the application needs to know which organization they are currently operating in.

The general flow will be:

```text
Login
  │
  ▼
Authenticate User
  │
  ▼
Find Membership
  │
  ▼
Determine Organization
  │
  ▼
Determine Role
  │
  ▼
Open Dashboard
```

For a user who belongs to only one organization:

```text
Login
  ↓
ABC College
  ↓
Dashboard
```

If a user belongs to multiple organizations in the future:

```text
Login
  ↓
Select Organization
  ↓
Dashboard
```

The selected organization becomes the current organization context for the application.

---

# 13. Data Isolation

One of the most important requirements is that organizations must not be able to access each other's data.

For example:

```text
Organization A
 └── Student Rahul
```

and:

```text
Organization B
 └── Student Rahul
```

These are separate records even if the students have the same name.

Organization-specific data should therefore contain an `organizationId`.

For example:

```text
Student
├── id
├── userId
└── organizationId
```

```text
Course
├── id
├── name
└── organizationId
```

```text
Attendance
├── id
├── studentId
├── courseId
└── organizationId
```

This allows the backend to enforce:

```text
Current Organization
        ↓
organizationId
        ↓
Only access data belonging to that organization
```

The frontend should never be trusted to decide which organization a user is allowed to access.

Authorization must be enforced by the backend.

---

# 14. Authorization Strategy

The first version will use **simple role-based authorization**.

We will not implement a full permission-management system initially.

The basic model is:

```text
SUPER_ADMIN
ADMIN
TEACHER
STUDENT
```

The backend can use role middleware such as:

```text
requireRole(SUPER_ADMIN)
requireRole(ADMIN)
requireRole(TEACHER)
```

or combinations where required.

For example:

```text
Create Admin
→ SUPER_ADMIN only
```

```text
Create Teacher
→ SUPER_ADMIN / ADMIN
```

```text
Mark Attendance
→ TEACHER
```

```text
View Own Grades
→ STUDENT
```

This is intentionally simple.

---

# 15. Target User Experience

The final basic experience should feel simple.

### Super Admin

```text
Sign Up
   ↓
Create Organization
   ↓
Organization Dashboard
   ↓
Manage Admins
Manage Teachers
Manage Students
Manage Academics
```

### Admin

```text
Login
   ↓
Organization Dashboard
   ↓
Manage Students
Manage Teachers
Manage Academics
```

### Teacher

```text
Login
   ↓
Teacher Dashboard
   ↓
Courses
Attendance
Grades
Students
```

### Student

```text
Login
   ↓
Student Dashboard
   ↓
Courses
Attendance
Grades
Profile
```

The complexity should remain inside the backend architecture.

**The user experience should stay simple.**

---

# 16. Architectural Principle

The most important principle for this project is:

> **Start simple, but don't design ourselves into a corner.**

We will build only what the current application needs:

```text
User
Organization
Membership
Role
```

But we will structure these foundations so that more advanced functionality can be added later without replacing the entire authentication and authorization system.

The project should therefore grow like this:

```text
Simple Foundation
       ↓
Organization Support
       ↓
Academic Management
       ↓
More Organizations
       ↓
More Features
       ↓
Advanced Permissions (if needed)
```

Rather than trying to build everything from the beginning.

---

# 17. Final Target Architecture

The initial target architecture is:

```text
                         SYSTEM
                            │
              ┌─────────────┴─────────────┐
              │                           │
          ORGANIZATION A              ORGANIZATION B
              │                           │
       ┌──────┼──────┐             ┌──────┼──────┐
       │      │      │             │      │      │
      ADMIN  TEACHER STUDENT      ADMIN  TEACHER STUDENT
       │      │      │             │      │      │
       └──────┼──────┘             └──────┼──────┘
              │                           │
              ▼                           ▼
       Academic Data                Academic Data
       ├── Courses                  ├── Courses
       ├── Classes                  ├── Classes
       ├── Attendance               ├── Attendance
       └── Grades                   └── Grades
```

At the database level:

```text
USER
  │
  └── MEMBERSHIP
          │
          ├── ORGANIZATION
          │
          └── ROLE
```

This is the foundation we will build the rest of the Academic Management System on.