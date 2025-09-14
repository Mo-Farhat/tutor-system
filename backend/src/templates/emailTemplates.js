// HTML Email Templates for Strive Academy
// Modern, responsive templates with Strive Academy branding

const getBaseTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .tagline {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        
        .highlight-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 4px 4px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        
        .info-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
        }
        
        .info-label {
            font-weight: bold;
            color: #667eea;
            font-size: 14px;
        }
        
        .info-value {
            margin-top: 5px;
            color: #2c3e50;
        }
        
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .footer-links {
            margin: 20px 0;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 15px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 30px 0;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-approved {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .content {
                padding: 20px 15px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .footer-links a {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Strive Academy</div>
            <div class="tagline">Empowering Students, Inspiring Excellence</div>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Contact Us</a>
            </div>
            
            <div class="social-links">
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
                <a href="#">Facebook</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; opacity: 0.8;">
                © 2024 Strive Academy. All rights reserved.<br>
                This email was sent to you because you applied to become a tutor with Strive Academy.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Application Confirmation Template
const getApplicationConfirmationTemplate = (applicationData) => {
  const content = `
        <div class="greeting">Hello ${applicationData.fullName}!</div>
        
        <div class="message">
            Thank you for your interest in joining Strive Academy as a tutor! We're excited to review your application and learn more about your passion for education.
        </div>
        
        <div class="highlight-box">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Application Received</h3>
            <div class="status-badge status-pending">Status: Under Review</div>
            <p style="margin-top: 15px;">
                We've received your application and our team will review it within 1-5 business days. 
                You'll receive an email notification once we've made a decision.
            </p>
        </div>
        
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Application ID</div>
                <div class="info-value">#${applicationData.applicationId}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Submitted</div>
                <div class="info-value">${new Date().toLocaleString()}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${applicationData.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">ATAR Score</div>
                <div class="info-value">${applicationData.atar}</div>
            </div>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">What happens next?</h3>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li>Our team will carefully review your application and qualifications</li>
                <li>We'll check your references and verify your academic achievements</li>
                <li>You'll receive an email with our decision within 1-5 business days</li>
                <li>If approved, you'll get a secure link to set up your tutor account</li>
            </ol>
        </div>
        
        <div class="message">
            <p>If you have any questions about your application or our process, please don't hesitate to contact us at <strong>${
              process.env.SUPPORT_EMAIL || "support@striveacademy.com"
            }</strong>.</p>
        </div>
    `;

  return getBaseTemplate("Application Received - Strive Academy", content);
};

// Admin Notification Template
const getAdminNotificationTemplate = (applicationData) => {
  const content = `
        <div class="greeting">New Tutor Application</div>
        
        <div class="message">
            A new tutor application has been submitted and requires your review.
        </div>
        
        <div class="highlight-box">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Application Summary</h3>
            <div class="status-badge status-pending">Status: Pending Review</div>
        </div>
        
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Applicant Name</div>
                <div class="info-value">${applicationData.fullName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${applicationData.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${applicationData.phone}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Application ID</div>
                <div class="info-value">#${applicationData.applicationId}</div>
            </div>
            <div class="info-item">
                <div class="info-label">ATAR Score</div>
                <div class="info-value">${applicationData.atar}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Current Study</div>
                <div class="info-value">${applicationData.currentStudy}</div>
            </div>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Subjects to Tutor</h3>
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">${
              applicationData.subjectsToTutor
            }</p>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Motivation Statement</h3>
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; font-style: italic;">"${
              applicationData.motivation
            }"</p>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Quick Actions</h3>
            <p>Review the full application details and make your decision:</p>
            <ul style="padding-left: 20px; margin-top: 10px;">
                <li>Application submitted: ${applicationData.createdAt}</li>
                <li>Review application: <a href="${
                  process.env.BACKEND_URL || "http://localhost:8000"
                }/admin/applications/${
    applicationData.id
  }">View Full Application</a></li>
                <li>Approve: <code>POST ${
                  process.env.BACKEND_URL || "http://localhost:8000"
                }/api/auth/tutor/approve/${applicationData.id}</code></li>
            </ul>
        </div>
    `;

  return getBaseTemplate("New Tutor Application - Strive Academy", content);
};

// Approval Notification Template
const getApprovalNotificationTemplate = (tutorData, setupToken) => {
  const setupUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/tutor/setup-password/${setupToken}`;

  const content = `
        <div class="greeting">Congratulations ${tutorData.fullName}! 🎉</div>
        
        <div class="message">
            We're thrilled to inform you that your application to become a Strive Academy tutor has been <strong>approved</strong>! 
            Welcome to our team of exceptional educators.
        </div>
        
        <div class="highlight-box">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Application Approved</h3>
            <div class="status-badge status-approved">Status: Approved</div>
            <p style="margin-top: 15px;">
                Your qualifications and passion for teaching have impressed our team. 
                We're excited to have you join our community of dedicated tutors.
            </p>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Next Steps</h3>
            <p>To complete your onboarding and start accepting students, please follow these steps:</p>
            <ol style="padding-left: 20px; line-height: 1.8; margin-top: 15px;">
                <li><strong>Set up your account</strong> - Click the button below to create your password</li>
                <li><strong>Complete your profile</strong> - Add your photo, bio, and teaching preferences</li>
                <li><strong>Upload documents</strong> - Submit your Working with Children Check and other required documents</li>
                <li><strong>Start tutoring</strong> - Begin accepting students and making a difference!</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}" class="cta-button">Set Up Your Account</a>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Important Information</h3>
            <ul style="padding-left: 20px; line-height: 1.8;">
                <li><strong>Setup Link Expires:</strong> 7 days from now</li>
                <li><strong>Keep this email safe</strong> - You'll need it to access your account</li>
                <li><strong>Need help?</strong> Contact us at ${
                  process.env.SUPPORT_EMAIL || "support@striveacademy.com"
                }</li>
            </ul>
        </div>
        
        <div class="message">
            <p style="font-size: 14px; color: #6c757d;">
                <strong>Setup Link:</strong> <a href="${setupUrl}">${setupUrl}</a>
            </p>
        </div>
    `;

  return getBaseTemplate(
    "Welcome to Strive Academy - Set Up Your Account",
    content
  );
};

// Rejection Notification Template
const getRejectionNotificationTemplate = (tutorData, reason = "") => {
  const content = `
        <div class="greeting">Hello ${tutorData.fullName}</div>
        
        <div class="message">
            Thank you for your interest in becoming a tutor with Strive Academy. 
            We appreciate the time and effort you put into your application.
        </div>
        
        <div class="highlight-box">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Application Update</h3>
            <div class="status-badge status-rejected">Status: Not Selected</div>
            <p style="margin-top: 15px;">
                After careful consideration, we have decided not to move forward with your application at this time.
            </p>
        </div>
        
        ${
          reason
            ? `
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Feedback</h3>
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">${reason}</p>
        </div>
        `
            : ""
        }
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">What's Next?</h3>
            <p>We encourage you to:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
                <li>Continue developing your teaching skills and experience</li>
                <li>Reapply in the future as our requirements and needs may change</li>
                <li>Consider other opportunities within the education sector</li>
            </ul>
        </div>
        
        <div class="message">
            <p>If you have any questions about this decision or would like to discuss your application further, 
            please feel free to contact us at <strong>${
              process.env.SUPPORT_EMAIL || "support@striveacademy.com"
            }</strong>.</p>
        </div>
        
        <div class="message">
            <p>We wish you the best in your future endeavors and thank you for considering Strive Academy.</p>
        </div>
    `;

  return getBaseTemplate("Strive Academy Application Update", content);
};

// Setup Reminder Template
const getSetupReminderTemplate = (tutorData, setupToken) => {
  const setupUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/tutor/setup-password/${setupToken}`;

  const content = `
        <div class="greeting">Hello ${tutorData.fullName}</div>
        
        <div class="message">
            This is a friendly reminder to complete your Strive Academy tutor account setup. 
            We're excited to have you join our team!
        </div>
        
        <div class="highlight-box">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Action Required</h3>
            <div class="status-badge status-pending">Setup Pending</div>
            <p style="margin-top: 15px;">
                Your account setup link will expire soon. Please complete your setup to start tutoring with us.
            </p>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Complete Your Setup</h3>
            <p>Setting up your account is quick and easy. You'll be able to:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
                <li>Create your secure password</li>
                <li>Set up your tutor profile</li>
                <li>Upload required documents</li>
                <li>Start accepting students</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}" class="cta-button">Complete Setup Now</a>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Need Help?</h3>
            <p>If you're experiencing any issues with the setup process, please contact our support team:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
                <li>Email: ${
                  process.env.SUPPORT_EMAIL || "support@striveacademy.com"
                }</li>
                <li>Phone: ${process.env.SUPPORT_PHONE || "(02) 1234 5678"}</li>
                <li>Available: Monday-Friday, 9 AM - 5 PM</li>
            </ul>
        </div>
        
        <div class="message">
            <p style="font-size: 14px; color: #6c757d;">
                <strong>Setup Link:</strong> <a href="${setupUrl}">${setupUrl}</a>
            </p>
        </div>
    `;

  return getBaseTemplate(
    "Complete Your Strive Academy Setup - Reminder",
    content
  );
};

module.exports = {
  getApplicationConfirmationTemplate,
  getAdminNotificationTemplate,
  getApprovalNotificationTemplate,
  getRejectionNotificationTemplate,
  getSetupReminderTemplate,
};
