from rest_framework import permissions

class IsStudentUser(permissions.BasePermission):
    """
    Custom permission to only allow students to access student-specific views.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'

class IsTutorUser(permissions.BasePermission):
    """
    Custom permission to only allow tutors to access tutor-specific views.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'tutor'

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admins to access admin-specific views.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user

class IsTutorOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow tutor owners or admins to access tutor profiles.
    """
    def has_object_permission(self, request, view, obj):
        # Admins can access all tutor profiles
        if request.user.role == 'admin':
            return True
        
        # Tutors can only access their own profile
        if request.user.role == 'tutor':
            return obj.user == request.user
        
        # Read-only access for others (students looking for tutors)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False 