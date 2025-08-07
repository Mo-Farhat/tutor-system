# Email Setup Guide for Tutor Application System

## Overview

This guide will help you set up Gmail SMTP to send automatic emails to tutors when they submit applications and when their application status changes.

## Step 1: Gmail App Password Setup

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### 2. Generate App Password
1. In your Google Account settings, go to "Security"
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

## Step 2: Update Django Settings

Edit `backend/backend/settings.py` and update the email configuration:

```python
# Email Configuration for Gmail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-actual-email@gmail.com'  # Replace with your Gmail
EMAIL_HOST_PASSWORD = 'your-16-char-app-password'  # Replace with app password
DEFAULT_FROM_EMAIL = 'your-actual-email@gmail.com'  # Replace with your Gmail
```

### Example:
```python
EMAIL_HOST_USER = 'striveacademy@gmail.com'
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'
DEFAULT_FROM_EMAIL = 'striveacademy@gmail.com'
```

## Step 3: Test Email Functionality

### Option 1: Test with Existing Application
```bash
cd backend
pipenv run python test_email.py
```

### Option 2: Submit New Application via API
```bash
curl -X POST http://localhost:8000/api/auth/tutor/apply/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "1234567890",
    "email": "your-test-email@example.com",
    "subjectsToTutor": "Mathematics",
    "motivation": "I love teaching"
  }'
```

## Step 4: Email Templates

The system includes two types of emails:

### 1. Application Confirmation Email
- **Triggered**: When tutor submits application
- **Template**: `tutors/templates/tutors/emails/application_confirmation.html`
- **Content**: Welcome message, application details, next steps

### 2. Status Update Email
- **Triggered**: When admin changes application status
- **Template**: `tutors/templates/tutors/emails/application_status_update.html`
- **Content**: Status update, next steps based on approval/rejection

## Step 5: Admin Actions

In Django Admin (`http://localhost:8000/admin/`):

1. **View Applications**: Go to "Tutor applications"
2. **Send Status Updates**: 
   - Select applications
   - Use "Approve selected applications" or "Reject selected applications"
   - Emails will be sent automatically

## Email Features

### ✅ Automatic Emails
- **Confirmation**: Sent immediately when application is submitted
- **Status Updates**: Sent when admin approves/rejects applications

### ✅ Professional Templates
- **HTML Version**: Beautiful, responsive design
- **Plain Text Version**: Fallback for email clients that don't support HTML
- **Branded**: Strive Academy branding and colors

### ✅ Error Handling
- **Graceful Failures**: Email failures don't break application submission
- **Logging**: Failed emails are logged to console
- **Fallback**: Application still works even if email fails

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check your Gmail app password is correct
   - Ensure 2FA is enabled on your Gmail account

2. **"Connection refused"**
   - Check your internet connection
   - Verify Gmail SMTP settings are correct

3. **"Email not received"**
   - Check spam/junk folder
   - Verify recipient email address is correct
   - Test with a different email address

### Testing Commands:

```bash
# Test email configuration
pipenv run python test_email.py

# Check Django email settings
pipenv run python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
```

## Security Notes

1. **Never commit email passwords** to version control
2. **Use environment variables** for production:
   ```python
   EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
   EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
   ```
3. **Use app passwords** instead of your main Gmail password
4. **Monitor email usage** to avoid hitting Gmail limits

## Production Setup

For production deployment:

1. **Environment Variables**: Set email credentials as environment variables
2. **Email Service**: Consider using services like SendGrid or AWS SES for better deliverability
3. **Monitoring**: Set up email delivery monitoring
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Email Templates Customization

To customize email templates:

1. **Edit HTML templates**: `tutors/templates/tutors/emails/`
2. **Edit text templates**: Same directory with `.txt` extension
3. **Update branding**: Modify colors, logos, and content
4. **Add translations**: Create language-specific templates

## Support

If you encounter issues:

1. Check the Django console for error messages
2. Verify Gmail app password is correct
3. Test with a simple email first
4. Check Gmail account settings and security 