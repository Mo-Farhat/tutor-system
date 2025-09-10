# Strive Academy Backend - Tutor Verification Flow

Node.js Express backend implementing the tutor verification and approval system for Strive Academy.

## 🚀 Features Implemented

### ✅ **Complete Tutor Verification Flow**

1. **Tutor Application Submission** - Multi-step form with validation
2. **Email Notifications** - Confirmation and admin notifications
3. **Admin Approval System** - Approve/reject applications
4. **Password Setup Flow** - Secure token-based account creation
5. **Authentication System** - JWT-based login for students and tutors

### ✅ **API Endpoints**

#### Authentication & Users

- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login (students, tutors, admin)
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/check-auth` - Check authentication status

#### Tutor Application System

- `POST /api/auth/tutor/apply` - Submit tutor application
- `POST /api/auth/tutor/approve/:id` - Approve application (admin)
- `GET /api/auth/tutor/setup-password/:token` - Verify setup token
- `POST /api/auth/tutor/setup-password/:token` - Complete password setup

#### Debug/Development

- `GET /api/auth/stats` - View application statistics
- `GET /api/auth/health` - Service health check

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory (copy from `.env.example`):

```env
PORT=8000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
ADMIN_EMAIL=admin@striveacademy.com
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Email Configuration
EMAIL_FROM=Strive Academy <noreply@striveacademy.com>
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Development Email (Ethereal Email - optional)
ETHEREAL_USER=ethereal.user@ethereal.email
ETHEREAL_PASS=ethereal.pass
```

#### Email Setup Instructions

**For Production (Gmail SMTP):**

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App passwords
3. Use your Gmail address and the app password in `.env`

**For Development (Ethereal Email):**

1. Visit https://ethereal.email/create
2. Copy the generated credentials to your `.env` file
3. Emails will be sent to Ethereal (test service) with preview URLs

### 3. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:8000`

## 🔄 **Tutor Verification Workflow**

### Step 1: Application Submission

```bash
POST /api/auth/tutor/apply
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+61400000000",
  "atar": 95.5,
  "currentStudy": "Medicine at University of Melbourne",
  "year12State": "Victoria",
  "year12CompletionYear": 2022,
  "currentState": "Victoria",
  "canCommit3Hours": "yes",
  "canCommit1Year": "yes",
  "canTutorMostWeeks": "yes",
  "canTutorGroups": "yes",
  "subjectsToTutor": "VCE Chemistry, VCE Physics, VCE Biology",
  "hasWorkingWithChildrenCheck": "no",
  "motivation": "I want to help students achieve their academic goals..."
}
```

**Response:**

- Application stored with status `pending`
- Confirmation email sent to applicant
- Admin notification email sent
- Returns application ID

### Step 2: Admin Approval

```bash
POST /api/auth/tutor/approve/1
```

**Response:**

- Application status updated to `approved`
- Setup token generated (7-day expiry)
- Approval email sent with setup link

### Step 3: Password Setup

```bash
# Verify token
GET /api/auth/tutor/setup-password/abc123token

# Set password
POST /api/auth/tutor/setup-password/abc123token
Content-Type: application/json

{
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response:**

- User account created with status `active`
- Application status updated to `onboarded`
- Tutor profile created
- JWT tokens returned for immediate login

### Step 4: Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

## 🗃️ **Data Storage (In-Memory)**

The system uses in-memory storage for development. Data includes:

- **Users** - Students, tutors, admins with authentication
- **Applications** - Tutor applications with status tracking
- **Profiles** - Tutor profiles and settings
- **Tokens** - Setup tokens with expiry

View current data: `GET /api/auth/stats`

## 📧 **Email System**

Currently logs emails to console in development mode. Emails sent:

1. **Application Confirmation** - Immediate after submission
2. **Admin Notification** - New application alert
3. **Approval Email** - With password setup link
4. **Rejection Email** - If application declined

## 🔐 **Security Features**

- **Password Hashing** - bcrypt with 12 salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Email, password strength, ATAR ranges
- **Token Expiry** - Setup tokens expire in 7 days
- **CORS Protection** - Configured for frontend domain

## 🧪 **Testing the Flow**

### 1. Submit Test Application

```bash
curl -X POST http://localhost:8000/api/auth/tutor/apply \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Tutor",
    "email": "test@example.com",
    "phone": "+61400000000",
    "atar": 95.5,
    "currentStudy": "Medicine",
    "motivation": "Test application"
  }'
```

### 2. Check Applications

```bash
curl http://localhost:8000/api/auth/stats
```

### 3. Approve Application (use ID from stats)

```bash
curl -X POST http://localhost:8000/api/auth/tutor/approve/1
```

### 4. Complete Setup (use token from console logs)

```bash
curl -X POST http://localhost:8000/api/auth/tutor/setup-password/TOKEN_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123"
  }'
```

### 5. Login as Tutor

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

## 🔧 **Frontend Integration**

The backend is designed to work with the existing frontend `authService.js`. Key endpoints match:

- Frontend calls `http://localhost:8000/api/auth/*`
- JWT tokens work with existing auth context
- Error responses match frontend expectations
- File uploads not yet implemented (placeholder for future)

## 📈 **Next Steps**

1. **Database Integration** - Replace in-memory with MongoDB/PostgreSQL
2. **File Upload System** - Handle resume and video submissions
3. **Email Service** - Integrate with SendGrid/AWS SES
4. **Admin Dashboard** - Web interface for reviewing applications
5. **Tutor Profile Management** - Complete profile and document system
6. **Student Features** - Registration and tutor discovery

## 🐛 **Debugging**

- Check console logs for email notifications
- Use `/api/auth/stats` to view all data
- JWT tokens logged in development mode
- All errors logged with stack traces
