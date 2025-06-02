from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test email sending functionality'

    def add_arguments(self, parser):
        parser.add_argument('--to', type=str, help='Email address to send test email to')

    def handle(self, *args, **options):
        to_email = options.get('to')
        if not to_email:
            self.stdout.write(self.style.ERROR('Please provide an email address using --to'))
            return

        try:
            self.stdout.write(f'Attempting to send test email to {to_email}...')
            self.stdout.write(f'Using EMAIL_HOST: {settings.EMAIL_HOST}')
            self.stdout.write(f'Using EMAIL_PORT: {settings.EMAIL_PORT}')
            self.stdout.write(f'Using EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
            self.stdout.write(f'Using EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
            
            send_mail(
                subject='Test Email from Strive Academy',
                message='This is a test email to verify email sending functionality.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully sent test email to {to_email}'))
            
        except Exception as e:
            logger.error(f'Failed to send test email: {str(e)}')
            self.stdout.write(self.style.ERROR(f'Failed to send email: {str(e)}')) 