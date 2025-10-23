# Missing Backend Endpoints - Product Requirements Document

## Overview
This document outlines the missing backend endpoints that need to be implemented to support the frontend application. The analysis is based on frontend API calls that are currently failing or using mock data.

## Priority Levels
- **HIGH**: Critical for core functionality
- **MEDIUM**: Important for user experience
- **LOW**: Nice to have features

---

## 1. ADMIN DASHBOARD ENDPOINTS

### 1.1 Admin Dashboard Statistics
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/stats
```
**Purpose**: Get dashboard overview statistics for admin home page

**Response Format**:
```json
{
  "success": true,
  "data": {
    "todaysSessions": 47,
    "upcomingSessions": 156,
    "completedThisWeek": 234,
    "thisMonthRevenue": 28450.75,
    "lastMonthRevenue": 26320.5,
    "revenueGrowth": 8.1,
    "pendingApplications": 12,
    "pendingDocuments": 8,
    "activeReviews": 5
  }
}
```

### 1.2 Admin User Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/admin/users
GET /api/admin/users/:id
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
```

**Purpose**: Complete CRUD operations for user management

**Query Parameters for GET /api/admin/users**:
- `role`: Filter by user role (student, tutor, admin)
- `page`: Pagination page number
- `pageSize`: Items per page
- `search`: Search by name, email, username

### 1.3 Admin Tutor Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/admin/tutors
GET /api/admin/tutors/:id
PUT /api/admin/tutors/:id/tier
POST /api/admin/tutors/:id/reviews
DELETE /api/admin/tutor-reviews/:id
```

**Purpose**: Tutor management and tier changes

### 1.4 Admin Application Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/admin/applications
GET /api/admin/applications/:id
PUT /api/admin/applications/:id
POST /api/admin/applications/:id/approve
POST /api/admin/applications/:id/reject
```

**Purpose**: Tutor application approval workflow

### 1.5 Admin Profile Management
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/admin/profiles
GET /api/admin/profiles/:userId
PUT /api/admin/profiles/:userId
PUT /api/admin/profiles/:userId/make-live
PUT /api/admin/profiles/:userId/make-offline
```

**Purpose**: Profile management and live status control

### 1.6 Admin Assignment Management
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/admin/assignments
GET /api/admin/assignments/:id
POST /api/admin/assignments
PUT /api/admin/assignments/:id
DELETE /api/admin/assignments/:id
```

**Purpose**: Student-tutor assignment management

### 1.7 Admin Token Management
**Priority: LOW**

#### Endpoints Needed:
```
GET /api/admin/tokens
DELETE /api/admin/tokens/:id
```

**Purpose**: Token management for admin operations

---

## 2. STUDENT DASHBOARD ENDPOINTS

### 2.1 Student Parent Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/student/parents
POST /api/auth/student/parents
PUT /api/auth/student/parents/:id
DELETE /api/auth/student/parents/:id
POST /api/auth/student/parents/:id/set-primary
```

**Purpose**: Student parent contact management

### 2.2 Student Lesson Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/student/lessons/upcoming
GET /api/auth/student/lessons/completed
GET /api/auth/student/lessons/:id
POST /api/auth/student/lessons/:id/feedback
GET /api/auth/student/lessons/:id/ics
```

**Purpose**: Student lesson tracking and feedback

### 2.3 Student Package Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/student/packages
POST /api/auth/student/packages/purchase
```

**Purpose**: Package browsing and purchasing

### 2.4 Student Payment Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/student/payments
GET /api/auth/student/invoices/:id
```

**Purpose**: Payment history and invoice access

### 2.5 Student Report Management
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/auth/student/reports
GET /api/auth/student/reports/:id
```

**Purpose**: Student progress reports

### 2.6 Student Achievement System
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/auth/student/achievements
```

**Purpose**: Student achievement tracking

### 2.7 Student Goal Management
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/auth/student/goals
POST /api/auth/student/goals
PUT /api/auth/student/goals/:id
DELETE /api/auth/student/goals/:id
```

**Purpose**: Student goal setting and tracking

### 2.8 Student Payment Methods
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/student/payment-methods
POST /api/auth/student/payment-methods
DELETE /api/auth/student/payment-methods/:id
```

**Purpose**: Payment method management

