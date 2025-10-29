# Requirements Document

## Introduction

This document outlines the requirements for implementing missing admin endpoints in the Strive Academy tutoring platform. The admin dashboard serves as the central hub for managing all aspects of the platform, connecting students, tutors, applications, assignments, and financial operations. Currently, many admin features in the frontend are calling non-existent backend endpoints, resulting in broken functionality.

## Glossary

- **Admin_System**: The administrative backend API system that manages platform operations
- **Dashboard_Stats**: Real-time statistics displayed on the admin home dashboard
- **User_Management**: CRUD operations for managing platform users across all roles
- **Assignment_System**: Student-tutor pairing and relationship management
- **Application_Workflow**: Tutor application review and approval process
- **Profile_Management**: Admin control over tutor and student profile visibility and status
- **Token_Management**: Administrative control over authentication and setup tokens
- **Statistics_Engine**: System that calculates and provides dashboard metrics
- **Notification_System**: Admin notification and activity tracking system

## Requirements

### Requirement 1

**User Story:** As an admin, I want to view comprehensive dashboard statistics, so that I can monitor platform health and performance at a glance.

#### Acceptance Criteria

1. WHEN an admin accesses the dashboard, THE Admin_System SHALL provide real-time session statistics including today's sessions, upcoming sessions, and completed sessions this week
2. WHEN dashboard statistics are requested, THE Admin_System SHALL calculate revenue metrics including current month revenue, previous month revenue, and growth percentage
3. WHEN the admin views the dashboard, THE Admin_System SHALL display pending application counts, pending document counts, and active review counts
4. WHEN compliance alerts are needed, THE Admin_System SHALL identify and count WWCC expiring, missing ABN, and contract pending items
5. THE Admin_System SHALL update dashboard statistics in real-time without requiring page refresh

### Requirement 2

**User Story:** As an admin, I want to manage all platform users from a centralized interface, so that I can maintain user accounts and resolve issues efficiently.

#### Acceptance Criteria

1. WHEN an admin requests user listings, THE Admin_System SHALL provide paginated user data with filtering by role, status, and search terms
2. WHEN an admin updates user information, THE Admin_System SHALL validate and persist changes to firstName, lastName, email, username, role, and status fields
3. WHEN an admin deletes a user, THE Admin_System SHALL remove the user account and handle cascading deletions appropriately
4. THE Admin_System SHALL support user search by name, email, or username with case-insensitive matching
5. WHEN user data is modified, THE Admin_System SHALL maintain audit trails of administrative changes

### Requirement 3

**User Story:** As an admin, I want to manage student-tutor assignments, so that I can ensure proper matching and resolve assignment issues.

#### Acceptance Criteria

1. WHEN an admin views assignments, THE Admin_System SHALL display all student-tutor pairs with student details, tutor details, subject, status, and dates
2. WHEN creating new assignments, THE Admin_System SHALL validate student and tutor availability and create the pairing relationship
3. WHEN an admin updates assignment status, THE Admin_System SHALL change the status to active, paused, or ended with appropriate date tracking
4. WHEN an admin deletes an assignment, THE Admin_System SHALL end the relationship and update related records
5. THE Admin_System SHALL provide assignment filtering by status, student, tutor, and subject

### Requirement 4

**User Story:** As an admin, I want to review and process tutor applications, so that I can onboard qualified tutors efficiently.

#### Acceptance Criteria

1. WHEN an admin views applications, THE Admin_System SHALL display all tutor applications with status, submission date, and applicant details
2. WHEN an admin approves an application, THE Admin_System SHALL change status to approved, create user account, and initiate onboarding workflow
3. WHEN an admin rejects an application, THE Admin_System SHALL change status to rejected and optionally send notification to applicant
4. THE Admin_System SHALL provide application filtering by status, submission date, and applicant search terms
5. WHEN application status changes, THE Admin_System SHALL log the change with admin user and timestamp

