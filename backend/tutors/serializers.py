from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    TutorApplication, TutorProfile, TutorSubject, TutorDocument, 
    TutorPaymentDetails, TutorAvailability, TutorEarnings, 
    TutorNotification, TutorTraining, TutorPasswordSetupToken
)


class TutorApplicationSerializer(serializers.ModelSerializer):
    """Serializer for tutor application submission"""
    
    class Meta:
        model = TutorApplication
        fields = [
            'full_name', 'phone', 'email', 'current_study', 'year12_state',
            'year12_completion_year', 'current_state', 'atar', 'can_commit_3_hours',
            'can_commit_1_year', 'can_tutor_most_weeks', 'can_tutor_groups',
            'subjects_to_tutor', 'has_working_with_children_check', 'motivation',
            'video_submission', 'resume'
        ]


class TutorApplicationResponseSerializer(serializers.ModelSerializer):
    """Serializer for tutor application responses"""
    
    class Meta:
        model = TutorApplication
        fields = [
            'application_id', 'full_name', 'email', 'phone', 'status',
            'submitted_at', 'reviewed_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class TutorProfileSerializer(serializers.ModelSerializer):
    """Serializer for tutor profile"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TutorProfile
        fields = [
            'id', 'user', 'bio', 'hourly_rate', 'profile_picture', 'video_intro',
            'university', 'current_studies', 'locations', 'subjects', 'availability',
            'is_profile_complete', 'created_at', 'updated_at'
        ]


class TutorProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tutor profile"""
    
    class Meta:
        model = TutorProfile
        fields = [
            'bio', 'hourly_rate', 'profile_picture', 'video_intro',
            'university', 'current_studies', 'locations', 'subjects', 'availability'
        ]


class TutorSubjectSerializer(serializers.ModelSerializer):
    """Serializer for tutor subjects"""
    
    class Meta:
        model = TutorSubject
        fields = ['id', 'year_level', 'curriculum_or_state', 'subject', 'created_at']


class TutorDocumentSerializer(serializers.ModelSerializer):
    """Serializer for tutor documents"""
    
    class Meta:
        model = TutorDocument
        fields = [
            'id', 'document_type', 'file', 'uploaded_at', 'is_verified'
        ]


class TutorDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading tutor documents"""
    
    class Meta:
        model = TutorDocument
        fields = ['document_type', 'file']


class TutorPaymentDetailsSerializer(serializers.ModelSerializer):
    """Serializer for tutor payment details"""
    
    class Meta:
        model = TutorPaymentDetails
        fields = [
            'id', 'bank_name', 'account_name', 'bsb', 'account_number',
            'tax_file_number', 'abn', 'created_at', 'updated_at'
        ]


class TutorPaymentDetailsUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tutor payment details"""
    
    class Meta:
        model = TutorPaymentDetails
        fields = [
            'bank_name', 'account_name', 'bsb', 'account_number',
            'tax_file_number', 'abn'
        ]


class TutorAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for tutor availability"""
    
    class Meta:
        model = TutorAvailability
        fields = [
            'id', 'day_of_week', 'start_time', 'end_time', 'is_available'
        ]


class TutorEarningsSerializer(serializers.ModelSerializer):
    """Serializer for tutor earnings"""
    
    class Meta:
        model = TutorEarnings
        fields = [
            'id', 'amount', 'session_count', 'period_start', 'period_end', 'created_at'
        ]


class TutorNotificationSerializer(serializers.ModelSerializer):
    """Serializer for tutor notifications"""
    
    class Meta:
        model = TutorNotification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read', 'created_at'
        ]


class TutorTrainingSerializer(serializers.ModelSerializer):
    """Serializer for tutor training modules"""
    
    class Meta:
        model = TutorTraining
        fields = [
            'id', 'module_name', 'is_completed', 'completed_at', 'score'
        ]


class TutorPasswordSetupTokenSerializer(serializers.ModelSerializer):
    """Serializer for password setup tokens"""
    
    class Meta:
        model = TutorPasswordSetupToken
        fields = ['token', 'created_at', 'used', 'expires_at']


class SubjectDataSerializer(serializers.Serializer):
    """Serializer for subject selection data"""
    year_levels = serializers.ListField(child=serializers.CharField())
    curricula = serializers.ListField(child=serializers.CharField())
    states = serializers.ListField(child=serializers.CharField())
    year_11_12_subjects = serializers.DictField()
    year_1_10_subjects = serializers.DictField()


class LoginResponseSerializer(serializers.Serializer):
    """Serializer for login response"""
    success = serializers.BooleanField()
    message = serializers.CharField()
    user = UserSerializer()


class ProfileResponseSerializer(serializers.Serializer):
    """Serializer for profile response"""
    success = serializers.BooleanField()
    data = TutorProfileSerializer() 