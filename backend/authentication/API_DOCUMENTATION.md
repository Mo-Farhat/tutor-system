# Strive Academy Authentication API Documentation

## Overview
This API provides comprehensive user authentication and authorization for the Strive Academy platform with three user roles: Student, Tutor, and Admin.

## Base URL
```
http://localhost:8000/api/auth/
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## User Roles
- **Student**: Can register, login, update profile, search for tutors
- **Tutor**: Can register, login, update profile, manage tutor-specific information
- **Admin**: Can manage all users, approve/reject tutors, access admin features

---

## Authentication Endpoints

### 1. User Registration
**POST** `/register/`

Register a new user account.

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "role": "student",  // "student", "tutor", or "admin"
    "phone_number": "+1234567890",
    "date_of_birth": "1995-05-15"
}
```

**Response (201 Created):**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "student",
        "phone_number": "+1234567890",
        "date_of_birth": "1995-05-15",
        "profile_picture": null,
        "is_verified": false,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

### 2. User Login
**POST** `/login/`

Login with username and password.

**Request Body:**
```json
{
    "username": "john_doe",
    "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "student",
        // ... other user fields
    },
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

### 3. User Logout
**POST** `/logout/`
*Requires Authentication*

Logout and blacklist refresh token.

**Request Body:**
```json
{
    "refresh": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
    "message": "Logged out successfully"
}
```

### 4. Token Refresh
**POST** `/token/refresh/`

Refresh access token using refresh token.

**Request Body:**
```json
{
    "refresh": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
    "access": "new_access_token_here"
}
```

### 5. Check Authentication Status
**GET** `/check-auth/`
*Requires Authentication*

Check if user is authenticated and get user info.

**Response (200 OK):**
```json
{
    "authenticated": true,
    "user": {
        "id": 1,
        "username": "john_doe",
        // ... user fields
    }
}
```

---

## Profile Management Endpoints

### 6. User Profile
**GET/PUT** `/profile/`
*Requires Authentication*

Get or update user profile with role-specific data.

**GET Response (200 OK):**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    // ... user fields
    "profile": {
        // Role-specific profile data
        // For students: StudentProfile fields
        // For tutors: TutorProfile fields
        // For admins: AdminProfile fields
    }
}
```

**PUT Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "newemail@example.com",
    "phone_number": "+1234567890",
    "date_of_birth": "1995-05-15"
}
```

### 7. Change Password
**POST** `/change-password/`
*Requires Authentication*

Change user password.

**Request Body:**
```json
{
    "old_password": "oldpassword123",
    "new_password": "newpassword123",
    "new_password_confirm": "newpassword123"
}
```

**Response (200 OK):**
```json
{
    "message": "Password changed successfully"
}
```

---

## Student Endpoints

### 8. Student Profile
**GET/PUT** `/student/profile/`
*Requires Authentication (Student only)*

Manage student-specific profile information.

**PUT Request Body:**
```json
{
    "school": "ABC High School",
    "grade_level": "Grade 12",
    "subjects_of_interest": ["Mathematics", "Physics", "Chemistry"],
    "learning_goals": "Prepare for university entrance exams",
    "parent_email": "parent@example.com",
    "parent_phone": "+1234567890"
}
```

---

## Tutor Endpoints

### 9. Tutor Profile
**GET/PUT** `/tutor/profile/`
*Requires Authentication (Tutor only)*

Manage tutor-specific profile information.

**PUT Request Body:**
```json
{
    "bio": "Experienced mathematics tutor with 5 years of experience...",
    "qualifications": "graduate",
    "subjects_taught": ["Mathematics", "Physics"],
    "years_experience": 5,
    "hourly_rate": 45.00,
    "availability": "part_time",
    "university": "Oxford University",
    "degree": "BSc Mathematics"
}
```

### 10. List Tutors
**GET** `/tutors/`

Get list of approved tutors with filtering options.

**Query Parameters:**
- `subjects`: Comma-separated list of subjects
- `min_rate`: Minimum hourly rate
- `max_rate`: Maximum hourly rate
- `search`: Search by name or university

**Example:**
```
GET /tutors/?subjects=Mathematics,Physics&min_rate=20&max_rate=50&search=oxford
```

**Response (200 OK):**
```json
{
    "count": 25,
    "next": "http://localhost:8000/api/auth/tutors/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "user": {
                "id": 2,
                "username": "tutor_jane",
                "first_name": "Jane",
                "last_name": "Smith",
                // ... user fields
            },
            "bio": "Experienced tutor...",
            "qualifications": "graduate",
            "subjects_taught": ["Mathematics", "Physics"],
            "years_experience": 5,
            "hourly_rate": "45.00",
            "availability": "part_time",
            "university": "Oxford University",
            "degree": "BSc Mathematics",
            "is_approved": true,
            "rating": "4.8",
            "total_sessions": 120
        },
        // ... more tutors
    ]
}
```

### 11. Tutor Detail
**GET** `/tutors/<id>/`

Get detailed information about a specific tutor.

**Response (200 OK):**
```json
{
    "id": 1,
    "user": {
        // ... user fields
    },
    "bio": "Experienced tutor...",
    "qualifications": "graduate",
    "subjects_taught": ["Mathematics", "Physics"],
    "years_experience": 5,
    "hourly_rate": "45.00",
    "availability": "part_time",
    "university": "Oxford University",
    "degree": "BSc Mathematics",
    "is_approved": true,
    "rating": "4.8",
    "total_sessions": 120
}
```

---

## Admin Endpoints

### 12. Admin Profile
**GET/PUT** `/admin/profile/`
*Requires Authentication (Admin only)*

Manage admin-specific profile information.

### 13. Pending Tutor Applications
**GET** `/admin/tutors/pending/`
*Requires Authentication (Admin only)*

Get list of pending tutor applications for approval.

**Response (200 OK):**
```json
[
    {
        "id": 5,
        "user": {
            // ... user fields
        },
        "bio": "New tutor application...",
        "qualifications": "graduate",
        "is_approved": false,
        // ... other tutor fields
    },
    // ... more pending applications
]
```

### 14. Approve/Reject Tutor
**POST** `/admin/tutors/<tutor_id>/approve/`
*Requires Authentication (Admin only)*

Approve or reject a tutor application.

**Request Body:**
```json
{
    "is_approved": true  // or false to reject
}
```

**Response (200 OK):**
```json
{
    "message": "Tutor application approved successfully",
    "tutor": {
        // ... updated tutor profile
    }
}
```

### 15. User Management
**GET** `/admin/users/`
*Requires Authentication (Admin only)*

Get list of all users with optional role filtering.

**Query Parameters:**
- `role`: Filter by user role ("student", "tutor", "admin")

**Example:**
```
GET /admin/users/?role=student
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "student",
        // ... other user fields
    },
    // ... more users
]
```

---

## Error Responses

### 400 Bad Request
```json
{
    "field_name": ["Error message"],
    "another_field": ["Another error message"]
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "error": "Admin access required"
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

---

## File Uploads

For endpoints that support file uploads (profile pictures, tutor documents), use `multipart/form-data` content type.

Example for profile picture upload:
```javascript
const formData = new FormData();
formData.append('profile_picture', file);
formData.append('first_name', 'John');

fetch('/api/auth/profile/', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer ' + accessToken
    },
    body: formData
});
```

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Pagination is applied to list endpoints (20 items per page by default)
3. JWT tokens expire after 60 minutes (configurable)
4. Refresh tokens are valid for 7 days and rotate on use
5. Media files are served at `/media/` in development mode 