### Requirement 5

**User Story:** As an admin, I want to control tutor profile visibility and status, so that I can manage which tutors are available to students.

#### Acceptance Criteria

1. WHEN an admin makes a tutor live, THE Admin_System SHALL verify document upload completion and set is_live status to true
2. WHEN an admin makes a tutor offline, THE Admin_System SHALL set is_live status to false and remove from student-facing listings
3. WHEN profile status changes, THE Admin_System SHALL invalidate relevant caches and update search indexes
4. THE Admin_System SHALL prevent making tutors live without required documentation
5. WHEN admin updates tutor profiles, THE Admin_System SHALL validate tier changes and update profile data

### Requirement 6

**User Story:** As an admin, I want to manage authentication tokens, so that I can resolve login issues and clean up expired tokens.

#### Acceptance Criteria

1. WHEN an admin views tokens, THE Admin_System SHALL display all active tokens with type, user, expiration, and creation date
2. WHEN an admin deletes a token, THE Admin_System SHALL invalidate the token and log the administrative action
3. THE Admin_System SHALL provide token filtering by type, status, and expiration date
4. WHEN tokens expire, THE Admin_System SHALL automatically clean up expired tokens from the database
5. THE Admin_System SHALL track token usage and provide statistics on authentication patterns

### Requirement 7

**User Story:** As an admin, I want to view recent platform activity, so that I can monitor system usage and identify issues quickly.

#### Acceptance Criteria

1. WHEN an admin accesses the dashboard, THE Admin_System SHALL display recent activity including new applications, compliance alerts, payment issues, and completed sessions
2. WHEN activity events occur, THE Admin_System SHALL create timestamped activity records with event type, message, and priority level
3. THE Admin_System SHALL categorize activities by type with appropriate icons and color coding
4. WHEN an admin clicks on activity items, THE Admin_System SHALL navigate to relevant management sections
5. THE Admin_System SHALL limit recent activity display to the most recent 10-20 items for performance

### Requirement 8

**User Story:** As an admin, I want to manage tutor change requests, so that I can review and approve profile modifications.

#### Acceptance Criteria

1. WHEN tutors submit change requests, THE Admin_System SHALL create pending change request records with old and new values
2. WHEN an admin approves a change request, THE Admin_System SHALL apply the changes to the tutor profile and mark request as approved
3. WHEN an admin rejects a change request, THE Admin_System SHALL mark request as rejected with optional reason
4. THE Admin_System SHALL provide change request filtering by status, tutor, and request type
5. WHEN change requests are processed, THE Admin_System SHALL notify the requesting tutor of the decision

### Requirement 9

**User Story:** As an admin, I want to add and manage tutor reviews, so that I can maintain accurate tutor ratings and feedback.

#### Acceptance Criteria

1. WHEN an admin adds a tutor review, THE Admin_System SHALL create review record with content, source, and admin attribution
2. WHEN an admin removes a tutor review, THE Admin_System SHALL delete the review and recalculate tutor ratings
3. THE Admin_System SHALL support review sources including Google, internal, and other platforms
4. WHEN reviews are modified, THE Admin_System SHALL update tutor average ratings automatically
5. THE Admin_System SHALL maintain audit trails of review additions and removals

### Requirement 10

**User Story:** As an admin, I want to view tutor lesson history, so that I can assess tutor performance and resolve disputes.

#### Acceptance Criteria

1. WHEN an admin views tutor lessons, THE Admin_System SHALL display completed lessons with student, subject, date, and duration
2. THE Admin_System SHALL provide lesson filtering by date range, student, and subject
3. WHEN lesson disputes arise, THE Admin_System SHALL provide detailed lesson information including feedback and materials
4. THE Admin_System SHALL calculate lesson statistics including total hours, completion rates, and student satisfaction
5. WHEN accessing lesson data, THE Admin_System SHALL respect privacy requirements while providing necessary administrative information