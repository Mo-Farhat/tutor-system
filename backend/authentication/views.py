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
    TutorApplicationSerializer, TutorDocumentUploadSerializer, TutorDocumentApprovalSerializer,
    PaymentDetailsSerializer, TutorPaymentSummarySerializer, TransactionSerializer,
    TutorSubjectSelectionSerializer
)
from .utils import send_tutor_application_confirmation, send_tutor_approval_email, send_tutor_rejection_email
from .subjects_data import YEAR_11_12_SUBJECTS, YEAR_1_10_SUBJECTS, CURRICULA, STATES, YEAR_LEVELS

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
        user_data = UserSerializer(user, context={'request': request}).data
        
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
                'user': UserSerializer(user, context={'request': request}).data
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
    parser_classes = [MultiPartParser, FormParser]
    
    def get_object(self):
        if self.request.user.role != 'tutor':
            return None
        profile, created = TutorProfile.objects.get_or_create(user=self.request.user)
        return profile

class TutorDocumentUploadView(APIView):
    """Handle document uploads for tutors"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        """Get current document status"""
        if request.user.role != 'tutor':
            return Response({'error': 'Tutor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
            data = {
                'tutor_contract': {
                    'file_url': tutor_profile.tutor_contract.url if tutor_profile.tutor_contract else None,
                    'status': tutor_profile.tutor_contract_status,
                    'uploaded': bool(tutor_profile.tutor_contract)
                },
                'wwcc_document': {
                    'file_url': tutor_profile.wwcc_document.url if tutor_profile.wwcc_document else None,
                    'status': tutor_profile.wwcc_status,
                    'uploaded': bool(tutor_profile.wwcc_document)
                },
                'account_live': tutor_profile.account_live,
                'documents_reviewed_at': tutor_profile.documents_reviewed_at
            }
            return Response(data, status=status.HTTP_200_OK)
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Upload documents"""
        if request.user.role != 'tutor':
            return Response({'error': 'Tutor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TutorDocumentUploadSerializer(tutor_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Documents uploaded successfully',
                'tutor_contract_status': tutor_profile.tutor_contract_status,
                'wwcc_status': tutor_profile.wwcc_status
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TutorPaymentDetailsView(APIView):
    """Handle tutor payment details management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get payment summary including balance and recent transactions"""
        if request.user.role != 'tutor':
            return Response({'error': 'Tutor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
            serializer = TutorPaymentSummarySerializer(tutor_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        """Update payment method details"""
        if request.user.role != 'tutor':
            return Response({'error': 'Tutor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PaymentDetailsSerializer(tutor_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Payment details updated successfully',
                'payment_details': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TutorTransactionHistoryView(APIView):
    """Get detailed transaction history for tutor"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'tutor':
            return Response({'error': 'Tutor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
            
            # Get query parameters for filtering
            status_filter = request.query_params.get('status', None)
            transaction_type = request.query_params.get('type', None)
            limit = int(request.query_params.get('limit', 50))
            
            # Build queryset
            transactions = tutor_profile.transactions.all()
            
            if status_filter:
                transactions = transactions.filter(status=status_filter)
            
            if transaction_type:
                transactions = transactions.filter(transaction_type=transaction_type)
            
            # Limit results
            transactions = transactions[:limit]
            
            serializer = TransactionSerializer(transactions, many=True)
            return Response({
                'transactions': serializer.data,
                'total_count': tutor_profile.transactions.count()
            }, status=status.HTTP_200_OK)
            
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)

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
    queryset = TutorProfile.objects.filter(
        is_approved=True,
        account_live=True,
        user__is_active=True
    ).select_related('user')

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

class AdminDocumentApprovalView(APIView):
    """Admin view to approve/reject tutor documents"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all tutors with pending documents"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get tutors with pending documents or approved tutors who need document review
        tutors_pending_docs = TutorProfile.objects.filter(
            is_approved=True,
            account_live=False
        ).filter(
            Q(tutor_contract_status='pending') | 
            Q(wwcc_status='pending') |
            Q(tutor_contract__isnull=False, tutor_contract_status='not_uploaded') |
            Q(wwcc_document__isnull=False, wwcc_status='not_uploaded')
        )
        
        serializer = TutorProfileSerializer(tutors_pending_docs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, tutor_id):
        """Approve or reject tutor documents"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(id=tutor_id)
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Update document statuses based on admin input
        data = {
            'tutor_contract_status': request.data.get('tutor_contract_status'),
            'wwcc_status': request.data.get('wwcc_status')
        }
        
        # Remove None values
        data = {k: v for k, v in data.items() if v is not None}
        
        serializer = TutorDocumentApprovalSerializer(
            tutor_profile, 
            data=data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_profile = serializer.save()
            
            response_data = {
                'message': 'Document status updated successfully',
                'tutor_contract_status': updated_profile.tutor_contract_status,
                'wwcc_status': updated_profile.wwcc_status,
                'account_live': updated_profile.account_live,
                'documents_reviewed_at': updated_profile.documents_reviewed_at
            }
            
            # Send notification if account is now live
            if updated_profile.account_live:
                response_data['account_status'] = 'Tutor account is now live!'
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TutorSubjectSelectionView(APIView):
    """Handle tutor subject selection management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current subject selections"""
        if request.user.role != 'tutor':
            return Response({'error': 'Tutor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
            return Response({
                'subjects_selected': tutor_profile.subjects_selected
            }, status=status.HTTP_200_OK)
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        """Update subject selections"""
        if request.user.role != 'tutor':
            return Response({'error': 'Tutor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tutor_profile = TutorProfile.objects.get(user=request.user)
        except TutorProfile.DoesNotExist:
            return Response({'error': 'Tutor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TutorSubjectSelectionSerializer(tutor_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Subject selections updated successfully',
                'subjects_selected': tutor_profile.subjects_selected
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubjectSelectionDataView(APIView):
    """API view to provide subject selection data for tutors"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """Return all subject selection data"""
        return Response({
            'year_levels': YEAR_LEVELS,
            'curricula': CURRICULA,
            'states': STATES,
            'year_11_12_subjects': YEAR_11_12_SUBJECTS,
            'year_1_10_subjects': YEAR_1_10_SUBJECTS
        }, status=status.HTTP_200_OK)

class LiveTutorsView(APIView):
    """Get all live tutors (account_live=True) for the find-a-tutor page"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """Get all tutors with account_live=True"""
        try:
            # Get tutors that are approved, have account_live=True, and are active users
            live_tutors = TutorProfile.objects.filter(
                account_live=True,
                is_approved=True,
                user__is_active=True
            ).select_related('user').order_by('-created_at')
            
            tutors_data = []
            for tutor in live_tutors:
                user = tutor.user
                
                # Determine status based on availability or other criteria
                tutor_status = "Available"  # You can customize this logic later
                
                # Create a comprehensive bio if none exists
                bio = tutor.bio
                if not bio:
                    subjects_text = ', '.join(tutor.subjects_selected[:2]) if tutor.subjects_selected else 'various subjects'
                    bio = f"Experienced tutor specializing in {subjects_text}. Committed to helping students achieve their academic goals."
                
                tutors_data.append({
                    'id': tutor.id,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'image': UserSerializer(user, context={'request': request}).data.get('profile_picture_url'),
                    'status': tutor_status,
                    'goldPoints': f"{tutor.rating}/5",  # Using rating as gold points
                    'atrPoints': str(tutor.atar) if tutor.atar else "N/A",
                    'bio': bio[:150] + "..." if len(bio) > 150 else bio,
                    'university': tutor.university,
                    'subjects': tutor.subjects_selected or tutor.subjects_taught or [],
                    'hourly_rate': str(tutor.hourly_rate) if tutor.hourly_rate else None,
                    'experience_years': tutor.experience_years,
                    'total_reviews': tutor.total_reviews,
                    'preferred_locations': tutor.preferred_locations or ['Online']
                })
            
            return Response({
                'tutors': tutors_data,
                'count': len(tutors_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch live tutors',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
