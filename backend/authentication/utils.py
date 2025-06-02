from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_tutor_application_confirmation(user, tutor_profile, application_data):
    """
    Send confirmation email to tutor applicant
    """
    try:
        # Prepare email context
        context = {
            'first_name': user.first_name,
            'application_id': tutor_profile.id,
            'submission_date': timezone.now().strftime('%B %d, %Y'),
            'email': user.email,
            'university': application_data.get('currentStudy', ''),
            'atar': application_data.get('atar', ''),
        }
        
        # Render email templates
        subject = 'Application Received - Strive Academy Tutor Position'
        text_content = render_to_string('emails/tutor_application_confirmation.txt', context)
        html_content = render_to_string('emails/tutor_application_confirmation.html', context)
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            to=[user.email]
        )
        
        # Attach HTML version
        msg.attach_alternative(html_content, "text/html")
        
        # Send the email
        msg.send()
        
        logger.info(f"Confirmation email sent to {user.email} for application {tutor_profile.id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {user.email}: {str(e)}")
        return False

def send_tutor_approval_email(user, tutor_profile):
    """
    Send approval email to tutor with password setup link
    """
    try:
        # Generate password setup link
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://178.128.109.143:3000')
        password_setup_link = f"{frontend_url}/tutor/setup-password/{tutor_profile.password_setup_token}"
        
        # Prepare email context
        context = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'university': tutor_profile.university,
            'setup_link': password_setup_link,
            'approval_date': timezone.now().strftime('%B %d, %Y'),
        }
        
        # Render email templates
        subject = 'Welcome to Strive Academy - Complete Your Account Setup'
        text_content = render_to_string('emails/tutor_approval_notification.txt', context)
        html_content = render_to_string('emails/tutor_approval_notification.html', context)
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            to=[user.email]
        )
        
        # Attach HTML version
        msg.attach_alternative(html_content, "text/html")
        
        # Send the email
        msg.send()
        
        logger.info(f"Approval email sent to {user.email} for tutor {tutor_profile.id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send approval email to {user.email}: {str(e)}")
        return False

def send_tutor_rejection_email(user, tutor_profile, reason=""):
    """
    Send rejection email to tutor when application is rejected
    """
    try:
        # Prepare email context
        context = {
            'first_name': user.first_name,
            'reason': reason,
            'rejection_date': timezone.now().strftime('%B %d, %Y'),
        }
        
        # Render email templates
        subject = 'Update on Your Strive Academy Application'
        text_content = render_to_string('emails/tutor_rejection_notification.txt', context)
        html_content = render_to_string('emails/tutor_rejection_notification.html', context)
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            to=[user.email]
        )
        
        # Attach HTML version
        msg.attach_alternative(html_content, "text/html")
        
        # Send the email
        msg.send()
        
        logger.info(f"Rejection email sent to {user.email} for tutor {tutor_profile.id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send rejection email to {user.email}: {str(e)}")
        return False 