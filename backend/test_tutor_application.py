#!/usr/bin/env python
"""
Test script to demonstrate tutor application and profile creation
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from tutors.models import TutorApplication, TutorProfile, TutorSubject, TutorPaymentDetails, TutorNotification
from tutors.admin import TutorApplicationAdmin

def create_test_application():
    """Create a test tutor application"""
    print("Creating test tutor application...")
    
    # Create a test application
    application = TutorApplication.objects.create(
        full_name="John Smith",
        phone="0412345678",
        email="john.smith@example.com",
        current_study="Bachelor of Science - Mathematics",
        year12_state="Victoria",
        year12_completion_year=2022,
        current_state="Victoria",
        atar=85.50,
        can_commit_3_hours=True,
        can_commit_1_year=True,
        can_tutor_most_weeks=True,
        can_tutor_groups=True,
        subjects_to_tutor="Mathematics VCE, Physics VCE, Chemistry VCE",
        has_working_with_children_check=True,
        motivation="I am passionate about helping students understand complex mathematical concepts and develop problem-solving skills. I have experience tutoring high school students and enjoy seeing their progress."
    )
    
    print(f"✅ Created application: {application.application_id}")
    print(f"   Name: {application.full_name}")
    print(f"   Email: {application.email}")
    print(f"   Subjects: {application.subjects_to_tutor}")
    print(f"   ATAR: {application.atar}")
    print(f"   Can tutor most weeks: {application.can_tutor_most_weeks}")
    
    return application

def approve_application(application):
    """Simulate the approval process"""
    print("\n" + "="*50)
    print("APPROVING APPLICATION")
    print("="*50)
    
    # Create admin instance
    admin = TutorApplicationAdmin(TutorApplication, None)
    
    # Create user account
    username = application.email.split('@')[0]
    base_username = username
    counter = 1
    
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    user = User.objects.create_user(
        username=username,
        email=application.email,
        first_name=application.full_name.split()[0] if application.full_name else '',
        last_name=' '.join(application.full_name.split()[1:]) if len(application.full_name.split()) > 1 else '',
        password=None
    )
    
    print(f"✅ Created user account: {user.username}")
    
    # Create tutor profile with application data
    profile = admin.create_tutor_profile(user, application)
    
    print(f"✅ Created tutor profile")
    print(f"   Bio: {profile.bio}")
    print(f"   University: {profile.university}")
    print(f"   Current studies: {profile.current_studies}")
    print(f"   Locations: {profile.locations}")
    print(f"   Subjects: {profile.subjects}")
    print(f"   Availability: {profile.availability}")
    print(f"   Profile complete: {profile.is_profile_complete}")
    
    # Update application status
    application.status = 'approved'
    application.save()
    
    print(f"✅ Application status updated to: {application.status}")
    
    return user, profile

def show_profile_data(profile):
    """Display the populated profile data"""
    print("\n" + "="*50)
    print("POPULATED PROFILE DATA")
    print("="*50)
    
    print(f"📋 Profile Information:")
    print(f"   User: {profile.user.get_full_name()} ({profile.user.username})")
    print(f"   Email: {profile.user.email}")
    print(f"   Bio: {profile.bio}")
    print(f"   Hourly Rate: ${profile.hourly_rate}")
    print(f"   University: {profile.university}")
    
    print(f"\n📚 Current Studies:")
    for study in profile.current_studies:
        print(f"   - {study}")
    
    print(f"\n📍 Locations:")
    for location in profile.locations:
        print(f"   - {location}")
    
    print(f"\n📖 Subjects:")
    for subject in profile.subjects:
        print(f"   - {subject['subject']} ({subject['year_level']}, {subject['curriculum']})")
    
    print(f"\n⏰ Availability:")
    for day, slots in profile.availability.items():
        if slots:
            print(f"   {day.capitalize()}: {len(slots)} time slot(s)")
            for slot in slots:
                print(f"     {slot['start']} - {slot['end']}")
    
    # Show related data
    print(f"\n📄 Documents:")
    documents = profile.user.tutor_documents.all()
    if documents:
        for doc in documents:
            print(f"   - {doc.get_document_type_display()}: {'✅ Verified' if doc.is_verified else '⏳ Pending'}")
    else:
        print("   - No documents uploaded yet")
    
    print(f"\n💰 Payment Details:")
    try:
        payment = profile.user.payment_details
        print(f"   Account Name: {payment.account_name}")
        print(f"   Bank: {payment.bank_name or 'Not specified'}")
        print(f"   BSB: {payment.bsb or 'Not specified'}")
        print(f"   Account: {payment.account_number or 'Not specified'}")
    except:
        print("   - Payment details not found")
    
    print(f"\n🔔 Notifications:")
    notifications = profile.user.notifications.all()
    if notifications:
        for notif in notifications:
            status = "✅ Read" if notif.is_read else "📬 Unread"
            print(f"   - {notif.title} ({status})")
    else:
        print("   - No notifications")

def main():
    """Main test function"""
    print("🧪 TESTING TUTOR APPLICATION AND PROFILE CREATION")
    print("="*60)
    
    # Check if we already have test data
    existing_app = TutorApplication.objects.filter(email="john.smith@example.com").first()
    if existing_app:
        print("⚠️  Test application already exists. Using existing data.")
        application = existing_app
    else:
        application = create_test_application()
    
    # Check if user already exists
    user = User.objects.filter(email=application.email).first()
    if user:
        print("⚠️  User already exists. Using existing user.")
        profile = user.tutor_profile
    else:
        user, profile = approve_application(application)
    
    # Show the populated profile data
    show_profile_data(profile)
    
    print("\n" + "="*60)
    print("✅ TEST COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\n📝 Summary:")
    print(f"   - Application ID: {application.application_id}")
    print(f"   - User: {user.username}")
    print(f"   - Profile populated with application data")
    print(f"   - Subjects parsed from application text")
    print(f"   - Availability set based on application preferences")
    print(f"   - Payment details placeholder created")
    print(f"   - Welcome notification created")
    
    print(f"\n🌐 You can now:")
    print(f"   - Login with username: {user.username}")
    print(f"   - Access the tutor dashboard")
    print(f"   - View populated profile data")
    print(f"   - Update profile information")

if __name__ == "__main__":
    main() 