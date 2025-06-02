from django.core.management.base import BaseCommand
from authentication.models import TutorProfile
import uuid


class Command(BaseCommand):
    help = 'Fix password setup tokens for tutors with invalid tokens'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run the command in dry-run mode to see what would be changed',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write(self.style.SUCCESS('Checking for tutors with invalid password setup tokens...'))
        
        # Find all approved tutors who haven't completed password setup
        tutors = TutorProfile.objects.filter(
            is_approved=True,
            password_setup_completed=False
        )
        
        self.stdout.write(f'Found {tutors.count()} approved tutors who haven\'t completed password setup')
        
        fixed_count = 0
        
        for tutor in tutors:
            # Check if the token is a valid UUID
            try:
                # Try to create a UUID from the current token
                uuid.UUID(str(tutor.password_setup_token))
                self.stdout.write(f'✅ {tutor.user.email}: Token is valid UUID')
            except (ValueError, TypeError):
                # Token is invalid, needs to be regenerated
                old_token = tutor.password_setup_token
                
                if dry_run:
                    self.stdout.write(
                        self.style.WARNING(f'🔧 {tutor.user.email}: Would regenerate token {old_token}')
                    )
                else:
                    # Regenerate the token
                    new_token = tutor.regenerate_password_token()
                    self.stdout.write(
                        self.style.SUCCESS(f'🔧 {tutor.user.email}: Regenerated token {old_token} -> {new_token}')
                    )
                
                fixed_count += 1
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'\nDry run complete. Would fix {fixed_count} tutors.')
            )
            self.stdout.write('Run without --dry-run to apply changes.')
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\nFixed {fixed_count} tutors with invalid tokens.')
            )
            
            if fixed_count > 0:
                self.stdout.write(
                    self.style.WARNING(
                        'Note: Affected tutors will need new password setup emails sent to them.'
                    )
                ) 