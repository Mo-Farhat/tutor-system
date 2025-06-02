from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from authentication.utils import send_tutor_application_confirmation
from authentication.models import User, TutorProfile

class Command(BaseCommand):
    help = 'Test email functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test email to',
        )
        parser.add_argument(
            '--type',
            type=str,
            default='simple',
            choices=['simple', 'tutor_confirmation'],
            help='Type of email to send (simple or tutor_confirmation)',
        )

    def handle(self, *args, **options):
        email = options['email']
        email_type = options['type']
        
        if not email:
            self.stdout.write(
                self.style.ERROR('Please provide an email address using --email')
            )
            return

        try:
            if email_type == 'simple':
                self.send_simple_test_email(email)
            elif email_type == 'tutor_confirmation':
                self.send_tutor_confirmation_test(email)
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Email sending failed: {str(e)}')
            )

    def send_simple_test_email(self, email):
        """Send a simple test email"""
        subject = 'Test Email from Strive Academy'
        message = '''
        Hello!
        
        This is a test email from the Strive Academy application.
        
        If you received this email, the email configuration is working correctly.
        
        Best regards,
        Strive Academy Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Simple test email sent successfully to {email}')
        )

    def send_tutor_confirmation_test(self, email):
        """Send a test tutor confirmation email"""
        # Create mock data for testing
        mock_user_data = {
            'first_name': 'Test',
            'email': email
        }
        
        mock_application_data = {
            'currentStudy': 'Computer Science',
            'atar': '98.5'
        }
        
        # Create a mock user object
        class MockUser:
            def __init__(self, data):
                self.first_name = data['first_name']
                self.email = data['email']
        
        # Create a mock tutor profile
        class MockTutorProfile:
            def __init__(self):
                self.id = 'TEST-123'
        
        mock_user = MockUser(mock_user_data)
        mock_profile = MockTutorProfile()
        
        # Send the email
        success = send_tutor_application_confirmation(
            mock_user, 
            mock_profile, 
            mock_application_data
        )
        
        if success:
            self.stdout.write(
                self.style.SUCCESS(f'Tutor confirmation test email sent successfully to {email}')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'Failed to send tutor confirmation email to {email}')
            ) 