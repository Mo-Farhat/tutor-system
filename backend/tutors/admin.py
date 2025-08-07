from django.contrib import admin
from django.utils.html import format_html
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.utils import timezone
from .models import (
    TutorApplication, TutorProfile, TutorSubject, TutorDocument, 
    TutorPaymentDetails, TutorAvailability, TutorEarnings, 
    TutorNotification, TutorTraining, TutorPasswordSetupToken
)
from .utils import send_tutor_application_confirmation, send_tutor_application_status_update
from django.conf import settings


@admin.register(TutorApplication)
class TutorApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'application_id', 'full_name', 'email', 'phone', 
        'atar', 'status', 'submitted_at'
    ]
    list_filter = [
        'status', 'submitted_at', 'can_commit_3_hours',
        'can_commit_1_year', 'has_working_with_children_check'
    ]
    search_fields = ['full_name', 'email', 'phone', 'application_id']
    readonly_fields = ['application_id', 'submitted_at']
    fieldsets = (
        ('Application Information', {
            'fields': ('application_id', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by', 'notes')
        }),
        ('Personal Information', {
            'fields': ('full_name', 'phone', 'email')
        }),
        ('Education Background', {
            'fields': ('current_study', 'year12_state', 'year12_completion_year', 'current_state', 'atar')
        }),
        ('Availability & Commitment', {
            'fields': ('can_commit_3_hours', 'can_commit_1_year', 'can_tutor_most_weeks', 'can_tutor_groups')
        }),
        ('Tutoring Information', {
            'fields': ('subjects_to_tutor', 'has_working_with_children_check', 'motivation')
        }),
        ('Files', {
            'fields': ('video_submission', 'resume')
        }),
    )
    actions = ['approve_applications', 'reject_applications']

    def approve_applications(self, request, queryset):
        approved_count = 0
        for application in queryset:
            if application.status != 'approved':
                # Create user account
                try:
                    # Generate username from email
                    username = application.email.split('@')[0]
                    base_username = username
                    counter = 1
                    
                    # Ensure unique username
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1
                    
                    # Create user
                    user = User.objects.create_user(
                        username=username,
                        email=application.email,
                        first_name=application.full_name.split()[0] if application.full_name else '',
                        last_name=' '.join(application.full_name.split()[1:]) if len(application.full_name.split()) > 1 else '',
                        password=None  # Will be set by tutor during password setup
                    )
                    
                    # Create tutor profile with application data
                    self.create_tutor_profile(user, application)
                    
                    # Update application status
                    application.status = 'approved'
                    application.reviewed_at = timezone.now()
                    application.reviewed_by = request.user
                    application.save()
                    
                    # Send approval email with login link
                    self.send_approval_email(application, user)
                    
                    approved_count += 1
                    
                except Exception as e:
                    self.message_user(request, f'Failed to approve {application.full_name}: {str(e)}', level='ERROR')
        
        self.message_user(request, f'{approved_count} applications were approved and tutor accounts created.')
    approve_applications.short_description = "Approve selected applications and create tutor accounts"

    def create_tutor_profile(self, user, application):
        """Create a tutor profile with data from the application"""
        try:
            subjects_list = []
            if application.subjects_to_tutor:
                subjects_text = application.subjects_to_tutor.strip()
                if subjects_text:
                    subjects = [s.strip() for s in subjects_text.replace(',', ';').split(';') if s.strip()]
                    for subject in subjects:
                        if 'year' in subject.lower() or 'vce' in subject.lower() or 'hsc' in subject.lower():
                            subjects_list.append({
                                'year_level': 'Year 11/12',
                                'curriculum': 'VCE' if 'vce' in subject.lower() else 'HSC',
                                'subject': subject.strip()
                            })
                        else:
                            subjects_list.append({
                                'year_level': 'Year 11/12',
                                'curriculum': 'VCE',
                                'subject': subject.strip()
                            })

            profile = TutorProfile.objects.create(
                user=user,
                bio=f"Passionate tutor with experience in {application.subjects_to_tutor or 'various subjects'}.",
                hourly_rate=45.00,
                university=application.current_study or 'Not specified',
                current_studies=[application.current_study] if application.current_study else [],
                locations=[application.current_state] if application.current_state else [],
                subjects=subjects_list,
                availability={
                    'monday': [{'start': '09:00', 'end': '17:00'}] if application.can_tutor_most_weeks else [],
                    'tuesday': [{'start': '09:00', 'end': '17:00'}] if application.can_tutor_most_weeks else [],
                    'wednesday': [{'start': '09:00', 'end': '17:00'}] if application.can_tutor_most_weeks else [],
                    'thursday': [{'start': '09:00', 'end': '17:00'}] if application.can_tutor_most_weeks else [],
                    'friday': [{'start': '09:00', 'end': '17:00'}] if application.can_tutor_most_weeks else [],
                    'saturday': [],
                    'sunday': []
                },
                # New fields for frontend compatibility
                atar=application.atar or 96.45,  # Use application ATAR or default
                rating=4.50,  # Default rating
                schools_attended=[],  # Empty for now
                preferred_locations=[application.current_state] if application.current_state else [],
                subjects_selected=subjects_list,
                phone_number=application.phone,
                approved_at=timezone.now(),
                account_live=False,
                is_profile_complete=False
            )

            for subject_data in subjects_list:
                TutorSubject.objects.create(
                    tutor=user,
                    year_level=subject_data['year_level'],
                    curriculum_or_state=subject_data['curriculum'],
                    subject=subject_data['subject']
                )

            TutorPaymentDetails.objects.create(
                tutor=user,
                bank_name='', account_name=application.full_name, bsb='',
                account_number='', tax_file_number='', abn=''
            )

            TutorNotification.objects.create(
                tutor=user, notification_type='system', title='Welcome to Strive Academy!',
                message='Your application has been approved. Please complete your profile setup.',
                is_read=False
            )
            return profile
        except Exception as e:
            print(f"Failed to create tutor profile for {user.username}: {str(e)}")
            raise e

    def reject_applications(self, request, queryset):
        updated = queryset.update(status='rejected')
        # Send status update emails
        for application in queryset:
            try:
                send_tutor_application_status_update(application, 'rejected')
            except Exception as e:
                print(f"Failed to send status update email to {application.email}: {str(e)}")
        self.message_user(request, f'{updated} applications were rejected.')
    reject_applications.short_description = "Reject selected applications"

    def send_approval_email(self, application, user):
        """Send approval email with login link"""
        try:
            from django.core.mail import send_mail
            from django.template.loader import render_to_string
            from django.utils import timezone
            from datetime import timedelta
            import uuid
            
            # Generate password setup token
            token = str(uuid.uuid4())
            
            # Create token record in database
            token_record = TutorPasswordSetupToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=24)  # Token expires in 24 hours
            )
            
            # Create login link
            login_url = f"http://localhost:3000/tutor/setup-password/{token}"
            
            subject = f"🎉 Application Approved - Welcome to Strive Academy!"
            
            # Email context
            context = {
                'application': application,
                'full_name': application.full_name,
                'application_id': application.application_id,
                'username': user.username,
                'login_url': login_url,
                'token': token,
            }
            
            # HTML version
            html_message = render_to_string('tutors/emails/application_approved.html', context)
            
            # Plain text version
            text_message = render_to_string('tutors/emails/application_approved.txt', context)
            
            # Send email
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            print(f"Failed to send approval email to {application.email}: {str(e)}")
            return False


