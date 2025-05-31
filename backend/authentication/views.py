from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import StudentProfile, TutorProfile, AdminProfile
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    StudentProfileSerializer, TutorProfileSerializer, AdminProfileSerializer,
    PasswordChangeSerializer, TutorApprovalSerializer, UserProfileUpdateSerializer,
    TutorApplicationSerializer
)
from .utils import send_tutor_application_confirmation, send_tutor_approval_email, send_tutor_rejection_email

User = get_user_model()

class UserRegistrationView(APIView):
    """Register a new user with role-based profile creation"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Registration successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TutorApplicationView(APIView):
    """Handle tutor application submissions and create ghost accounts"""
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        serializer = TutorApplicationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Create ghost account and tutor profile
                user, tutor_profile = serializer.create_ghost_account(serializer.validated_data)
                
                # Send confirmation email
                email_sent = send_tutor_application_confirmation(
                    user, 
                    tutor_profile, 
                    serializer.validated_data
                )
                
                response_data = {
                    'message': 'Application submitted successfully! We will review your application and contact you regarding the next steps.',
                    'application_id': tutor_profile.id,
                    'status': 'pending_review'
                }
                
                if email_sent:
                    response_data['email_confirmation'] = 'Confirmation email sent successfully'
                else:
                    response_data['email_confirmation'] = 'Application received but confirmation email failed to send'
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    'error': 'Failed to process application',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """Login user and return JWT tokens"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    """Logout user by blacklisting refresh token"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    """Get and update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        
        # Add role-specific profile data
        if user.role == 'student':
            profile = getattr(user, 'student_profile', None)
            if not profile:
                profile = StudentProfile.objects.create(user=user)
            user_data['profile'] = StudentProfileSerializer(profile).data
        elif user.role == 'tutor':
            profile = getattr(user, 'tutor_profile', None)
            if not profile:
                profile = TutorProfile.objects.create(user=user)
            user_data['profile'] = TutorProfileSerializer(profile).data
        elif user.role == 'admin':
            profile = getattr(user, 'admin_profile', None)
            if not profile:
                profile = AdminProfile.objects.create(user=user)
            user_data['profile'] = AdminProfileSerializer(profile).data
        
        return Response(user_data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordChangeView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(old_password):
                return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Student-specific views
class StudentProfileView(generics.RetrieveUpdateAPIView):
    """Get and update student profile"""
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        if self.request.user.role != 'student':
            return None
        profile, created = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile

# Tutor-specific views
class TutorProfileView(generics.RetrieveUpdateAPIView):
    """Get and update tutor profile"""
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        if self.request.user.role != 'tutor':
            return None
        profile, created = TutorProfile.objects.get_or_create(user=self.request.user)
        return profile

class TutorListView(generics.ListAPIView):
    """List all approved tutors"""
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = TutorProfile.objects.filter(is_approved=True)
        
        # Filter by subjects
        subjects = self.request.query_params.get('subjects', None)
        if subjects:
            subject_list = subjects.split(',')
            queryset = queryset.filter(subjects_taught__overlap=subject_list)
        
        # Filter by hourly rate range
        min_rate = self.request.query_params.get('min_rate', None)
        max_rate = self.request.query_params.get('max_rate', None)
        if min_rate:
            queryset = queryset.filter(hourly_rate__gte=min_rate)
        if max_rate:
            queryset = queryset.filter(hourly_rate__lte=max_rate)
        
        # Search by name or university
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(university__icontains=search)
            )
        
        return queryset

class TutorDetailView(generics.RetrieveAPIView):
    """Get specific tutor details"""
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.AllowAny]
    queryset = TutorProfile.objects.filter(is_approved=True)

# Admin-specific views
class AdminProfileView(generics.RetrieveUpdateAPIView):
    """Get and update admin profile"""
    serializer_class = AdminProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        if self.request.user.role != 'admin':
            return None
        profile, created = AdminProfile.objects.get_or_create(user=self.request.user)
        return profile