### 2.9 Student Support System
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/auth/student/support-tickets
POST /api/auth/student/support-tickets
```

**Purpose**: Support ticket system

---

## 3. TUTOR DASHBOARD ENDPOINTS

### 3.1 Tutor Lesson Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/tutor/lessons/upcoming
GET /api/auth/tutor/lessons/completed
GET /api/auth/tutor/lessons/:id
POST /api/auth/tutor/lessons
PUT /api/auth/tutor/lessons/:id
DELETE /api/auth/tutor/lessons/:id
```

**Purpose**: Tutor lesson management

### 3.2 Tutor Student Management
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/tutor/my-students
```

**Purpose**: Tutor's assigned students

### 3.3 Tutor Earnings
**Priority: HIGH**

#### Endpoints Needed:
```
GET /api/auth/tutor/earnings
```

**Purpose**: Tutor earnings tracking

### 3.4 Tutor Notifications
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/auth/tutor/notifications
```

**Purpose**: Tutor notification system

### 3.5 Tutor Report Management
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/auth/tutor/reports
GET /api/auth/tutor/reports/:id
POST /api/auth/tutor/reports
PUT /api/auth/tutor/reports/:id
DELETE /api/auth/tutor/reports/:id
```

**Purpose**: Tutor report creation and management

### 3.6 Tutor Change Requests
**Priority: MEDIUM**

#### Endpoints Needed:
```
POST /api/auth/tutor/change-requests
GET /api/auth/tutor/change-requests
```

**Purpose**: Tutor profile change requests

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 Admin Authentication
**Priority: HIGH**

#### Endpoints Needed:
```
POST /api/auth/create-admin
POST /api/auth/admin-login
```

**Purpose**: Admin authentication system

### 4.2 Token Management
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/auth/tokens
DELETE /api/auth/tokens/:id
```

**Purpose**: Token management and cleanup

---

## 5. CALENDAR & SCHEDULING

### 5.1 Admin Calendar
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/admin/calendar
GET /api/admin/calendar/:id
POST /api/admin/calendar
PUT /api/admin/calendar/:id
POST /api/admin/calendar/:id/reschedule
POST /api/admin/calendar/:id/complete
```

**Purpose**: Admin calendar management

---

## 6. FINANCE & BILLING

### 6.1 Admin Finance
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/admin/finance/overview
GET /api/admin/finance/revenue
GET /api/admin/finance/transactions
```

**Purpose**: Financial overview and reporting

---

## 7. PACKAGE MANAGEMENT

### 7.1 Admin Package Management
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/admin/packages
POST /api/admin/packages
PUT /api/admin/packages/:id
DELETE /api/admin/packages/:id
```

**Purpose**: Package creation and management

---

## 8. NOTIFICATION SYSTEM

### 8.1 Admin Notifications
**Priority: LOW**

#### Endpoints Needed:
```
GET /api/admin/notifications
POST /api/admin/notifications
PUT /api/admin/notifications/:id
DELETE /api/admin/notifications/:id
```

**Purpose**: Admin notification management

---

## 9. SUPPORT SYSTEM

### 9.1 Admin Support
**Priority: MEDIUM**

#### Endpoints Needed:
```
GET /api/admin/support/tickets
GET /api/admin/support/tickets/:id
PUT /api/admin/support/tickets/:id
```

**Purpose**: Support ticket management

---

## 10. BLOG MANAGEMENT

### 10.1 Admin Blog
**Priority: LOW**

#### Endpoints Needed:
```
GET /api/admin/blog/posts
POST /api/admin/blog/posts
PUT /api/admin/blog/posts/:id
DELETE /api/admin/blog/posts/:id
```

**Purpose**: Blog post management

---

## Implementation Notes

### Response Format Standard
All endpoints should follow this standard response format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Format Standard
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional additional details"
}
```

### Authentication
- All endpoints (except public ones) require Bearer token authentication
- Admin endpoints require admin role verification
- Student/Tutor endpoints require respective role verification

### Pagination
For list endpoints, implement pagination:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Query Parameters
- Implement filtering, sorting, and search capabilities
- Use consistent parameter names across similar endpoints
- Support date range filtering where applicable

---

## Priority Implementation Order

1. **Week 1**: Admin dashboard statistics and user management
2. **Week 2**: Student parent management and lesson tracking
3. **Week 3**: Tutor lesson management and earnings
4. **Week 4**: Payment methods and package management
5. **Week 5**: Report systems and notifications
6. **Week 6**: Support system and blog management

This PRD provides a comprehensive roadmap for implementing the missing backend endpoints to support the full frontend functionality.
