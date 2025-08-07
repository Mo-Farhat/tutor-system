#!/usr/bin/env python3
"""
Test script to verify approval email functionality
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tutors.models import TutorApplication, TutorPasswordSetupToken
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import uuid

def test_approval_process():
    """Test the approval process and email sending"""
    
    print("🧪 Testing Approval Process")
    print("=" * 50)
    
    # Get pending applications
    pending_applications = TutorApplication.objects.filter(status='pending')
    
    if not pending_applications.exists():
        print("❌ No pending applications found. Please submit a new application first.")
        return False
    
    # Get the first pending application
    application = pending_applications.first()
    
    print(f"📧 Testing with application: {application.application_id}")
    print(f"   Email: {application.email}")
    print(f"   Name: {application.full_name}")
    print(f"   Current Status: {application.status}")
    
    # Simulate the approval process
    print("\n1. Creating user account...") 
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
        print(f"✅ User account created: {username}")
        
        # Update application status
        application.status = 'approved'
        application.reviewed_at = timezone.now()
        application.save()
        print(f"✅ Application status updated to: {application.status}")
        
        # Generate password setup token
        token = str(uuid.uuid4())
        token_record = TutorPasswordSetupToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        print(f"✅ Password setup token created: {token[:8]}...")
        
        # Test sending approval email
        print("\n2. Testing approval email...")
        from tutors.admin import TutorApplicationAdmin
        admin_instance = TutorApplicationAdmin(TutorApplication, None)
        
        result = admin_instance.send_approval_email(application, user)
        if result:
            print("✅ Approval email sent successfully!")
            print(f"   Login URL: http://localhost:3000/tutor-setup-password?token={token}&email={application.email}")
        else:
            print("❌ Failed to send approval email")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during approval process: {str(e)}")
        return False

def show_approval_instructions():
    """Show instructions for proper approval process"""
    
    print("\n" + "=" * 50)
    print("📋 HOW TO PROPERLY APPROVE APPLICATIONS:")
    print("=" * 50)
    
    print("1. Go to Django Admin: http://localhost:8000/admin/")
    print("2. Login with: admin / admin123")
    print("3. Click on 'Tutor applications'")
    print("4. Select the applications you want to approve")
    print("5. In the 'Action' dropdown, select 'Approve selected applications and create tutor accounts'")
    print("6. Click 'Go'")
    print("7. This will automatically:")
    print("   - Create a user account")
    print("   - Generate a password setup token")
    print("   - Send approval email with login link")
    print("   - Update application status")
    
    print("\n⚠️  IMPORTANT: Don't manually change the status in the admin panel!")
    print("   Use the bulk action to trigger the email and account creation process.")

if __name__ == "__main__":
    test_approval_process()
    show_approval_instructions() 