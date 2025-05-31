from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, StudentProfile, TutorProfile, AdminProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role', 'phone_number', 'date_of_birth')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create role-specific profile
        if user.role == 'student':
            StudentProfile.objects.create(user=user)
        elif user.role == 'tutor':
            TutorProfile.objects.create(user=user)
        elif user.role == 'admin':
            AdminProfile.objects.create(user=user)
        
        return user

class TutorApplicationSerializer(serializers.Serializer):
    # Personal Information
    fullName = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    
    # Education Background
    currentStudy = serializers.CharField(max_length=255)
    year12State = serializers.CharField(max_length=50)
    year12CompletionYear = serializers.CharField(max_length=4)
    currentState = serializers.CharField(max_length=50)
    atar = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Availability & Commitment
    canCommit3Hours = serializers.CharField(max_length=3)
    canCommit1Year = serializers.CharField(max_length=3)
    canTutorMostWeeks = serializers.CharField(max_length=3)
    canTutorGroups = serializers.CharField(max_length=3)
    
    # Tutoring Subjects & Qualifications
    subjectsToTutor = serializers.CharField()
    hasWorkingWithChildrenCheck = serializers.CharField(max_length=3)
    
    # Motivation
    motivation = serializers.CharField()
    
    # Files (optional for now since we're handling basic submission)
    videoSubmission = serializers.FileField(required=False)
    resume = serializers.FileField(required=False)
    
    def validate_atar(self, value):
        if value < 97:
            raise serializers.ValidationError("ATAR must be 97 or above")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value
    
    def create_ghost_account(self, validated_data):
        """Create a disabled tutor account from application data"""
        # Split full name
        full_name = validated_data['fullName']
        name_parts = full_name.strip().split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Generate username from email
        email = validated_data['email']
        username = email.split('@')[0]
        
        # Ensure unique username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        # Create disabled user account
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=validated_data['phone'],
            role='tutor',
            is_active=False,  # Ghost account - disabled until approved
            is_verified=False
        )
        
        # Don't set a password initially - will be set when approved
        
        # Process subjects list
        subjects_list = []
        if validated_data['subjectsToTutor']:
            # Split by common delimiters and clean up
            subjects_raw = validated_data['subjectsToTutor'].replace(',', '\n').replace(';', '\n')
            subjects_list = [s.strip() for s in subjects_raw.split('\n') if s.strip()]
        
        # Create tutor profile with application data
        tutor_profile = TutorProfile.objects.create(
            user=user,
            bio=validated_data['motivation'],
            university=validated_data['currentStudy'],
            subjects_taught=subjects_list,
            years_experience=0,  # New applicant
            hourly_rate=0,  # To be set later
            availability='flexible',  # Default, can be updated later
            is_approved=False,  # Pending approval
        )
        
        # Save uploaded files if they exist
        if validated_data.get('resume'):
            tutor_profile.cv_document = validated_data['resume']
        
        if validated_data.get('videoSubmission'):
            # Store video in the dedicated video_submission field
            tutor_profile.video_submission = validated_data['videoSubmission']
        
        # Store additional application data in a way that doesn't conflict with model
        # We could create a separate ApplicationData model later, but for now 
        # we'll store key info in the bio field or create custom fields
        additional_info = {
            'atar': float(validated_data['atar']),
            'year12_state': validated_data['year12State'],
            'completion_year': validated_data['year12CompletionYear'],
            'current_state': validated_data['currentState'],
            'can_commit_3_hours': validated_data['canCommit3Hours'] == 'yes',
            'can_commit_1_year': validated_data['canCommit1Year'] == 'yes',
            'can_tutor_most_weeks': validated_data['canTutorMostWeeks'] == 'yes',
            'can_tutor_groups': validated_data['canTutorGroups'] == 'yes',
            'has_working_with_children_check': validated_data['hasWorkingWithChildrenCheck'] == 'yes',
        }
        
        # Update bio to include application details
        tutor_profile.bio = f"MOTIVATION: {validated_data['motivation']}\n\nAPPLICATION DATA: ATAR {validated_data['atar']}, {validated_data['year12State']} {validated_data['year12CompletionYear']}, Currently in {validated_data['currentState']}"
        tutor_profile.save()
        
        return user, tutor_profile

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False)
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')
        
        if not password:
            raise serializers.ValidationError('Password is required')
        
        if not email and not phone_number:
            raise serializers.ValidationError('Must provide either email or phone number')
        
        if email and phone_number:
            raise serializers.ValidationError('Provide either email or phone number, not both')
        
        user = None
        
        # Try to find user by email or phone number
        try:
            if email:
                user = User.objects.get(email=email)
            elif phone_number:
                user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials')
        
        # Check password
        if user and not user.check_password(password):
            raise serializers.ValidationError('Invalid credentials')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')
        
        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'phone_number', 'date_of_birth', 'profile_picture', 'is_verified', 
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_verified')

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = '__all__'

class TutorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TutorProfile
        fields = '__all__'
        read_only_fields = ('is_approved', 'rating', 'total_sessions')

class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminProfile
        fields = '__all__'

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs

class TutorApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorProfile
        fields = ('is_approved',)

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number', 'date_of_birth', 'profile_picture') 