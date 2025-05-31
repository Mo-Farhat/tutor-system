# Email Configuration (Gmail SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'academicsstrive@gmail.com'  # Replace with your Gmail address
EMAIL_HOST_PASSWORD = 'kbgvmfnjwixguyzu'  # Replace with Gmail App Password
DEFAULT_FROM_EMAIL = 'Strive Academy <academicsstrive@gmail.com>'

# Email settings
EMAIL_TIMEOUT = 30

