from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile, TutorProfile, AdminProfile, Transaction

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
    list_display = ('user', 'university', 'experience_years', 'hourly_rate', 'is_approved', 'account_live', 'current_balance', 'rating', 'password_setup_completed')
    list_filter = ('is_approved', 'account_live', 'password_setup_completed', 'tutor_contract_status', 'wwcc_status', 'university', 'experience_years')
    search_fields = ('user__username', 'user__email', 'university', 'degree')
    readonly_fields = ('password_setup_token', 'approved_at', 'documents_reviewed_at', 'reviewed_by', 'created_at', 'updated_at')
    actions = ['approve_tutors', 'reject_tutors', 'approve_documents', 'set_account_live']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Education & Background', {
            'fields': ('university', 'degree', 'graduation_year', 'atar', 'qualifications', 'experience_years')
        }),
        ('Tutoring Details', {
            'fields': ('subjects_taught', 'hourly_rate', 'availability', 'bio')
        }),
        ('Application Data', {
            'fields': ('motivation', 'preferred_locations')
        }),
        ('Application Documents', {
            'fields': ('resume', 'video_submission', 'profile_picture')
        }),
        ('Required Documents', {
            'fields': ('tutor_contract', 'tutor_contract_status', 'wwcc_document', 'wwcc_status')
        }),
        ('Payment Information', {
            'fields': ('account_name', 'bsb', 'account_number', 'current_balance')
        }),
        ('Account Status', {
            'fields': ('is_approved', 'account_live', 'approved_at', 'password_setup_completed', 'password_setup_token', 'documents_reviewed_at', 'reviewed_by')
        }),
        ('Statistics', {
            'fields': ('rating', 'total_reviews', 'created_at', 'updated_at')
        }),
    )
    
    def approve_documents(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            tutor_contract_status='approved',
            wwcc_status='approved',
            documents_reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        # Update account_live for profiles where both docs are approved and tutor is approved
        for profile in queryset:
            if profile.is_approved and profile.tutor_contract_status == 'approved' and profile.wwcc_status == 'approved':
                profile.account_live = True
                profile.save()
        
        self.message_user(request, f"{updated} tutor documents approved successfully.")
    approve_documents.short_description = "Approve selected tutor documents"
    
    def set_account_live(self, request, queryset):
        updated = queryset.filter(is_approved=True, tutor_contract_status='approved', wwcc_status='approved').update(account_live=True)
        self.message_user(request, f"{updated} tutor accounts set to live.")
    set_account_live.short_description = "Set accounts live (only for approved tutors with approved documents)"
    
    def save_model(self, request, obj, form, change):
        """Override save to handle approval/rejection when is_approved field changes"""
        from .utils import send_tutor_approval_email, send_tutor_rejection_email
        from django.utils import timezone
        from django.contrib import messages
        
        # Check if this is an update and if approval status changed
        if change:
            try:
                # Get the original object from database
                original = TutorProfile.objects.get(pk=obj.pk)
                
                # Check if approval status changed from False to True
                if not original.is_approved and obj.is_approved:
                    # Handle approval
                    obj.approved_at = timezone.now()
                    obj.password_setup_completed = False
                    obj.regenerate_password_token()
                    
                    # Enable user account
                    obj.user.is_active = True
                    obj.user.save()
                    
                    # Save first to get the updated token
                    super().save_model(request, obj, form, change)
                    
                    # Send approval email
                    email_sent = send_tutor_approval_email(obj.user, obj)
                    if email_sent:
                        messages.success(request, f'Tutor {obj.user.email} approved successfully and approval email sent!')
                    else:
                        messages.warning(request, f'Tutor {obj.user.email} approved but email failed to send.')
                    return
                
                # Check if approval status changed from True to False
                elif original.is_approved and not obj.is_approved:
                    # Handle rejection
                    obj.approved_at = None
                    obj.password_setup_completed = False
                    
                    # Disable user account
                    obj.user.is_active = False
                    obj.user.save()
                    
                    # Save first
                    super().save_model(request, obj, form, change)
                    
                    # Send rejection email
                    email_sent = send_tutor_rejection_email(obj.user, obj)
                    if email_sent:
                        messages.success(request, f'Tutor {obj.user.email} approval revoked and rejection email sent!')
                    else:
                        messages.warning(request, f'Tutor {obj.user.email} approval revoked but email failed to send.')
                    return
                    
            except Exception as e:
                messages.error(request, f'Error processing approval status change: {str(e)}')
        
        # Default save for other changes
        super().save_model(request, obj, form, change)
    
    def approve_tutors(self, request, queryset):
        from .utils import send_tutor_approval_email
        from django.utils import timezone
        
        approved_count = 0
        for tutor_profile in queryset.filter(is_approved=False):
            try:
                # Approve the tutor
                tutor_profile.is_approved = True
                tutor_profile.approved_at = timezone.now()
                tutor_profile.password_setup_completed = False
                tutor_profile.regenerate_password_token()
                tutor_profile.save()
                
                # Enable user account
                tutor_profile.user.is_active = True
                tutor_profile.user.save()
                
                # Send approval email
                email_sent = send_tutor_approval_email(tutor_profile.user, tutor_profile)
                if email_sent:
                    approved_count += 1
                    self.message_user(request, f'Tutor {tutor_profile.user.email} approved and email sent.')
                else:
                    self.message_user(request, f'Tutor {tutor_profile.user.email} approved but email failed to send.', level='warning')
            except Exception as e:
                self.message_user(request, f'Error approving tutor {tutor_profile.user.email}: {str(e)}', level='error')
        
        if approved_count > 0:
            self.message_user(request, f'{approved_count} tutors approved successfully.')
    approve_tutors.short_description = "Approve selected tutors and send emails"
    
    def reject_tutors(self, request, queryset):
        from .utils import send_tutor_rejection_email
        
        rejected_count = 0
        for tutor_profile in queryset.filter(is_approved=False):
            try:
                # Send rejection email
                email_sent = send_tutor_rejection_email(tutor_profile.user, tutor_profile)
                if email_sent:
                    # Delete the application
                    user_email = tutor_profile.user.email
                    tutor_profile.user.delete()  # This will cascade delete the profile
                    rejected_count += 1
                    self.message_user(request, f'Tutor {user_email} rejected and email sent.')
                else:
                    self.message_user(request, f'Tutor {tutor_profile.user.email} email failed to send.', level='warning')
            except Exception as e:
                self.message_user(request, f'Error rejecting tutor {tutor_profile.user.email}: {str(e)}', level='error')
        
        if rejected_count > 0:
            self.message_user(request, f'{rejected_count} tutors rejected successfully.')
    reject_tutors.short_description = "Reject selected tutors and send emails"

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'permissions_level')
    search_fields = ('user__username', 'user__email', 'department')
    list_filter = ('permissions_level',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('tutor_profile', 'date', 'description', 'amount', 'status', 'transaction_type', 'processed_by')
    list_filter = ('status', 'transaction_type', 'date', 'processed_by')
    search_fields = ('tutor_profile__user__username', 'tutor_profile__user__email', 'description', 'reference_number')
    readonly_fields = ('date', 'processed_at')
    ordering = ('-date',)
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('tutor_profile', 'description', 'amount', 'transaction_type', 'reference_number')
        }),
        ('Status & Processing', {
            'fields': ('status', 'processed_by', 'processed_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('date',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        from django.utils import timezone
        
        # Set processed_by and processed_at when status changes to completed
        if obj.status == 'completed' and not obj.processed_at:
            obj.processed_by = request.user
            obj.processed_at = timezone.now()
        
        super().save_model(request, obj, form, change)
        
        # Update tutor balance if transaction is completed
        if obj.status == 'completed':
            tutor_profile = obj.tutor_profile
            if obj.transaction_type in ['payment', 'bonus']:
                tutor_profile.current_balance += obj.amount
            elif obj.transaction_type in ['deduction', 'refund']:
                tutor_profile.current_balance -= obj.amount
            tutor_profile.save()
    
    actions = ['mark_completed', 'mark_failed']
    
    def mark_completed(self, request, queryset):
        from django.utils import timezone
        
        updated = 0
        for transaction in queryset.filter(status='pending'):
            transaction.status = 'completed'
            transaction.processed_by = request.user
            transaction.processed_at = timezone.now()
            transaction.save()
            
            # Update tutor balance
            tutor_profile = transaction.tutor_profile
            if transaction.transaction_type in ['payment', 'bonus']:
                tutor_profile.current_balance += transaction.amount
            elif transaction.transaction_type in ['deduction', 'refund']:
                tutor_profile.current_balance -= transaction.amount
            tutor_profile.save()
            updated += 1
        
        self.message_user(request, f"{updated} transactions marked as completed and balances updated.")
    mark_completed.short_description = "Mark selected transactions as completed"
    
    def mark_failed(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='failed',
            processed_by=request.user,
            processed_at=timezone.now()
        )
        self.message_user(request, f"{updated} transactions marked as failed.")
    mark_failed.short_description = "Mark selected transactions as failed"
