import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * UserSpecificLink - A component that generates user-specific URLs
 * 
 * @param {string} basePath - The base path for the link (e.g., '/dashboard/tutor/profile')
 * @param {string} userId - Optional specific user ID to use
 * @param {string} className - CSS classes for the link
 * @param {React.ReactNode} children - Link content
 * @param {object} ...props - Additional props to pass to the Link component
 */
function UserSpecificLink({ basePath, userId, className, children, ...props }) {
  const { getUserSpecificUrl, user, isAuthenticated } = useAuth();

  // If not authenticated, just return the base path
  if (!isAuthenticated) {
    return (
      <Link to={basePath} className={className} {...props}>
        {children}
      </Link>
    );
  }

  // Generate user-specific URL
  const userSpecificUrl = getUserSpecificUrl(basePath, userId);

  return (
    <Link to={userSpecificUrl} className={className} {...props}>
      {children}
    </Link>
  );
}

/**
 * UserProfileLink - Shortcut for profile links
 */
export function UserProfileLink({ className, children, ...props }) {
  const { isTutor, isStudent, isAdmin } = useAuth();

  let basePath = '/profile';
  if (isTutor()) {
    basePath = '/dashboard/tutor/profile';
  } else if (isStudent()) {
    basePath = '/dashboard/student/profile';
  } else if (isAdmin()) {
    basePath = '/dashboard/admin/profile';
  }

  return (
    <UserSpecificLink basePath={basePath} className={className} {...props}>
      {children}
    </UserSpecificLink>
  );
}

/**
 * UserDashboardLink - Shortcut for dashboard links
 */
export function UserDashboardLink({ className, children, ...props }) {
  const { isTutor, isStudent, isAdmin } = useAuth();

  let basePath = '/dashboard';
  if (isTutor()) {
    basePath = '/dashboard/tutor';
  } else if (isStudent()) {
    basePath = '/dashboard/student';
  } else if (isAdmin()) {
    basePath = '/dashboard/admin';
  }

  return (
    <UserSpecificLink basePath={basePath} className={className} {...props}>
      {children}
    </UserSpecificLink>
  );
}

/**
 * ConditionalUserLink - Shows different content based on authentication and role
 */
export function ConditionalUserLink({ 
  authenticatedContent, 
  unauthenticatedContent, 
  tutorContent, 
  studentContent, 
  adminContent,
  className,
  ...props 
}) {
  const { isAuthenticated, isTutor, isStudent, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return unauthenticatedContent || null;
  }

  if (isTutor() && tutorContent) {
    return tutorContent;
  }

  if (isStudent() && studentContent) {
    return studentContent;
  }

  if (isAdmin() && adminContent) {
    return adminContent;
  }

  return authenticatedContent || null;
}

export default UserSpecificLink; 