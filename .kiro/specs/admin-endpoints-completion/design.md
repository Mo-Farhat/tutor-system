# Design Document

## Overview

This design document outlines the implementation of missing admin endpoints for the Strive Academy tutoring platform. The solution focuses on creating a comprehensive admin API layer that connects all platform components through centralized management endpoints. The design leverages existing database models and follows established patterns in the codebase.

## Architecture

### API Layer Structure
```
/api/admin/
├── users/                 # User management endpoints
├── applications/          # Tutor application management
├── assignments/           # Student-tutor assignment management
├── profiles/              # Profile management (existing, enhanced)
├── tokens/                # Token management
├── stats/                 # Dashboard statistics
├── activity/              # Recent activity tracking
├── tutors/                # Enhanced tutor management
└── change-requests/       # Tutor change request management
```

### Authentication & Authorization
- All admin endpoints require Bearer token authentication
- Role-based access control validates admin role
- Middleware validates admin permissions before endpoint access
- Token refresh handling for expired sessions

### Response Format Standardization
All endpoints follow consistent response format:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }, // for list endpoints
  "message": "Optional success message"
}
```

## Components and Interfaces

### 1. Admin User Management Controller
**File**: `backend/src/controllers/adminUserController.js`

**Endpoints**:
- `GET /api/admin/users` - List users with filtering and pagination
- `GET /api/admin/users/:id` - Get specific user details
- `PUT /api/admin/users/:id` - Update user information
- `DELETE /api/admin/users/:id` - Delete user account

**Features**:
- Role-based filtering (student, tutor, admin)
- Search by name, email, username
- Pagination with configurable page sizes
- Audit logging for user modifications

### 2. Admin Assignment Management Controller
**File**: `backend/src/controllers/adminAssignmentController.js`

**Endpoints**:
- `GET /api/admin/assignments` - List all student-tutor assignments
- `GET /api/admin/assignments/:id` - Get assignment details
- `POST /api/admin/assignments` - Create new assignment
- `PUT /api/admin/assignments/:id` - Update assignment
- `DELETE /api/admin/assignments/:id` - Delete assignment

**Features**:
- Assignment status management (active, paused, ended)
- Student and tutor relationship tracking
- Subject-based filtering
- Assignment history and audit trails

### 3. Admin Statistics Controller
**File**: `backend/src/controllers/adminStatsController.js`

**Endpoints**:
- `GET /api/admin/stats/dashboard` - Comprehensive dashboard statistics
- `GET /api/admin/stats/sessions` - Session-related statistics
- `GET /api/admin/stats/revenue` - Revenue and financial metrics
- `GET /api/admin/stats/compliance` - Compliance alerts and issues

**Features**:
- Real-time calculation of platform metrics
- Caching for performance optimization
- Configurable date ranges for statistics
- Compliance monitoring and alerting

### 4. Admin Activity Controller
**File**: `backend/src/controllers/adminActivityController.js`

**Endpoints**:
- `GET /api/admin/activity/recent` - Recent platform activity
- `POST /api/admin/activity/log` - Log administrative actions
- `GET /api/admin/activity/types` - Available activity types

**Features**:
- Activity categorization and prioritization
- Real-time activity feed
- Activity filtering by type and date
- Integration with notification system

### 5. Admin Token Management Controller
**File**: `backend/src/controllers/adminTokenController.js`

**Endpoints**:
- `GET /api/admin/tokens` - List active tokens
- `DELETE /api/admin/tokens/:id` - Revoke specific token
- `POST /api/admin/tokens/cleanup` - Clean expired tokens

**Features**:
- Token type filtering (setup, auth, reset)
- Expiration monitoring
- Bulk token operations
- Security audit logging

### 6. Enhanced Admin Tutor Controller
**File**: `backend/src/controllers/adminTutorController.js` (enhanced existing)

**New Endpoints**:
- `GET /api/admin/tutors/:id/lessons/completed` - Tutor lesson history
- `POST /api/admin/tutors/:id/reviews` - Add tutor review
- `DELETE /api/admin/tutor-reviews/:id` - Remove tutor review
- `PUT /api/admin/tutors/:id/tier` - Change tutor tier

**Features**:
- Comprehensive tutor performance metrics
- Review management with source tracking
- Tier change validation and logging
- Lesson history with filtering

### 7. Admin Change Request Controller
**File**: `backend/src/controllers/adminChangeRequestController.js`

**Endpoints**:
- `GET /api/admin/change-requests` - List pending change requests
- `POST /api/admin/change-requests/:id/approve` - Approve change request
- `POST /api/admin/change-requests/:id/reject` - Reject change request
- `GET /api/admin/change-requests/:id` - Get change request details

**Features**:
- Change request workflow management
- Approval/rejection with comments
- Change history tracking
- Notification integration

## Data Models

### Activity Log Model
```javascript
// New model for tracking admin activities
model AdminActivity {
  id          Int      @id @default(autoincrement())
  type        String   // application, compliance, payment, session
  message     String
  priority    String   // high, medium, low
  icon        String   // FontAwesome icon class
  color       String   // Bootstrap color class
  userId      Int?     // Related user if applicable
  metadata    Json?    // Additional context data
  createdAt   DateTime @default(now())
  
  user User? @relation(fields: [userId], references: [id])
}
```

### Enhanced Statistics Views
```sql
-- Create materialized views for performance
CREATE MATERIALIZED VIEW admin_dashboard_stats AS
SELECT 
  COUNT(*) FILTER (WHERE role = 'student') as student_count,
  COUNT(*) FILTER (WHERE role = 'tutor') as tutor_count,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE) as new_users_today
