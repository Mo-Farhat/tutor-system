# Tutor Application System Analysis

## Overview

The tutor application system is a comprehensive platform that manages the entire lifecycle of tutors from initial application to active tutoring. The system supports both the application process and ongoing tutor management through a dashboard interface.

## Frontend Analysis

### 1. Tutor Application Form (`joinus-form.jsx`)

**Location**: `frontend/src/components/joinus/joinus-form.jsx`

**Purpose**: Multi-step application form for potential tutors to apply to become tutors.

**Input Fields Identified**:

#### Step 1: Personal Information
- `fullName` (required) - Full name of applicant
- `phone` (required) - Phone number
- `email` (required) - Email address

#### Step 2: Education Background
- `currentStudy` - Current study program
- `year12State` - State where Year 12 was completed
- `year12CompletionYear` - Year of Year 12 completion
- `currentState` - Current state of residence
- `atar` - ATAR score (Australian Tertiary Admission Rank)

#### Step 3: Availability & Commitment
- `canCommit3Hours` (yes/no) - Can commit 3 hours per week
- `canCommit1Year` (yes/no) - Can commit for 1 year
- `canTutorMostWeeks` (yes/no) - Available most weeks
- `canTutorGroups` (yes/no) - Can tutor groups

#### Step 4: Tutoring Subjects & Qualifications
- `subjectsToTutor` (required) - Subjects they want to tutor
- `hasWorkingWithChildrenCheck` (yes/no) - Has WWCC

#### Step 5: Motivation
- `motivation` (required) - Why they want to become a tutor

#### Step 6: Video Submission
- `videoSubmission` (required) - Video file upload

#### Step 7: Document Upload
- `resume` (required) - Resume file upload

### 2. Tutor Dashboard Components

#### Profile Management (`profile.jsx`)
**Inputs**:
- Personal information (name, email, phone, bio)
- Education (schools attended, current studies)
- Subjects taught (year level, curriculum, subject)
- Locations (preferred tutoring locations)
- Profile picture
- Intro video
- Password changes

#### Documents Management (`documents.jsx`)
**Inputs**:
- Tutor contract upload
- WWCC (Working with Children Check) upload
- ABN number
- Document status tracking

#### Payment Details (`payment-details.jsx`)
**Inputs**:
- Payment method (bank, PayPal, Stripe)
- Bank details (account name, BSB, account number)
- ABN number
- PayPal email
- Stripe account ID

#### Availability Management (`calendar.jsx`)
**Inputs**:
- Weekly availability grid (morning/afternoon/night for each day)
- Availability notes
- Time slot preferences

#### Earnings Tracking (`earnings.jsx`)
**Displays**:
- Transaction history
- Payment status
- Lesson details
- Earnings summary

### 3. Tutor Information Display (`tutor-info.jsx`)

**Purpose**: Public display of tutor information for students/parents

**Displays**:
- Bio
- Preferred locations
- Subjects taught
- Schools attended
- Current studies
- Experience years
- Total lessons
- Introduction video

## Backend Models Created

### 1. TutorApplication
**Purpose**: Stores initial tutor applications

**Key Fields**:
- Personal information (name, phone, email)
- Education background (current study, Year 12 details, ATAR)
- Availability commitments (3 hours/week, 1 year, groups)
- Tutoring subjects and qualifications
- Motivation statement
- File uploads (video, resume)
- Application status and tracking

### 2. TutorProfile
**Purpose**: Active tutor profiles after application approval

**Key Fields**:
- Link to Django User
- Personal information (phone, bio, profile picture)
- Education (schools, current studies)
- Tutoring information (experience, lessons, locations)
- Video introduction
- Profile completion status

### 3. TutorSubject
**Purpose**: Subjects that tutors can teach

**Key Fields**:
- Year level (Year 11/12, Year 1-10)
- Curriculum/State (VCE, NSW, QLD)
- Subject name

### 4. TutorDocument
**Purpose**: Document management for tutors

**Key Fields**:
- Document type (contract, WWCC, ABN)
- File upload
- Status tracking
- Review information

### 5. TutorPaymentDetails
**Purpose**: Payment information for tutors

**Key Fields**:
- Payment method (bank, PayPal, Stripe)
- Bank details (account name, BSB, account number)
- ABN number
- Verification status

### 6. TutorAvailability
**Purpose**: Tutor availability schedule

**Key Fields**:
- Time slots (morning, afternoon, night)
- Days of week
- Availability status
- Notes

### 7. TutorEarnings
**Purpose**: Earnings and transaction tracking

**Key Fields**:
- Transaction type (lesson, bonus, refund)
- Amount and status
- Lesson details
- Payment information

