# Authentication API Integration - Frontend

This document explains the authentication integration between the React frontend and Django backend for Strive Academics.

## 🚀 Overview

The authentication system supports three user roles:
- **Students**: Can register via the signup page and access student features
- **Tutors**: Can login and access tutor dashboard features  
- **Admins**: Can login and access administrative features

## 📁 Files Structure

```
frontend/src/
├── services/
│   └── authService.js          # API service for authentication
├── contexts/
│   └── AuthContext.js          # React context for auth state
├── components/
│   ├── login-signup/
│   │   ├── login.jsx           # Login component (all roles)
│   │   └── signup.jsx          # Signup component (students only)
│   ├── snippets/
│   │   └── navbar.jsx          # Updated navbar with auth status
│   └── ProtectedRoute.jsx      # Component for protected routes
├── utils/
│   └── testAuth.js             # Testing utilities
└── App.jsx                     # Updated with AuthProvider
```

## 🔧 Key Features Implemented

### 1. **Authentication Service** (`authService.js`)
- JWT token management (access + refresh tokens)
- API communication with Django backend
- Automatic token refresh
- Error handling and validation
- Local storage for token persistence

### 2. **Authentication Context** (`AuthContext.js`)
- Global state management for user authentication
- React hooks for easy access (`useAuth`)
- Loading states and error handling
- Automatic authentication checking on app load

### 3. **Updated Components**

#### Login Component (`login.jsx`)
- ✅ Supports all user roles (student, tutor, admin)
- ✅ Form validation and error handling
- ✅ Automatic redirection based on user role
- ✅ Loading states and user feedback

#### Signup Component (`signup.jsx`)
- ✅ Student registration only
- ✅ Full name parsing (first + last name)
- ✅ Automatic username generation from email
- ✅ Password confirmation validation
- ✅ Link to tutor application page

#### Navbar Component (`navbar.jsx`)
- ✅ Dynamic authentication status display
- ✅ Role-based navigation menus
- ✅ User profile dropdown
- ✅ Logout functionality

### 4. **Protected Routes** (`ProtectedRoute.jsx`)
- ✅ Authentication requirement checking
- ✅ Role-based access control
- ✅ Automatic login redirection
- ✅ Loading states

## 🛠 Setup Instructions

### 1. Backend Setup
Make sure your Django backend is running:
```bash
cd backend
python manage.py runserver
# Should be running on http://localhost:8000
```

### 2. Frontend Setup
The authentication is already integrated. Just start the React app:
```bash
cd frontend
npm start
# Should be running on http://localhost:3000
```

## 📝 Usage Examples

### 1. **Student Registration Flow**
```javascript
// User visits /signup
// Fills in: name, email, phone, password
// System automatically:
// - Sets role as "student"
// - Creates username from email
// - Redirects to home page after registration
```

### 2. **Login Flow (All Roles)**
```javascript
// User visits /login
// Enters username + password
// System automatically:
// - Authenticates with backend
// - Stores JWT tokens
// - Redirects based on role:
//   - Student → Home page (/)
//   - Tutor → Account Settings (/tutor/account-settings)
//   - Admin → Admin Dashboard (/admin/dashboard)
```

### 3. **Using Authentication in Components**
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <h1>Welcome {user.first_name}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. **Creating Protected Routes**
```javascript
import ProtectedRoute from '../components/ProtectedRoute';

// Protect a route for authenticated users only
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />

// Protect a route for specific roles
<Route path="/tutor/dashboard" element={
  <ProtectedRoute allowedRoles={['tutor']}>
    <TutorDashboard />
  </ProtectedRoute>
} />
```

## 🧪 Testing

### Manual Testing
1. **Test Student Registration:**
   - Go to `/signup`
   - Fill in the form
   - Check if account is created and user is logged in

2. **Test Login:**
   - Go to `/login`
   - Try logging in with different user roles
   - Verify correct redirection

3. **Test Authentication State:**
   - Check navbar shows user info when logged in
   - Test logout functionality
   - Verify protected routes work

### Automated Testing
Use the test utilities:
```javascript
// In browser console
import testAuth from './src/utils/testAuth.js';

// Run complete test flow
testAuth.testFullAuthFlow();

// Or test individual functions
testAuth.testStudentRegistration();
testAuth.testLogin('username', 'password');
```

## 🔄 API Endpoints Used

| Endpoint | Method | Purpose | Access |
|----------|--------|---------|--------|
| `/api/auth/register/` | POST | Student registration | Public |
| `/api/auth/login/` | POST | User login (all roles) | Public |
| `/api/auth/logout/` | POST | User logout | Authenticated |
| `/api/auth/profile/` | GET | Get user profile | Authenticated |
| `/api/auth/check-auth/` | GET | Check auth status | Authenticated |
| `/api/auth/token/refresh/` | POST | Refresh access token | Public |

## 🎯 Role-Based Redirections

After successful login, users are redirected based on their role:

- **Students** → Home Page (`/`)
- **Tutors** → Account Settings (`/tutor/account-settings`)  
- **Admins** → Admin Dashboard (`/admin/dashboard`)

## 🔐 Security Features

1. **JWT Token Management:**
   - Access tokens (60 min lifetime)
   - Refresh tokens (7 days lifetime)
   - Automatic token refresh
   - Secure local storage

2. **Form Validation:**
   - Client-side validation
   - Server-side error handling
   - Password strength requirements
   - Email format validation

3. **Protected Routes:**
   - Authentication requirement
   - Role-based access control
   - Automatic redirects

## 🚨 Error Handling

The system handles various error scenarios:
- Invalid credentials
- Network errors
- Token expiration
- Validation errors
- Server errors

Errors are displayed to users with clear, actionable messages.

## 🔄 Authentication Flow

1. **User Registration/Login** → JWT tokens stored
2. **Page Navigation** → Auth context checks tokens
3. **API Requests** → Tokens automatically included
4. **Token Expiry** → Automatic refresh attempted
5. **Refresh Fails** → User redirected to login

## 📋 Next Steps

1. **Add Password Reset:** Implement forgot password functionality
2. **Email Verification:** Add email verification for new accounts
3. **Social Login:** Consider adding Google/Facebook login
4. **Profile Management:** Create user profile edit pages
5. **Session Management:** Add "remember me" functionality

## 🐛 Troubleshooting

**Common Issues:**

1. **CORS Errors:** Ensure Django CORS is configured for `localhost:3000`
2. **Token Issues:** Clear localStorage and try again
3. **API Errors:** Check Django backend is running on port 8000
4. **Form Validation:** Check console for detailed error messages

**Debug Tools:**
- Browser Network tab for API calls
- Console logs for authentication flow
- React DevTools for context state
- Django admin for user management

The authentication system is now fully integrated and ready for production use! 🎉 