from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    TutorApplication, TutorProfile, TutorSubject, TutorDocument, 
    TutorPaymentDetails, TutorAvailability, TutorEarnings, 
    TutorNotification, TutorTraining, TutorPasswordSetupToken
)
from .serializers import (
    TutorApplicationSerializer, TutorApplicationResponseSerializer,
    TutorProfileSerializer, TutorProfileUpdateSerializer, TutorSubjectSerializer,
    TutorDocumentSerializer, TutorDocumentUploadSerializer, TutorPaymentDetailsSerializer,
    TutorPaymentDetailsUpdateSerializer, TutorAvailabilitySerializer, TutorEarningsSerializer,
    TutorNotificationSerializer, TutorTrainingSerializer
)
from .utils import send_tutor_application_confirmation


class TutorApplicationView(APIView):
    """Handle tutor application submission"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Submit a new tutor application"""
        try:
            # Convert frontend field names to backend field names
            data = request.data.copy()
            
            # Map frontend field names to backend field names
            field_mapping = {
                'fullName': 'full_name',
                'phone': 'phone',
                'email': 'email',
                'currentStudy': 'current_study',
                'year12State': 'year12_state',
                'year12CompletionYear': 'year12_completion_year',
                'currentState': 'current_state',
                'atar': 'atar',
                'canCommit3Hours': 'can_commit_3_hours',
                'canCommit1Year': 'can_commit_1_year',
                'canTutorMostWeeks': 'can_tutor_most_weeks',
                'canTutorGroups': 'can_tutor_groups',
                'subjectsToTutor': 'subjects_to_tutor',
                'hasWorkingWithChildrenCheck': 'has_working_with_children_check',
                'motivation': 'motivation',
                'videoSubmission': 'video_submission',
                'resume': 'resume'
            }
            
            # Convert field names
            converted_data = {}
            for frontend_field, backend_field in field_mapping.items():
                if frontend_field in data:
                    value = data[frontend_field]
                    
                    # Convert boolean strings to boolean
                    if frontend_field in ['canCommit3Hours', 'canCommit1Year', 'canTutorMostWeeks', 'canTutorGroups', 'hasWorkingWithChildrenCheck']:
                        value = value.lower() == 'yes'
                    
                    # Convert ATAR to float if provided
                    if frontend_field == 'atar' and value:
                        try:
                            value = float(value)
                        except (ValueError, TypeError):
                            value = None
                    
                    converted_data[backend_field] = value
            
            # Handle file uploads
            if 'videoSubmission' in request.FILES:
                converted_data['video_submission'] = request.FILES['videoSubmission']
            if 'resume' in request.FILES:
                converted_data['resume'] = request.FILES['resume']
            
            serializer = TutorApplicationSerializer(data=converted_data)
            
            if serializer.is_valid():
                application = serializer.save()
                
                # Send confirmation email
                try:
                    send_tutor_application_confirmation(application)
                except Exception as e:
                    print(f"Failed to send confirmation email: {str(e)}")
                
                # Return success response with application details
                response_data = {
                    'success': True,
                    'message': 'Tutor application submitted successfully!',
                    'application_id': application.application_id,
                    'status': application.status,
                    'data': TutorApplicationResponseSerializer(application).data
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Application submission failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TutorPasswordSetupView(APIView):
    """Handle tutor password setup after application approval"""
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        """Verify password setup token"""
        try:
            # Find the token record
            token_record = TutorPasswordSetupToken.objects.filter(
                token=token,
                used=False
            ).first()
            
            if not token_record:
                return Response({
                    'success': False,
                    'message': 'Invalid or expired token'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not token_record.is_valid():
                return Response({
                    'success': False,
                    'message': 'Token has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the associated application
            application = TutorApplication.objects.filter(email=token_record.user.email).first()
            
            return Response({
                'success': True,
                'message': 'Token is valid',
                'data': {
                    'token': token,
                    'email': token_record.user.email,
                    'username': token_record.user.username,
                    'first_name': token_record.user.first_name,
                    'last_name': token_record.user.last_name,
                    'full_name': token_record.user.get_full_name(),
                    'university': application.current_study if application else 'Not specified'
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Token verification failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, token):
        """Setup password for approved tutor"""
        try:
            password = request.data.get('password')
            confirm_password = request.data.get('password_confirm')  # Match frontend field name
            
            if not password or not confirm_password:
                return Response({
                    'success': False,
                    'message': 'Password and confirm password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if password != confirm_password:
                return Response({
                    'success': False,
                    'message': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find and validate the token
            token_record = TutorPasswordSetupToken.objects.filter(
                token=token,
                used=False
            ).first()
            
            if not token_record or not token_record.is_valid():
                return Response({
                    'success': False,
                    'message': 'Invalid or expired token'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set the password for the user
            user = token_record.user
            user.set_password(password)
            user.save()
            
            # Mark token as used
            token_record.used = True
            token_record.save()
            
            return Response({
                'success': True,
                'message': 'Password setup successful! You can now log in to your tutor dashboard.',
                'data': {
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.get_full_name()
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Password setup failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """Handle user login"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Authenticate user and return tokens"""
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({
                    'success': False,
                    'message': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Try to authenticate with username first
            user = authenticate(username=username, password=password)
            
            # If that fails, try to find user by email and authenticate
            if not user:
                try:
                    user_by_email = User.objects.get(email=username)
                    user = authenticate(username=user_by_email.username, password=password)
                except User.DoesNotExist:
                    user = None
            
            if not user:
                return Response({
                    'success': False,
                    'message': 'Invalid username or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # For now, return basic user info
            # In a real implementation, you'd generate JWT tokens here
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.get_full_name(),
                    'user_id': user.id,
                    'role': 'tutor'  # Since this is for approved tutors
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileView(APIView):
    """Handle user profile data"""
    permission_classes = [AllowAny]  # For now, allow any access
    
    def get(self, request):
        """Get user profile data"""
        try:
            # For now, return mock data since we don't have full user profiles set up
            # In a real implementation, this would get data from the authenticated user
            return Response({
                'success': True,
                'data': {
                    'username': 'notmanu232',
                    'email': 'notmanu23@gmail.com',
                    'first_name': 'tes',
                    'last_name': 'test',
                    'phone_number': '',
                    'profile': {
                        'bio': '',
                        'university': 'test',
                        'current_studies': ['test'],
                        'locations': [],
                        'subjects': []
                    }
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TutorProfileView(APIView):
    """Handle tutor profile management"""
    permission_classes = [AllowAny]  # For now, allow any access
    
    def get(self, request):
        """Get tutor profile"""
        try:
            # Get username from query parameters or use first user as fallback
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    profile = TutorProfile.objects.get(user=user)
                except (User.DoesNotExist, TutorProfile.DoesNotExist):
                    return Response({
                        'success': False,
                        'message': 'Profile not found for this user'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Fallback to first profile
                profile = TutorProfile.objects.first()
            
            if not profile:
                # Return mock data if no profile exists
                profile_data = {
                    'id': 1,
                    'user': {
                        'id': 1,
                        'username': 'notmanu232',
                        'email': 'notmanu23@gmail.com',
                        'first_name': 'tes',
                        'last_name': 'test'
                    },
                    'bio': 'Passionate tutor with experience in mathematics and science.',
                    'hourly_rate': '45.00',
                    'profile_picture': None,
                    'video_intro': None,
                    'university': 'University of Melbourne',
                    'current_studies': ['Bachelor of Science'],
                    'locations': ['Melbourne CBD', 'South Yarra'],
                    'subjects': [
                        {'year_level': 'Year 11/12', 'curriculum': 'VCE', 'subject': 'Mathematics'},
                        {'year_level': 'Year 11/12', 'curriculum': 'VCE', 'subject': 'Physics'}
                    ],
                    'availability': {
                        'monday': [{'start': '09:00', 'end': '17:00'}],
                        'tuesday': [{'start': '09:00', 'end': '17:00'}],
                        'wednesday': [{'start': '09:00', 'end': '17:00'}],
                        'thursday': [{'start': '09:00', 'end': '17:00'}],
                        'friday': [{'start': '09:00', 'end': '17:00'}]
                    },
                    'is_profile_complete': True,
                    'created_at': '2024-01-15T10:00:00Z',
                    'updated_at': '2024-01-15T10:00:00Z'
                }
            else:
                # Get real profile data
                profile_data = {
                    'id': profile.id,
                    'user': {
                        'id': profile.user.id,
                        'username': profile.user.username,
                        'email': profile.user.email,
                        'first_name': profile.user.first_name,
                        'last_name': profile.user.last_name
                    },
                    'bio': profile.bio,
                    'hourly_rate': str(profile.hourly_rate) if profile.hourly_rate else None,
                    'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
                    'video_intro': profile.video_intro.url if profile.video_intro else None,
                    'university': profile.university,
                    'current_studies': profile.current_studies,
                    'locations': profile.locations,
                    'subjects': profile.subjects,
                    'availability': profile.availability,
                    'is_profile_complete': profile.is_profile_complete,
                    'created_at': profile.created_at.isoformat(),
                    'updated_at': profile.updated_at.isoformat(),
                    # New fields for frontend compatibility
                    'atar': str(profile.atar) if profile.atar else None,
                    'rating': str(profile.rating) if profile.rating else '0.00',
                    'schools_attended': profile.schools_attended,
                    'preferred_locations': profile.preferred_locations,
                    'subjects_selected': profile.subjects_selected,
                    'phone_number': profile.phone_number,
                    'approved_at': profile.approved_at.isoformat() if profile.approved_at else None,
                    'account_live': profile.account_live
                }
            
            return Response({
                'success': True,
                'data': profile_data
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get tutor profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update tutor profile"""
        try:
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    profile = TutorProfile.objects.get(user=user)
                except (User.DoesNotExist, TutorProfile.DoesNotExist):
                    return Response({
                        'success': False,
                        'message': 'Profile not found for this user'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                profile = TutorProfile.objects.first()  # Fallback to first profile

            if not profile:
                return Response({
                    'success': False,
                    'message': 'No profile found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Update profile fields
            data = request.data
            
            # Check if profile should be marked as complete
            is_complete = (
                data.get('bio') and 
                data.get('hourly_rate') and 
                data.get('university') and 
                data.get('phone_number') and
                data.get('current_studies') and
                data.get('preferred_locations') and
                data.get('subjects_selected')
            )
            
            # Update fields
            if 'bio' in data:
                profile.bio = data['bio']
            if 'hourly_rate' in data:
                profile.hourly_rate = data['hourly_rate']
            if 'university' in data:
                profile.university = data['university']
            if 'current_studies' in data:
                profile.current_studies = data['current_studies']
            if 'locations' in data:
                profile.locations = data['locations']
            if 'subjects' in data:
                profile.subjects = data['subjects']
            if 'schools_attended' in data:
                profile.schools_attended = data['schools_attended']
            if 'preferred_locations' in data:
                profile.preferred_locations = data['preferred_locations']
            if 'subjects_selected' in data:
                profile.subjects_selected = data['subjects_selected']
            if 'phone_number' in data:
                profile.phone_number = data['phone_number']
            
            # Set completion status
            profile.is_profile_complete = is_complete
            
            profile.save()

            return Response({
                'success': True,
                'message': 'Profile updated successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to update profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TutorDocumentsView(APIView):
    """Handle tutor documents"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get tutor documents"""
        try:
            # Get username from query parameters or use first user as fallback
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    documents = TutorDocument.objects.filter(tutor=user)
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'User not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Fallback to first user
                user = User.objects.first()
                if user:
                    documents = TutorDocument.objects.filter(tutor=user)
                else:
                    documents = TutorDocument.objects.none()
            
            documents_data = []
            for doc in documents:
                documents_data.append({
                    'id': doc.id,
                    'document_type': doc.document_type,
                    'file': doc.file.url if doc.file else None,
                    'uploaded_at': doc.uploaded_at.isoformat(),
                    'is_verified': doc.is_verified
                })
            
            return Response({
                'success': True,
                'data': documents_data
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get documents: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Upload tutor document"""
        try:
            # Get username from query parameters or use first user as fallback
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'User not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Fallback to first user
                user = User.objects.first()
                if not user:
                    return Response({
                        'success': False,
                        'message': 'No user found'
                    }, status=status.HTTP_404_NOT_FOUND)

            # Get file and document type from request
            file_obj = request.FILES.get('file')
            document_type = request.data.get('document_type')

            if not file_obj:
                return Response({
                    'success': False,
                    'message': 'No file provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not document_type:
                return Response({
                    'success': False,
                    'message': 'Document type is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create the document record
            document = TutorDocument.objects.create(
                tutor=user,
                document_type=document_type,
                file=file_obj
            )

            return Response({
                'success': True,
                'message': 'Document uploaded successfully',
                'data': {
                    'id': document.id,
                    'document_type': document.document_type,
                    'file': document.file.url if document.file else None,
                    'uploaded_at': document.uploaded_at.isoformat(),
                    'is_verified': document.is_verified
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to upload document: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TutorPaymentDetailsView(APIView):
    """Handle tutor payment details"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get tutor payment details"""
        try:
            # Get username from query parameters or use first user as fallback
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    payment_details = TutorPaymentDetails.objects.filter(tutor=user).first()
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'User not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Fallback to first user
                user = User.objects.first()
                if user:
                    payment_details = TutorPaymentDetails.objects.filter(tutor=user).first()
                else:
                    payment_details = None
            
            if not payment_details:
                return Response({
                    'success': False,
                    'message': 'Payment details not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            payment_data = {
                'id': payment_details.id,
                'bank_name': payment_details.bank_name,
                'account_name': payment_details.account_name,
                'bsb': payment_details.bsb,
                'account_number': payment_details.account_number,
                'tax_file_number': payment_details.tax_file_number,
                'abn': payment_details.abn,
                'created_at': payment_details.created_at.isoformat(),
                'updated_at': payment_details.updated_at.isoformat()
            }
            
            return Response({
                'success': True,
                'data': payment_data
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get payment details: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update tutor payment details"""
        try:
            # Get username from query parameters or use first user as fallback
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    payment_details = TutorPaymentDetails.objects.filter(tutor=user).first()
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'User not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Fallback to first user
                user = User.objects.first()
                if user:
                    payment_details = TutorPaymentDetails.objects.filter(tutor=user).first()
                else:
                    payment_details = None
            
            if not payment_details:
                return Response({
                    'success': False,
                    'message': 'Payment details not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Update payment details fields
            update_fields = [
                'bank_name', 'account_name', 'bsb', 'account_number',
                'tax_file_number', 'abn'
            ]
            
            for field in update_fields:
                if field in request.data:
                    setattr(payment_details, field, request.data[field])
            
            payment_details.save()
            
            return Response({
                'success': True,
                'message': 'Payment details updated successfully',
                'data': {
                    'id': payment_details.id,
                    'bank_name': payment_details.bank_name,
                    'account_name': payment_details.account_name,
                    'bsb': payment_details.bsb,
                    'account_number': payment_details.account_number,
                    'tax_file_number': payment_details.tax_file_number,
                    'abn': payment_details.abn,
                    'created_at': payment_details.created_at.isoformat(),
                    'updated_at': payment_details.updated_at.isoformat()
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to update payment details: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TutorEarningsView(APIView):
    """Handle tutor earnings"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get tutor earnings"""
        try:
            # Get username from query parameters or use first user as fallback
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    earnings = TutorEarnings.objects.filter(tutor=user)
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'User not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Fallback to first user
                user = User.objects.first()
                if user:
                    earnings = TutorEarnings.objects.filter(tutor=user)
                else:
                    earnings = TutorEarnings.objects.none()
            
            earnings_data = []
            for earning in earnings:
                earnings_data.append({
                    'id': earning.id,
                    'amount': str(earning.amount),
                    'session_count': earning.session_count,
                    'period_start': earning.period_start.isoformat(),
                    'period_end': earning.period_end.isoformat(),
                    'created_at': earning.created_at.isoformat()
                })
            
            return Response({
                'success': True,
                'data': earnings_data
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get earnings: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TutorNotificationsView(APIView):
    """Handle tutor notifications"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get tutor notifications"""
        try:
            # Get username from query parameters or use first user as fallback
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    notifications = TutorNotification.objects.filter(tutor=user)
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'User not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Fallback to first user
                user = User.objects.first()
                if user:
                    notifications = TutorNotification.objects.filter(tutor=user)
                else:
                    notifications = TutorNotification.objects.none()
            
            notifications_data = []
            for notification in notifications:
                notifications_data.append({
                    'id': notification.id,
                    'notification_type': notification.notification_type,
                    'title': notification.title,
                    'message': notification.message,
                    'is_read': notification.is_read,
                    'created_at': notification.created_at.isoformat()
                })
            
            return Response({
                'success': True,
                'data': notifications_data
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get notifications: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_subjects(request):
    """Get list of available subjects"""
    subjects = [
        {'year_level': 'Year 11/12', 'curriculum': 'VCE', 'subject': 'Mathematics'},
        {'year_level': 'Year 11/12', 'curriculum': 'VCE', 'subject': 'English'},
        {'year_level': 'Year 11/12', 'curriculum': 'VCE', 'subject': 'Physics'},
        {'year_level': 'Year 11/12', 'curriculum': 'VCE', 'subject': 'Chemistry'},
        {'year_level': 'Year 11/12', 'curriculum': 'VCE', 'subject': 'Biology'},
        {'year_level': 'Year 11/12', 'curriculum': 'HSC', 'subject': 'Mathematics'},
        {'year_level': 'Year 11/12', 'curriculum': 'HSC', 'subject': 'English'},
        {'year_level': 'Year 11/12', 'curriculum': 'HSC', 'subject': 'Physics'},
        {'year_level': 'Year 11/12', 'curriculum': 'HSC', 'subject': 'Chemistry'},
        {'year_level': 'Year 11/12', 'curriculum': 'HSC', 'subject': 'Biology'},
    ]
    return Response(subjects)

class TutorCompletionStatusView(APIView):
    """Handle tutor profile completion status"""
    permission_classes = [AllowAny]  # For now, allow any access

    def get(self, request):
        """Get tutor profile completion status"""
        try:
            username = request.query_params.get('username')
            if username:
                try:
                    user = User.objects.get(username=username)
                    profile = TutorProfile.objects.get(user=user)
                except (User.DoesNotExist, TutorProfile.DoesNotExist):
                    return Response({
                        'success': False,
                        'message': 'Profile not found for this user'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                profile = TutorProfile.objects.first()  # Fallback to first profile

            if not profile:
                return Response({
                    'success': False,
                    'message': 'No profile found'
                }, status=status.HTTP_404_NOT_FOUND)

            completion_status = profile.get_completion_status()
            
            return Response({
                'success': True,
                'data': completion_status
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get completion status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