### 8. TutorNotification
**Purpose**: Notification system for tutors

**Key Fields**:
- Notification type
- Title and message
- Read status

### 9. TutorTraining
**Purpose**: Training and onboarding tracking

**Key Fields**:
- Training type (orientation, safety, methods)
- Status and score
- Completion tracking

## System Flow

### 1. Application Process
1. User fills out multi-step application form
2. Application stored in `TutorApplication` model
3. Admin reviews application in Django admin
4. If approved, creates `TutorProfile` and Django User
5. Tutor receives password setup email

### 2. Onboarding Process
1. Tutor completes profile information
2. Uploads required documents (contract, WWCC)
3. Completes training modules
4. Sets up payment details
5. Configures availability schedule
6. Profile goes live for students

### 3. Active Tutoring
1. Students can view live tutor profiles
2. Book lessons with available tutors
3. Tutors track earnings and lessons
4. System manages payments and notifications

## API Endpoints Identified (from authService.js)

### Application Endpoints
- `POST /api/auth/tutor/apply/` - Submit tutor application
- `GET /api/auth/tutor/setup-password/{token}/` - Verify password setup
- `POST /api/auth/tutor/setup-password/{token}/` - Setup password

### Profile Endpoints
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `PUT /api/auth/tutor/profile/` - Update tutor profile

### Document Endpoints
- `GET /api/auth/tutor/documents/` - Get tutor documents
- `POST /api/auth/tutor/documents/` - Upload documents

### Payment Endpoints
- `GET /api/auth/tutor/payment-details/` - Get payment details
- `PUT /api/auth/tutor/payment-details/` - Update payment details
- `GET /api/auth/tutor/transactions/` - Get transaction history

### Subject Endpoints
- `GET /api/auth/subjects/` - Get subject selection data
- `GET /api/auth/tutor/subjects/` - Get tutor subjects
- `PUT /api/auth/tutor/subjects/` - Update tutor subjects

### Public Tutor Endpoints
- `GET /api/auth/tutors/live/` - Get live tutors
- `GET /api/auth/tutors/{id}/` - Get specific tutor

## Database Relationships

```
User (Django Auth)
└── TutorProfile (OneToOne)
    ├── TutorSubject (ForeignKey)
    ├── TutorDocument (ForeignKey)
    ├── TutorPaymentDetails (OneToOne)
    ├── TutorAvailability (ForeignKey)
    ├── TutorEarnings (ForeignKey)
    ├── TutorNotification (ForeignKey)
    └── TutorTraining (ForeignKey)

TutorApplication (Independent)
```

## Admin Interface Features

### TutorApplicationAdmin
- List display with key fields
- Status filtering and bulk actions
- File upload management
- Application review workflow

### TutorProfileAdmin
- Profile completion tracking
- Live status management
- Education information display

### TutorDocumentAdmin
- Document status tracking
- Bulk approval/rejection actions
- File management

### Other Admin Classes
- Comprehensive filtering and search
- Bulk actions for common operations
- Status management workflows

## File Upload Structure

```
media/
├── tutor_applications/
│   └── {application_id}/
│       ├── video_submission.mp4
│       └── resume.pdf
├── tutor_documents/
│   └── {tutor_id}/
│       ├── tutor_contract.pdf
│       └── wwcc_document.pdf
└── tutor_profiles/
    └── {tutor_id}/
        ├── profile_picture.jpg
        └── intro_video.mp4
```

## Security Considerations

1. **File Upload Security**: All file uploads are validated and stored in organized directories
2. **Authentication**: Uses Django's built-in authentication system
3. **Authorization**: Admin interface provides role-based access
4. **Data Validation**: Comprehensive field validation and constraints
5. **Audit Trail**: Timestamps and user tracking for all operations

## Scalability Features

1. **Modular Design**: Separate models for different concerns
2. **JSON Fields**: Flexible storage for lists (schools, studies, locations)
3. **Status Tracking**: Comprehensive status management across all models
4. **Admin Actions**: Bulk operations for efficient management
5. **File Organization**: Structured file storage system

## Next Steps

1. **API Development**: Create Django REST Framework views and serializers
2. **Authentication**: Implement JWT authentication system
3. **File Handling**: Set up proper file upload handling
4. **Email Integration**: Implement email notifications
5. **Testing**: Create comprehensive test suite
6. **Documentation**: API documentation and user guides

## Conclusion

The tutor application system is a comprehensive platform that handles the complete lifecycle of tutors from application to active tutoring. The backend models provide a robust foundation that supports all the functionality identified in the frontend components, with proper data relationships, file management, and administrative capabilities. 