FROM "User";
```

## Error Handling

### Standardized Error Responses
```javascript
// Error response format
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... } // Optional additional details
}
```

### Error Categories
- **VALIDATION_ERROR**: Input validation failures
- **AUTHORIZATION_ERROR**: Insufficient permissions
- **NOT_FOUND_ERROR**: Resource not found
- **CONFLICT_ERROR**: Business logic conflicts
- **INTERNAL_ERROR**: Server-side errors

### Error Handling Middleware
```javascript
// Centralized error handling for admin routes
const adminErrorHandler = (err, req, res, next) => {
  // Log error for monitoring
  console.error('Admin API Error:', err);
  
  // Determine error type and response
  const errorResponse = {
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  };
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(errorResponse);
};
```

## Testing Strategy

### Unit Testing
- Controller method testing with mocked dependencies
- Service layer testing for business logic
- Model validation testing
- Error handling scenario testing

### Integration Testing
- End-to-end API endpoint testing
- Database integration testing
- Authentication and authorization testing
- Cross-service communication testing

### Performance Testing
- Load testing for dashboard statistics endpoints
- Pagination performance testing
- Database query optimization testing
- Cache effectiveness testing

### Test Data Management
```javascript
// Test data factories for consistent testing
const createTestAdmin = () => ({
  firstName: 'Test',
  lastName: 'Admin',
  email: 'admin@test.com',
  username: 'testadmin',
  role: 'admin',
  status: 'active'
});

const createTestAssignment = () => ({
  studentId: 1,
  tutorId: 2,
  subject: 'VCE Chemistry',
  status: 'active'
});
```

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate data types and formats
- Implement rate limiting on admin endpoints
- SQL injection prevention through parameterized queries

### Access Control
- Role-based permissions for all admin operations
- Audit logging for sensitive operations
- Session management and timeout handling
- IP-based access restrictions for admin functions

### Data Privacy
- Mask sensitive information in logs
- Implement data retention policies
- Secure handling of personal information
- GDPR compliance for user data management

## Performance Optimization

### Caching Strategy
```javascript
// Redis caching for frequently accessed data
const cacheKeys = {
  DASHBOARD_STATS: 'admin:dashboard:stats',
  USER_COUNT: 'admin:users:count',
  RECENT_ACTIVITY: 'admin:activity:recent'
};

// Cache TTL configuration
const cacheTTL = {
  DASHBOARD_STATS: 300, // 5 minutes
  USER_COUNT: 600,      // 10 minutes
  RECENT_ACTIVITY: 60   // 1 minute
};
```

### Database Optimization
- Indexed queries for common filter operations
- Materialized views for complex statistics
- Connection pooling for concurrent requests
- Query result pagination to limit memory usage

### API Response Optimization
- Selective field inclusion based on request needs
- Compressed responses for large datasets
- Asynchronous processing for heavy operations
- Background job processing for non-critical tasks

## Monitoring and Logging

### Application Metrics
- API response times and error rates
- Database query performance
- Cache hit/miss ratios
- User activity patterns

### Logging Strategy
```javascript
// Structured logging for admin operations
const logAdminAction = (action, userId, details) => {
  logger.info('Admin Action', {
    action,
    adminUserId: userId,
    timestamp: new Date().toISOString(),
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};
```

### Health Checks
- Database connectivity monitoring
- External service availability
- Cache system health
- Background job queue status

This design provides a comprehensive foundation for implementing the missing admin endpoints while maintaining consistency with existing codebase patterns and ensuring scalability and maintainability.