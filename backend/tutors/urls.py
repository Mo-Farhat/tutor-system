from django.urls import path
from . import views

app_name = 'tutors'

urlpatterns = [
    # Tutor application endpoints
    path('tutor/apply/', views.TutorApplicationView.as_view(), name='tutor_apply'),
    path('tutor/setup-password/<str:token>/', views.TutorPasswordSetupView.as_view(), name='tutor_setup_password'),
    
    # Authentication endpoints
    path('login/', views.LoginView.as_view(), name='login'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    
    # Tutor dashboard endpoints
    path('tutor/profile/', views.TutorProfileView.as_view(), name='tutor_profile'),
    path('tutor/subjects/', views.get_subjects, name='tutor_subjects'),
    path('tutor/documents/', views.TutorDocumentsView.as_view(), name='tutor_documents'),
    path('tutor/payment-details/', views.TutorPaymentDetailsView.as_view(), name='tutor_payment_details'),
    path('tutor/earnings/', views.TutorEarningsView.as_view(), name='tutor_earnings'),
    path('tutor/notifications/', views.TutorNotificationsView.as_view(), name='tutor_notifications'),
    path('tutor/completion-status/', views.TutorCompletionStatusView.as_view(), name='tutor_completion_status'),
    
    # Additional tutor endpoints (plural for frontend compatibility)
    path('tutors/live/', views.get_subjects, name='tutors_live'),  # Placeholder for live tutors
    
    # Subject data endpoint
    path('subjects/', views.get_subjects, name='subjects'),
] 