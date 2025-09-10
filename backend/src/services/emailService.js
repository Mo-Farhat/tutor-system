const nodemailer = require("nodemailer");
const {
  getApplicationConfirmationTemplate,
  getAdminNotificationTemplate,
  getApprovalNotificationTemplate,
  getRejectionNotificationTemplate,
  getSetupReminderTemplate,
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
    if (this.isProduction) {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
        },
      });
    } else {
      // Development mode - use Ethereal Email for testing
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || "ethereal.user@ethereal.email",
          pass: process.env.ETHEREAL_PASS || "ethereal.pass",
        },
      });
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = "") {
    try {
      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          "Strive Academy <noreply@striveacademy.com>",
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent,
      };

      if (this.isProduction) {
        // Send actual email in production
        const result = await this.transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully to ${to}: ${result.messageId}`);
        return { success: true, messageId: result.messageId };
      } else {
        // Development mode - use Ethereal Email for testing
        const result = await this.transporter.sendMail(mailOptions);
        console.log("\n📧 ===== EMAIL SENT (DEV MODE) =====");
        console.log(`📨 To: ${to}`);
        console.log(`📝 Subject: ${subject}`);
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
        console.log("📧 ================================\n");
        return { success: true, messageId: result.messageId };
      }
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  async sendApplicationConfirmation(email, applicationData) {
    const subject = "Application Received - Strive Academy";
    const htmlContent = getApplicationConfirmationTemplate(applicationData);
    const textContent = `
Dear ${applicationData.fullName},

Thank you for applying to become a tutor with Strive Academy!

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
The Strive Academy Team
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendAdminNotification(applicationData) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@striveacademy.com";
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

Review application: http://localhost:8000/admin/applications/${applicationData.id}
Approve: POST http://localhost:8000/api/auth/tutor/approve/${applicationData.id}

Applied at: ${applicationData.createdAt}
    `;

    return await this.sendEmail(adminEmail, subject, htmlContent, textContent);
  }

  async sendApprovalNotification(email, tutorData, setupToken) {
    const subject = "Welcome to Strive Academy - Set Up Your Account";
    const htmlContent = getApprovalNotificationTemplate(tutorData, setupToken);
    const setupUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/tutor/setup-password/${setupToken}`;
    const textContent = `
Dear ${tutorData.fullName},

Congratulations! Your application to become a Strive Academy tutor has been approved! 🎉

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
The Strive Academy Team

Setup Link: ${setupUrl}
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendRejectionNotification(email, tutorData, reason = "") {
    const subject = "Strive Academy Application Update";
    const htmlContent = getRejectionNotificationTemplate(tutorData, reason);
    const textContent = `
Dear ${tutorData.fullName},

Thank you for your interest in becoming a tutor with Strive Academy.

After careful review of your application, we regret to inform you that we cannot move forward with your application at this time.

${reason ? `Feedback: ${reason}` : ""}

We encourage you to reapply in the future as our requirements and needs may change.

If you have any questions about this decision, please feel free to contact us.

Best regards,
The Strive Academy Team
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }

  async sendSetupReminder(email, tutorData, setupToken) {
    const subject = "Complete Your Strive Academy Setup - Reminder";
    const htmlContent = getSetupReminderTemplate(tutorData, setupToken);
    const setupUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/tutor/setup-password/${setupToken}`;
    const textContent = `
Dear ${tutorData.fullName},

This is a friendly reminder to complete your Strive Academy tutor account setup.

Your account setup link expires soon. Please complete your setup to start tutoring:

Setup your account: ${setupUrl}

If you're experiencing any issues, please contact our support team.

Best regards,
The Strive Academy Team
    `;

    return await this.sendEmail(email, subject, htmlContent, textContent);
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
