from django.contrib.auth.models import AbstractUser
from django.db import models

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
    QUALIFICATION_CHOICES = [
        ('undergraduate', 'Undergraduate'),
        ('graduate', 'Graduate'),
        ('postgraduate', 'Postgraduate'),
        ('phd', 'PhD'),
        ('professional', 'Professional Certification'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('part_time', 'Part Time'),
        ('full_time', 'Full Time'),
        ('weekends', 'Weekends Only'),
        ('flexible', 'Flexible'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tutor_profile')
    bio = models.TextField(blank=True, null=True)
    qualifications = models.CharField(max_length=20, choices=QUALIFICATION_CHOICES)
    subjects_taught = models.JSONField(default=list)
    years_experience = models.PositiveIntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    availability = models.CharField(max_length=15, choices=AVAILABILITY_CHOICES)
    university = models.CharField(max_length=100, blank=True, null=True)
    degree = models.CharField(max_length=100, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_sessions = models.PositiveIntegerField(default=0)
    
    # Documents for verification
    cv_document = models.FileField(upload_to='tutor_documents/cv/', blank=True, null=True)
    qualification_documents = models.FileField(upload_to='tutor_documents/qualifications/', blank=True, null=True)
    id_document = models.FileField(upload_to='tutor_documents/id/', blank=True, null=True)
    
    # Application-specific files
    video_submission = models.FileField(upload_to='tutor_documents/videos/', blank=True, null=True)
    
    def __str__(self):
        return f"Tutor: {self.user.username}"

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=50, blank=True, null=True)
    permissions_level = models.CharField(max_length=20, default='standard')
    
    def __str__(self):
        return f"Admin: {self.user.username}"
