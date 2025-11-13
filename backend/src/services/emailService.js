const nodemailer = require("nodemailer");
const {
  getApplicationConfirmationTemplate,
  getAdminNotificationTemplate,
  getApprovalNotificationTemplate,
  getRejectionNotificationTemplate,
  getSetupReminderTemplate,
  getTutorRequestNotificationTemplate,
  getFeedbackReminderTemplate,
  getStudentOnboardingTemplate,
  getStudentReadyForFirstLessonTemplate,
} = require("../templates/emailTemplates");

class EmailService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
    this.transporter = null;

    this.initializeTransporter();
    console.log(
      `📧 Email service initialized (${
        this.isProduction ? "production" : "development"
      } mode)`
    );
  }

  initializeTransporter() {
    // Use Gmail configuration
    const emailUser = process.env.EMAIL_HOST_USER || process.env.EMAIL_USER;
    const emailPassword =
      process.env.EMAIL_HOST_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.error("❌ Gmail credentials not configured!");
      console.error(
        "Please set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD environment variables"
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassword, // Gmail App Password
      },
    });
    console.log(`📧 Gmail SMTP configured for: ${emailUser}`);
  }

  async sendEmail(to, subject, htmlContent, textContent = "") {
    try {
      if (!this.transporter) {
        console.error("❌ Email transporter not initialized!");
        return { success: false, error: "Email service not configured" };
      }

      const mailOptions = {
        from:
          process.env.DEFAULT_FROM_EMAIL ||
          process.env.EMAIL_FROM ||
          "Strive Academics <noreply@striveacademy.com>",
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully to ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  async sendApplicationConfirmation(email, applicationData) {
    const subject = "Application Received - Strive Academics";
    const htmlContent = getApplicationConfirmationTemplate(applicationData);
    const textContent = `
Dear ${applicationData.fullName},

Thank you for applying to become a tutor with Strive Academics!

Application Details:
- Application ID: ${applicationData.applicationId}
- Email: ${email}
- Submitted: ${new Date().toLocaleString()}

What happens next:
1. Our team will review your application within 1-5 business days
2. You'll receive an email with our decision
3. If approved, you'll get a link to set up your account

If you have any questions, please contact us at support@striveacademy.com

Best regards,
The Strive Academics Team
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendAdminNotification(applicationData) {
    const adminEmail = process.env.EMAIL_HOST_USER;
    const subject = `New Tutor Application - ${applicationData.fullName}`;
    const htmlContent = getAdminNotificationTemplate(applicationData);
    const textContent = `
New tutor application received:

Applicant: ${applicationData.fullName}
Email: ${applicationData.email}
Phone: ${applicationData.phone}
Application ID: ${applicationData.applicationId}
ATAR: ${applicationData.atar}
Current Study: ${applicationData.currentStudy}
Subjects to Tutor: ${applicationData.subjectsToTutor}

Motivation:
${applicationData.motivation}

Review application: ${
      process.env.BACKEND_URL || "http://localhost:8000"
    }/admin/applications/${applicationData.id}
Approve: POST ${
      process.env.BACKEND_URL || "http://localhost:8000"
    }/api/auth/tutor/approve/${applicationData.id}

Applied at: ${applicationData.createdAt}
    `;

    return await this.sendEmail(adminEmail, subject, htmlContent, textContent);
  }

  async sendApprovalNotification(email, tutorData, setupToken) {
    const subject = "Welcome to Strive Academics - Set Up Your Account";
    const htmlContent = getApprovalNotificationTemplate(tutorData, setupToken);
    const setupUrl = `${process.env.FRONTEND_URL}/tutor/setup-password/${setupToken}`;
    const textContent = `
Dear ${tutorData.fullName},

Congratulations! Your application to become a Strive Academics tutor has been approved! 🎉

Next Steps:
1. Click the link below to set up your password and activate your account
2. Complete your tutor profile
3. Upload required documents
4. Start accepting students!

Setup your account: ${setupUrl}

Important:
- This link expires in 7 days
- Keep this email safe for your records
- Contact us if you have any questions

We're excited to have you join our team of exceptional tutors!

Best regards,
The Strive Academics Team

Setup Link: ${setupUrl}
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendRejectionNotification(email, tutorData, reason = "") {
    const subject = "Strive Academics Application Update";
    const htmlContent = getRejectionNotificationTemplate(tutorData, reason);
    const textContent = `
Dear ${tutorData.fullName},

Thank you for your interest in becoming a tutor with Strive Academics.

After careful review of your application, we regret to inform you that we cannot move forward with your application at this time.

${reason ? `Feedback: ${reason}` : ""}

We encourage you to reapply in the future as our requirements and needs may change.

If you have any questions about this decision, please feel free to contact us.

Best regards,
The Strive Academics Team
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendSetupReminder(email, tutorData, setupToken) {
    const subject = "Complete Your Strive Academics Setup - Reminder";
    const htmlContent = getSetupReminderTemplate(tutorData, setupToken);
    const setupUrl = `${process.env.FRONTEND_URL}/tutor/setup-password/${setupToken}`;
    const textContent = `
Dear ${tutorData.fullName},

This is a friendly reminder to complete your Strive Academics tutor account setup.

Your account setup link expires soon. Please complete your setup to start tutoring:

Setup your account: ${setupUrl}

If you're experiencing any issues, please contact our support team.

Best regards,
The Strive Academics Team
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendTutorRequestNotification(tutorEmail, studentData, tutorData) {
    const subject = "New Student Enquiry – Schedule Your Free Academic Consultation";
    const htmlContent = getTutorRequestNotificationTemplate(studentData, tutorData);
    const loginBase = process.env.FRONTEND_URL || "https://striveacademics.com.au";
    const textContent = `
Hi ${tutorData.firstName},

A new student has just contacted you through the Strive Academics platform!
It’s now time to schedule their Free Academic Consultation — a short 15–20 minute Zoom session where you’ll meet the student, understand their goals, and show them what makes Strive Academics special.

Student Details:
- Name: ${studentData.firstName} ${studentData.lastName}
- Email: ${studentData.email}

Open Tutor Requests: ${loginBase}/tutor/requests

Guidance:
- Build rapport and understand goals/challenges
- Demonstrate your approach and plan next steps for first paid lesson
- Tentatively schedule first lesson; confirm once profile and payment are complete

After the consultation:
1) Send a friendly follow-up to the student
2) Update pipeline status to “Free Academic Consultation Completed” and record tentative first lesson

Best regards,
Strive Academics
https://www.striveacademics.com.au
    `;

    return await this.sendEmail(tutorEmail, subject, htmlContent, textContent);
  }

  async sendFeedbackReminderEmail(studentEmail, studentData, tutorData, lessonData) {
    const subject = "Please provide feedback for your tutor - Strive Academics";
    const htmlContent = getFeedbackReminderTemplate(studentData, tutorData, lessonData);
    const schedulingUrl = `${process.env.FRONTEND_URL || "https://striveacademics.com.au"}/dashboard/student/scheduling`;
    const textContent = `
Dear ${studentData.firstName},

Your recent tutoring session with ${tutorData.firstName} ${tutorData.lastName} has been completed.

Session Details:
- Subject: ${lessonData.subject}
- Date: ${new Date(lessonData.startAt).toLocaleDateString()}

Please provide feedback for your tutor. Is there anything you'd like to share to help improve future sessions?

Your feedback helps us:
- Improve the quality of tutoring sessions
- Better match students with tutors
- Enhance the overall learning experience

Leave feedback: ${schedulingUrl}

Thank you for being part of Strive Academics!

Best regards,
The Strive Academics Team
    `;

    return await this.sendEmail(studentEmail, subject, htmlContent, textContent);
  }

  // Send Student Onboarding Email (when a student contacts a tutor)
  async sendStudentOnboardingEmail(studentEmail, studentData) {
    const subject = "Welcome to Strive Academics – Let’s Get You Started";
    const loginUrl = `${process.env.FRONTEND_URL || "https://striveacademics.com.au"}/login`;
    const htmlContent = getStudentOnboardingTemplate(studentData, loginUrl);
    const textContent = `
Hi ${studentData.firstName || studentData.first_name || "Student"},

Welcome to Strive Academics! Your message has been sent to your chosen tutor.

Step 1: Confirm Your Payment Details
1) Log in: ${loginUrl}
2) Go to Payment Details
3) Add or update your payment method

Step 2: Know Our Lesson Policies
- Valid: Illness, Tutor absence, Urgent non-reschedulable appointments, Court appearances, Emergencies
- Invalid (50% fee): Lateness/transport, Reschedulable events, Poor planning/double-booking, Work/study clashes, No-shows
- Notice: Please give at least 1 hour’s notice to cancel, otherwise full fee may apply.

Step 3: Get Ready for Your First Lesson
Your tutor will reach out to confirm time/date after payment details are confirmed.

If you have questions, reply to this email.

Strive Academics
https://www.striveacademics.com.au
`;

    return await this.sendEmail(studentEmail, subject, htmlContent, textContent);
  }

  // Notify tutor when student is ready for first lesson (after payment added)
  async sendStudentReadyForFirstLessonEmail(tutorEmail, studentData, tutorData) {
    const subject = `Student Ready for First Lesson – ${
      `${studentData.firstName || studentData.first_name || ""} ${studentData.lastName || studentData.last_name || ""}`.trim() ||
      "Student"
    }`;
    const htmlContent = getStudentReadyForFirstLessonTemplate(studentData, tutorData);
    const supportEmail = process.env.SUPPORT_EMAIL || "support@striveacademics.com.au";
    const textContent = `
Hi ${tutorData.firstName || tutorData.first_name || "Tutor"},

Good news — ${studentData.firstName || studentData.first_name || "Student"} ${studentData.lastName || studentData.last_name || ""} has now updated their payment details and is ready to begin regular lessons with you. 🎉
You’ve already completed their Free Academic Consultation, so this is the time to lock in their first official session and begin their ongoing tutoring plan.

Next Steps:
- Confirm the first lesson time (use tentative time from consultation or agree on new time)
- Prepare the first full lesson (focus on the goals identified)
- Update your Strive dashboard once confirmed

If any details need adjusting or you encounter an issue, please reach out to ${supportEmail}.

Best regards,
Strive Academics
https://www.striveacademics.com.au
`;

    return await this.sendEmail(tutorEmail, subject, htmlContent, textContent);
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
