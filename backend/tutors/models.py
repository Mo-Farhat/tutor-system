import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

def tutor_document_upload_path(instance, filename):
    """Generate file path for tutor documents"""
    # Handle both TutorApplication and TutorDocument instances
    if hasattr(instance, 'application_id'):
        # For TutorApplication instances
        return f'tutor_documents/{instance.application_id}/{filename}'
    else:
        # For TutorDocument instances
        return f'tutor_documents/{instance.tutor.username}/{filename}'

def generate_application_id():
    """Generate a unique application ID"""
    return f"APP-{uuid.uuid4().hex[:8].upper()}"

def tutor_profile_upload_path(instance, filename):
    """Generate file path for tutor profile images"""
    return f'tutor_profiles/{instance.user.username}/{filename}'

class TutorApplication(models.Model):
    """Model for tutor applications"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    application_id = models.CharField(max_length=20, unique=True, default=generate_application_id, editable=False)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    current_study = models.CharField(max_length=255, blank=True)
    year12_state = models.CharField(max_length=100, blank=True)
    year12_completion_year = models.IntegerField(blank=True, null=True)
    current_state = models.CharField(max_length=100, blank=True)
    atar = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    can_commit_3_hours = models.BooleanField(default=False)
    can_commit_1_year = models.BooleanField(default=False)
    can_tutor_most_weeks = models.BooleanField(default=False)
    can_tutor_groups = models.BooleanField(default=False)
    subjects_to_tutor = models.TextField(blank=True)
    has_working_with_children_check = models.BooleanField(default=False)
    motivation = models.TextField()
    video_submission = models.FileField(upload_to=tutor_document_upload_path, blank=True, null=True)
    resume = models.FileField(upload_to=tutor_document_upload_path, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='reviewed_applications')
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.application_id} - {self.full_name}"

class TutorProfile(models.Model):
    """Model for tutor profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tutor_profile')
    bio = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    profile_picture = models.ImageField(upload_to=tutor_profile_upload_path, blank=True, null=True)
    video_intro = models.FileField(upload_to=tutor_profile_upload_path, blank=True, null=True)
    university = models.CharField(max_length=255, blank=True)
    current_studies = models.JSONField(default=list, blank=True)  # Store as array
    locations = models.JSONField(default=list, blank=True)  # Store as array
    subjects = models.JSONField(default=list, blank=True)  # Store as array
    availability = models.JSONField(default=dict, blank=True)  # Store availability schedule
    is_profile_complete = models.BooleanField(default=False)
    
    # Additional fields for frontend compatibility
    atar = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    schools_attended = models.JSONField(default=list, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    subjects_selected = models.JSONField(default=list, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    account_live = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"

    def is_fully_complete(self):
        """Check if the tutor profile is fully complete with all required information and documents"""
        # Check if basic profile information is complete
        profile_complete = (
            self.bio and 
            self.hourly_rate and 
            self.university and 
            self.phone_number and
            self.current_studies and len(self.current_studies) > 0 and
            self.preferred_locations and len(self.preferred_locations) > 0 and
            self.subjects_selected and len(self.subjects_selected) > 0
        )
        
        # Check if required documents are uploaded
        required_documents = ['contract', 'wwcc']
        uploaded_documents = self.user.tutor_documents.filter(
            document_type__in=required_documents
        ).values_list('document_type', flat=True)
        
        documents_complete = all(doc in uploaded_documents for doc in required_documents)
        
        return profile_complete and documents_complete

    def get_completion_status(self):
        """Get detailed completion status for the profile"""
        status = {
            'profile_complete': False,
            'documents_complete': False,
            'fully_complete': False,
            'missing_items': []
        }
        
        # Check profile completion
        missing_profile = []
        if not self.bio:
            missing_profile.append('Bio')
        if not self.hourly_rate:
            missing_profile.append('Hourly Rate')
        if not self.university:
            missing_profile.append('University/Institution')
        if not self.phone_number:
            missing_profile.append('Phone Number')
        if not self.current_studies or len(self.current_studies) == 0:
            missing_profile.append('Current Studies')
        if not self.preferred_locations or len(self.preferred_locations) == 0:
            missing_profile.append('Preferred Locations')
        if not self.subjects_selected or len(self.subjects_selected) == 0:
            missing_profile.append('Subjects')
        
        status['profile_complete'] = len(missing_profile) == 0
        
        # Check documents completion
        required_documents = ['contract', 'wwcc']
        uploaded_documents = self.user.tutor_documents.filter(
            document_type__in=required_documents
        ).values_list('document_type', flat=True)
        
        missing_documents = [doc for doc in required_documents if doc not in uploaded_documents]
        status['documents_complete'] = len(missing_documents) == 0
        
        # Overall completion
        status['fully_complete'] = status['profile_complete'] and status['documents_complete']
        
        # Missing items
        status['missing_items'] = missing_profile + missing_documents
        
        return status

class TutorSubject(models.Model):
    """Model for tutor subjects"""
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tutor_subjects')
    year_level = models.CharField(max_length=50)
    curriculum_or_state = models.CharField(max_length=50)
    subject = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['tutor', 'year_level', 'curriculum_or_state', 'subject']
    
    def __str__(self):
        return f"{self.tutor.username} - {self.subject} ({self.year_level})"

class TutorDocument(models.Model):
    """Model for tutor documents"""
    DOCUMENT_TYPES = [
        ('contract', 'Tutor Contract'),
        ('wwcc', 'Working with Children Check'),
        ('other', 'Other'),
    ]
    
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tutor_documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to=tutor_document_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.tutor.username} - {self.get_document_type_display()}"

class TutorPaymentDetails(models.Model):
    """Model for tutor payment information"""
    tutor = models.OneToOneField(User, on_delete=models.CASCADE, related_name='payment_details')
    bank_name = models.CharField(max_length=100, blank=True)
    account_name = models.CharField(max_length=255, blank=True)
    bsb = models.CharField(max_length=10, blank=True)
    account_number = models.CharField(max_length=20, blank=True)
    tax_file_number = models.CharField(max_length=20, blank=True)
    abn = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment details for {self.tutor.username}"

class TutorAvailability(models.Model):
    """Model for tutor availability"""
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), 
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['tutor', 'day_of_week', 'start_time', 'end_time']
    
    def __str__(self):
        return f"{self.tutor.username} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"

class TutorEarnings(models.Model):
    """Model for tutor earnings tracking"""
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earnings')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    session_count = models.IntegerField(default=1)
    period_start = models.DateField()
    period_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.tutor.username} - ${self.amount} ({self.period_start} to {self.period_end})"

class TutorNotification(models.Model):
    """Model for tutor notifications"""
    NOTIFICATION_TYPES = [
        ('booking', 'New Booking'),
        ('payment', 'Payment Received'),
        ('system', 'System Update'),
        ('profile', 'Profile Update'),
    ]
    
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.tutor.username} - {self.title}"

class TutorTraining(models.Model):
    """Model for tutor training modules"""
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='training_modules')
    module_name = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], blank=True, null=True)
    
    def __str__(self):
        return f"{self.tutor.username} - {self.module_name}"

class TutorPasswordSetupToken(models.Model):
    """Model to store password setup tokens for approved tutors"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='password_setup_token')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Token for {self.user.username} - {'Used' if self.used else 'Active'}"
    
    def is_valid(self):
        """Check if token is valid and not expired"""
        from django.utils import timezone
        return not self.used and self.expires_at > timezone.now()
