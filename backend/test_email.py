#!/usr/bin/env python3
"""
Test script to verify email functionality
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tutors.models import TutorApplication
from tutors.utils import send_tutor_application_confirmation, send_tutor_application_status_update

def test_email_functionality():
    """Test the email functionality"""
    
    print("🧪 Testing Email Functionality")
    print("=" * 50)
    
    # Check if we have any applications in the database
    applications = TutorApplication.objects.all()
    
    if not applications.exists():
        print("❌ No applications found in database. Please submit an application first.")
        return False
    
    # Get the first application for testing
    application = applications.first()
    
    print(f"📧 Testing with application: {application.application_id}")
    print(f"   Email: {application.email}")
    print(f"   Name: {application.full_name}")
    
    # Test confirmation email
    print("\n1. Testing confirmation email...")
    try:
        result = send_tutor_application_confirmation(application)
        if result:
            print("✅ Confirmation email sent successfully!")
        else:
            print("❌ Failed to send confirmation email")
    except Exception as e:
        print(f"❌ Error sending confirmation email: {str(e)}")
    
    # Test status update email
    print("\n2. Testing status update email...")
    try:
        result = send_tutor_application_status_update(application, 'approved')
        if result:
            print("✅ Status update email sent successfully!")
        else:
            print("❌ Failed to send status update email")
    except Exception as e:
        print(f"❌ Error sending status update email: {str(e)}")
    
    print("\n" + "=" * 50)
    print("📋 Email Configuration Check:")
    print(f"   EMAIL_HOST: {os.environ.get('EMAIL_HOST', 'Not set')}")
    print(f"   EMAIL_HOST_USER: {os.environ.get('EMAIL_HOST_USER', 'Not set')}")
    print(f"   EMAIL_HOST_PASSWORD: {'Set' if os.environ.get('EMAIL_HOST_PASSWORD') else 'Not set'}")
    
    print("\n⚠️  IMPORTANT: Make sure to update the email settings in settings.py with your Gmail credentials!")
    print("   - Replace 'your-email@gmail.com' with your actual Gmail address")
    print("   - Replace 'your-app-password' with your Gmail app password")
    
    return True

if __name__ == "__main__":
    test_email_functionality() 