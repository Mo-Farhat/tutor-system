from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile, TutorProfile, AdminProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_active')
    list_filter = ('role', 'is_verified', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('role', 'phone_number', 'date_of_birth', 'profile_picture', 'is_verified')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {
            'fields': ('role', 'phone_number', 'date_of_birth')
        }),
    )

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'school', 'grade_level', 'parent_email')
    search_fields = ('user__username', 'user__email', 'school')
    list_filter = ('grade_level',)

@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'qualifications', 'years_experience', 'hourly_rate', 'is_approved', 'rating')
    list_filter = ('qualifications', 'availability', 'is_approved')
    search_fields = ('user__username', 'user__email', 'university', 'degree')
    actions = ['approve_tutors', 'reject_tutors']
    
    def approve_tutors(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f'{queryset.count()} tutors approved successfully.')
    approve_tutors.short_description = "Approve selected tutors"
    
    def reject_tutors(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f'{queryset.count()} tutors rejected.')
    reject_tutors.short_description = "Reject selected tutors"

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'permissions_level')
    search_fields = ('user__username', 'user__email', 'department')
    list_filter = ('permissions_level',)