class AdminTutorApprovalView(APIView):
    """Admin view to approve/reject tutor applications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all pending tutor applications
        pending_tutors = TutorProfile.objects.filter(is_approved=False)
        serializer = TutorProfileSerializer(pending_tutors, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, tutor_id):
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        tutor_profile = get_object_or_404(TutorProfile, id=tutor_id)
        action = request.data.get('action')  # 'approve' or 'reject'
        reason = request.data.get('reason', '')  # Optional rejection reason
        
        if action == 'approve':
            # Approve the tutor
            tutor_profile.is_approved = True
            tutor_profile.approved_at = timezone.now()
            tutor_profile.password_setup_completed = False
            tutor_profile.regenerate_password_token()  # Generate new token
            tutor_profile.save()
            
            # Enable the user account
            tutor_profile.user.is_active = True
            tutor_profile.user.save()
            
            # Send approval email with setup link
            email_sent = send_tutor_approval_email(tutor_profile.user, tutor_profile)
            
            response_data = {
                'message': 'Tutor application approved successfully',
                'tutor': TutorProfileSerializer(tutor_profile).data
            }
            
            if email_sent:
                response_data['email_confirmation'] = 'Approval email sent successfully'
            else:
                response_data['email_confirmation'] = 'Approval processed but email failed to send'
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        elif action == 'reject':
            # Send rejection email
            email_sent = send_tutor_rejection_email(tutor_profile.user, tutor_profile, reason)
            
            # Delete the application (or mark as rejected)
            tutor_profile.user.delete()  # This will also delete the tutor_profile due to CASCADE
            
            response_data = {
                'message': 'Tutor application rejected successfully'
            }
            
            if email_sent:
                response_data['email_confirmation'] = 'Rejection email sent successfully'
            else:
                response_data['email_confirmation'] = 'Application rejected but email failed to send'
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        else:
            return Response({'error': 'Invalid action. Use "approve" or "reject"'}, status=status.HTTP_400_BAD_REQUEST)

class TutorPasswordSetupView(APIView):
    """Handle password setup for approved tutors"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        """Verify token and return tutor info"""
        try:
            tutor_profile = TutorProfile.objects.get(
                password_setup_token=token,
                is_approved=True,
                password_setup_completed=False
            )
            
            return Response({
                'valid': True,
                'first_name': tutor_profile.user.first_name,
                'last_name': tutor_profile.user.last_name,
                'email': tutor_profile.user.email,
                'university': tutor_profile.university
            }, status=status.HTTP_200_OK)
            
        except TutorProfile.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid or expired setup link'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, token):
        """Set password and complete setup"""
        try:
            tutor_profile = TutorProfile.objects.get(
                password_setup_token=token,
                is_approved=True,
                password_setup_completed=False
            )
            
            password = request.data.get('password')
            password_confirm = request.data.get('password_confirm')
            
            # Validate required fields
            if not password:
                return Response({
                    'error': 'Password is required'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if not password_confirm:
                return Response({
                    'error': 'Password confirmation is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Basic password length check
            if len(password) < 8:
                return Response({
                    'error': 'Password must be at least 8 characters long'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check password confirmation
            if password != password_confirm:
                return Response({
                    'error': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use Django's password validation
            try:
                validate_password(password, tutor_profile.user)
            except ValidationError as e:
                return Response({
                    'error': ' '.join(e.messages)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set the password
            user = tutor_profile.user
            user.set_password(password)
            user.is_active = True
            user.save()
            
            # Mark password setup as completed
            tutor_profile.password_setup_completed = True
            tutor_profile.save()
            
            # Return success message without tokens - user will need to login
            return Response({
                'message': 'Password set successfully! Please log in with your new password.',
                'email': user.email,
                'redirect_to_login': True
            }, status=status.HTTP_200_OK)
            
        except TutorProfile.DoesNotExist:
            return Response({
                'error': 'Invalid or expired setup link'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUserManagementView(APIView):
    """Admin view to manage all users"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth_status(request):
    """Check if user is authenticated and return user data"""
    return Response({
        'authenticated': True,
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)