@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'university', 'is_profile_complete', 'created_at']
    list_filter = ['is_profile_complete', 'created_at']
    search_fields = ['user__username', 'user__email', 'university']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TutorSubject)
class TutorSubjectAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'year_level', 'curriculum_or_state', 'subject']
    list_filter = ['year_level', 'curriculum_or_state']
    search_fields = ['tutor__username', 'subject']


@admin.register(TutorDocument)
class TutorDocumentAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'document_type', 'is_verified', 'uploaded_at']
    list_filter = ['document_type', 'is_verified', 'uploaded_at']
    search_fields = ['tutor__username']


@admin.register(TutorPaymentDetails)
class TutorPaymentDetailsAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'bank_name', 'account_name', 'created_at']
    search_fields = ['tutor__username', 'bank_name', 'account_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TutorAvailability)
class TutorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'day_of_week', 'start_time', 'end_time', 'is_available']
    list_filter = ['day_of_week', 'is_available']
    search_fields = ['tutor__username']


@admin.register(TutorEarnings)
class TutorEarningsAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'amount', 'session_count', 'period_start', 'period_end']
    list_filter = ['period_start', 'period_end']
    search_fields = ['tutor__username']
    readonly_fields = ['created_at']


@admin.register(TutorNotification)
class TutorNotificationAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['tutor__username', 'title', 'message']
    readonly_fields = ['created_at']


@admin.register(TutorTraining)
class TutorTrainingAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'module_name', 'is_completed', 'score', 'completed_at']
    list_filter = ['module_name', 'is_completed']
    search_fields = ['tutor__username', 'module_name']
    readonly_fields = ['completed_at']


@admin.register(TutorPasswordSetupToken)
class TutorPasswordSetupTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'used', 'expires_at', 'created_at']
    list_filter = ['used', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'expires_at'] 