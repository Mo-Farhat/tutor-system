from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('tutor', 'Tutor'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    school = models.CharField(max_length=100, blank=True, null=True)
    grade_level = models.CharField(max_length=20, blank=True, null=True)
    subjects_of_interest = models.JSONField(default=list, blank=True)
    learning_goals = models.TextField(blank=True, null=True)
    parent_email = models.EmailField(blank=True, null=True)
    parent_phone = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return f"Student: {self.user.username}"

class TutorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tutor_profile')
    bio = models.TextField(blank=True, default='')
    qualifications = models.JSONField(default=list, blank=True)  # List of qualifications
    subjects_taught = models.JSONField(default=list, blank=True)  # List of subjects
    experience_years = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    availability = models.JSONField(default=dict, blank=True)  # Schedule availability
    is_approved = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.IntegerField(default=0)
    profile_picture = models.ImageField(upload_to='tutor_profiles/', null=True, blank=True)
    
    # Application-specific fields
    university = models.CharField(max_length=200, blank=True, default='')
    degree = models.CharField(max_length=200, blank=True, default='')
    graduation_year = models.IntegerField(null=True, blank=True)
    atar = models.FloatField(null=True, blank=True)
    
    # Document uploads
    resume = models.FileField(upload_to='tutor_documents/cv/', null=True, blank=True)
    video_submission = models.FileField(upload_to='tutor_documents/videos/', null=True, blank=True)
    
    # Additional application data
    motivation = models.TextField(blank=True, default='')
    preferred_locations = models.JSONField(default=list, blank=True)
    
    # Password setup for approved tutors
    password_setup_token = models.UUIDField(default=uuid.uuid4, unique=True)
    password_setup_completed = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - Tutor"
    
    def regenerate_password_token(self):
        """Generate a new password setup token"""
        self.password_setup_token = uuid.uuid4()
        self.save()
        return self.password_setup_token

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=50, blank=True, null=True)
    permissions_level = models.CharField(max_length=20, default='standard')
    
    def __str__(self):
        return f"Admin: {self.user.username}"
