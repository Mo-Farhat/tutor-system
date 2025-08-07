from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import TutorApplication


def send_tutor_application_confirmation(application):
    """
    Send confirmation email to tutor when they submit an application
    """
    try:
        subject = f"Tutor Application Received - {application.application_id}"
        
        # Create email content
        context = {
            'application': application,
            'full_name': application.full_name,
            'application_id': application.application_id,
            'submitted_date': application.submitted_at.strftime('%B %d, %Y'),
        }
        
        # HTML version of the email
        html_message = render_to_string('tutors/emails/application_confirmation.html', context)
        
        # Plain text version of the email
        text_message = render_to_string('tutors/emails/application_confirmation.txt', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"Failed to send email to {application.email}: {str(e)}")
        return False


def send_tutor_application_status_update(application, new_status):
    """
    Send status update email to tutor when their application status changes
    """
    try:
        status_display = dict(TutorApplication.STATUS_CHOICES)[new_status]
        subject = f"Tutor Application Update - {application.application_id}"
        
        context = {
            'application': application,
            'full_name': application.full_name,
            'application_id': application.application_id,
            'status': new_status,
            'status_display': status_display,
        }
        
        # HTML version of the email
        html_message = render_to_string('tutors/emails/application_status_update.html', context)
        
        # Plain text version of the email
        text_message = render_to_string('tutors/emails/application_status_update.txt', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"Failed to send status update email to {application.email}: {str(e)}")
        return False 