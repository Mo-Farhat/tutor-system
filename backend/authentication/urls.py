from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('check-auth/', views.check_auth_status, name='check_auth'),
    
    # Tutor application
    path('tutor/apply/', views.TutorApplicationView.as_view(), name='tutor_apply'),
    
    # Tutor password setup
    path('tutor/setup-password/<uuid:token>/', views.TutorPasswordSetupView.as_view(), name='tutor_password_setup'),
    
    # User profile management
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    
    # Student endpoints
    path('student/profile/', views.StudentProfileView.as_view(), name='student_profile'),
    
    # Tutor endpoints
    path('tutor/profile/', views.TutorProfileView.as_view(), name='tutor_profile'),
    path('tutors/', views.TutorListView.as_view(), name='tutor_list'),
    path('tutors/<int:pk>/', views.TutorDetailView.as_view(), name='tutor_detail'),
    
    # Admin endpoints
    path('admin/profile/', views.AdminProfileView.as_view(), name='admin_profile'),
    path('admin/tutors/pending/', views.AdminTutorApprovalView.as_view(), name='admin_pending_tutors'),
    path('admin/tutors/<int:tutor_id>/approve/', views.AdminTutorApprovalView.as_view(), name='admin_approve_tutor'),
    path('admin/users/', views.AdminUserManagementView.as_view(), name='admin_user_management'),
] 