// HTML Email Templates for Strive Academics
// Modern, responsive templates with Strive Academics branding

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
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        
        .logo-svg {
            width: 60px;
            height: 45px;
            fill: white;
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
            <div class="logo">
                <svg class="logo-svg" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(0.83396,0,0,0.83396,77.175,63.752)">
                        <path stroke-miterlimit="2" d="m 302.86,440.19 c 2.6349,1.031 5.4416,1.4893 8.4202,1.4893 3.1504,0 5.8426,-0.45824 8.0192,-1.432 2.1766,-0.91648 3.7805,-2.2339 4.8115,-3.8378 1.031,-1.6038 1.6038,-3.3795 1.6038,-5.327 0,-2.3485 -0.63008,-4.2387 -1.8902,-5.6134 -1.2602,-1.3747 -2.7494,-2.463 -4.4678,-3.1504 -1.7757,-0.68736 -4.1242,-1.3747 -7.0454,-2.1194 -2.6349,-0.63008 -4.7542,-1.2602 -6.2435,-1.833 -1.5466,-0.5728 -2.8067,-1.3747 -3.8378,-2.463 -1.031,-1.031 -1.5466,-2.463 -1.5466,-4.296 0,-2.3485 0.91648,-4.296 2.864,-5.7853 1.8902,-1.4893 4.697,-2.2339 8.4202,-2.2339 1.833,0 3.7232,0.2864 5.6707,0.8592 1.9475,0.5728 3.7232,1.432 5.327,2.5203 l 1.0883,-2.3485 c -1.6038,-1.0883 -3.4368,-1.9475 -5.5562,-2.6349 -2.1766,-0.63008 -4.3533,-0.97376 -6.5299,-0.97376 -3.2077,0 -5.8426,0.51552 -7.9619,1.432 -2.1194,0.97376 -3.6659,2.2912 -4.697,3.895 -1.031,1.6038 -1.5466,3.3795 -1.5466,5.327 0,2.4058 0.5728,4.3533 1.833,5.7853 1.2602,1.432 2.7494,2.463 4.5251,3.1504 1.7757,0.68736 4.1242,1.432 7.1027,2.1194 2.5776,0.63008 4.6397,1.2029 6.1862,1.7757 1.4893,0.5728 2.8067,1.432 3.8378,2.463 1.031,1.0883 1.5466,2.5203 1.5466,4.296 0,2.3485 -0.97376,4.2387 -2.9213,5.6707 -1.9475,1.4893 -4.8688,2.1766 -8.6493,2.1766 -2.6349,0 -5.1552,-0.45824 -7.561,-1.3747 -2.4058,-0.91648 -4.296,-2.1766 -5.6707,-3.6659 l -1.3174,2.1766 c 1.4893,1.6038 3.5514,2.9213 6.1862,3.9523 z" style="font-variant-ligatures:none;fill:#ffffff;stroke:#ffffff;stroke-width:2.68499994;stroke-miterlimit:2"/>
                        <path stroke-miterlimit="2" d="m 304.45,375.57 c 3.312,1.296 6.84,1.872 10.584,1.872 3.96,0 7.344,-0.576 10.08,-1.8 2.736,-1.152 4.752,-2.808 6.048,-4.824 1.296,-2.016 2.016,-4.248 2.016,-6.696 0,-2.952 -0.79199,-5.328 -2.376,-7.056 -1.58401,-1.728 -3.456,-3.096 -5.616,-3.96 -2.232,-0.864 -5.184,-1.728 -8.856,-2.664 -3.312,-0.792 -5.976,-1.584 -7.848,-2.304 -1.944,-0.72 -3.528,-1.728 -4.824,-3.096 -1.296,-1.296 -1.944,-3.096 -1.944,-5.4 0,-2.952 1.152,-5.4 3.6,-7.272 2.376,-1.872 5.904,-2.808 10.584,-2.808 2.304,0 4.68,0.36 7.128,1.08 2.448,0.72 4.68,1.8 6.696,3.168 l 1.368,-2.952 c -2.016,-1.368 -4.32,-2.448 -6.984,-3.312 -2.736,-0.792 -5.472,-1.224 -8.208,-1.224 -4.032,0 -7.344,0.648 -10.008,1.8 -2.664,1.224 -4.608,2.88 -5.904,4.896 -1.296,2.016 -1.944,4.248 -1.944,6.696 0,3.024 0.72,5.472 2.304,7.272 1.584,1.8 3.456,3.096 5.688,3.96 2.232,0.864 5.184,1.8 8.928,2.664 3.24,0.792 5.832,1.512 7.776,2.232 1.872,0.72 3.528,1.8 4.824,3.096 1.296,1.368 1.944,3.168 1.944,5.4 0,2.952 -1.224,5.328 -3.672,7.128 -2.448,1.872 -6.12,2.736 -10.872,2.736 -3.312,0 -6.48,-0.576 -9.504,-1.728 -3.024,-1.152 -5.4,-2.736 -7.128,-4.608 l -1.656,2.736 c 1.872,2.016 4.464,3.672 7.776,4.968 z" style="font-variant-ligatures:none;fill:#ffffff;stroke:#ffffff;stroke-width:5;stroke-miterlimit:2"/>
                        <path style="fill:#ffffff;stroke-width:1.21500003" d="m 141.08,319.98 c -0.13365,-0.0134 -17.903,6.3532 -52.774,18.908 -28.915,10.409 -52.557,18.941 -52.54,18.958 0.01689,0.0169 2.3185,1.0153 5.1145,2.2192 2.7961,1.2038 9.3555,4.0229 14.575,6.2643 5.2206,2.2414 26.576,11.411 47.457,20.377 20.881,8.9665 38.042,16.302 38.134,16.302 0.0932,-6.8e-4 11.933,-5.0565 26.312,-11.236 14.379,-6.1791 33.925,-14.573 43.437,-18.651 9.5116,-4.0789 19.209,-8.2429 21.549,-9.2528 2.3407,-1.0099 6.4142,-2.7636 9.0522,-3.8965 2.638,-1.1336 4.8206,-2.0841 4.851,-2.1131 0.0304,-0.0284 -0.25873,-0.16416 -0.64176,-0.30196 -0.3888,-0.1373 -24.021,-8.6447 -52.512,-18.904 -28.504,-10.261 -51.906,-18.662 -52.018,-18.672 z m 86.046,54.003 c -0.0277,-0.0135 -1.1146,0.43437 -2.415,0.99642 l -2.3644,1.0208 -0.0169,29.568 -0.0169,29.568 h 4.8639 v -30.565 c 0,-16.811 -0.023,-30.575 -0.0507,-30.59 z m -150.64,9.3385 c -0.01757,0 -0.02432,6.1481 -0.01486,13.663 l 0.01689,13.663 32.272,13.938 32.272,13.94 32.326,-13.804 32.326,-13.804 6.7e-4,-13.67 c 6.8e-4,-10.909 -0.0162,-13.663 -0.0837,-13.635 -0.0467,0.0189 -14.585,6.2284 -32.308,13.799 l -32.223,13.764 -0.37155,-0.13984 c -0.20533,-0.085 -14.731,-6.3544 -32.278,-13.936 -17.547,-7.5816 -31.918,-13.79 -31.936,-13.79 z m 148.25,54.45 h -3.0338 l -0.13105,0.18577 c -0.0723,0.10206 -1.4118,2.3995 -2.9771,5.1051 -1.5652,2.7056 -2.846,4.9322 -2.846,4.9483 0,0.0163 4.0432,0.029 8.9847,0.029 4.9415,0 8.9847,-0.01 8.9847,-0.023 0,-0.0129 -1.264,-2.2097 -2.8082,-4.8808 -1.545,-2.6718 -2.8832,-4.972 -2.9737,-5.1111 l -0.16484,-0.25333 z"/>
                    </g>
                </svg>
                Strive Academics    
            </div>
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
                © 2024 Strive Academics. All rights reserved.<br>
                This email was sent to you because you applied to become a tutor with Strive Academics.
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
            Thank you for your interest in joining Strive Academics as a tutor! We're excited to review your application and learn more about your passion for education.
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

  return getBaseTemplate("Application Received - Strive Academics", content);
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

  return getBaseTemplate("New Tutor Application - Strive Academics", content);
};

// Approval Notification Template
const getApprovalNotificationTemplate = (tutorData, setupToken) => {
  const setupUrl = `${
    "https://striveacademics.com.au"
  }/tutor/setup-password/${setupToken}`;
  const tutorPortalUrl = `${
    "https://striveacademics.com.au"
  }/dashboard/tutor/profile`;

  const content = `
        <div class="greeting">Welcome to Strive Academics ✅</div>
        
        <div class="message">
            Dear ${tutorData.fullName},<br><br>
            I'm Pasindu Bandara, Founder and Managing Director of Strive Academics, and I'm thrilled to welcome you to our team.<br><br>
            We were incredibly impressed by your performance during the recruitment process, and we're excited for you to join us in our mission to help Australian students achieve their full potential.<br><br>
            Before you can begin tutoring, there are a few quick onboarding steps to complete.
        </div>
        
        <div class="highlight-box">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Step 1 – Official Welcome & Setup</h3>
            <p style="margin-bottom: 15px;">Click the button below for your official welcome and a guide to getting started.</p>
            <div style="text-align: center;">
                <a href="${setupUrl}" class="cta-button">Complete Your Setup</a>
            </div>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Step 2 – Complete Your Onboarding 🛹</h3>
            <p>Please log in to your <a href="${tutorPortalUrl}" style="color: #667eea; text-decoration: none;"><strong>tutor portal</strong></a> and complete the following within 5 days:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">Preferences & Admin Section</h4>
                <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Select the subjects and year levels you wish to tutor.</li>
                    <li>Submit your contract, WWCC, payment details, and other required information.</li>
                </ul>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">Build Your Tutor Profile</h4>
                <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>This is what parents/students see when choosing a tutor.</li>
                    <li>Tips for an excellent profile are included when filling out your profile.</li>
                    <li>If the "Submit for Review" button is greyed out, check that all required details (including age, gender, and availability) are complete.</li>
                    <li>Once submitted, our team will review your profile. If edits are required, you'll have 2 days to make changes and resubmit.</li>
                </ul>
            </div>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Step 3 – Join Our Slack Community 💬</h3>
            <p>You'll receive an email invite to join our Strive Academics Slack. This is our main communication hub, so please:</p>
            <ul style="padding-left: 20px; line-height: 1.8; margin-top: 10px;">
                <li>Download Slack on both your phone and computer.</li>
                <li>Enable notifications so you don't miss important updates.</li>
                <li>Introduce yourself in the #intros channel by sharing:</li>
            </ul>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0 10px 20px;">
                <ul style="padding-left: 20px; line-height: 1.8;">
                    <li>Whether you're a student (and what you study) or a teacher (and your experience)</li>
                    <li>Subjects and year levels you'll tutor</li>
                    <li>Any hobbies or unique skills</li>
                    <li>Something you'd like the team to know about you (e.g., approachable, bubbly, great with explaining concepts)</li>
                </ul>
            </div>
            <p><em>Active participation in Slack helps with student matching and is considered during Tier progression.</em></p>
        </div>
        
        <div class="message">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Step 4 – Technical Difficulties and Questions ⁉️</h3>
            <p>If you have any technical issues with your profile or the platform, message me directly on Slack (Pasindu Bandara).</p>
        </div>
        
        <div class="message">
            <p>Once again, congratulations and welcome to Strive Academics. We're looking forward to seeing the impact you'll make with your students.</p>
        </div>
        
        <div class="message">
            <p><strong>Kind regards,</strong><br>
            Pasindu Bandara<br>
            Founder, Managing Director @ Strive Academics</p>
        </div>
        
        <div class="message">
            <p style="font-size: 14px; color: #6c757d;">
                <strong>Setup Link:</strong> <a href="${setupUrl}">${setupUrl}</a>
            </p>
        </div>
    `;

  return getBaseTemplate(
    "Welcome to Strive Academics - Complete Your Onboarding",
    content
  );
};

// Rejection Notification Template
const getRejectionNotificationTemplate = (tutorData, reason = "") => {
  const content = `
        <div class="greeting">Hello ${tutorData.fullName}</div>
        
        <div class="message">
            Thank you for your interest in becoming a tutor with Strive Academics. 
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
            <p>We wish you the best in your future endeavors and thank you for considering Strive Academics.</p>
        </div>
    `;

  return getBaseTemplate("Strive Academics Application Update", content);
};

// Setup Reminder Template
const getSetupReminderTemplate = (tutorData, setupToken) => {
  const setupUrl = `${
    "https://striveacademics.com.au"
  }/tutor/setup-password/${setupToken}`;

  const content = `
        <div class="greeting">Hello ${tutorData.fullName}</div>
        
        <div class="message">
            This is a friendly reminder to complete your Strive Academics tutor account setup. 
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
    "Complete Your Strive Academics Setup - Reminder",
    content
  );
};

// Student requests tutor
function getTutorRequestNotificationTemplate(student, tutor) {
  return `
  <h2>New Tutor Request</h2>
  <p>Hello ${tutor.firstName},</p>
  <p>${student.firstName} ${student.lastName} has requested you as their tutor on <b>Strive Academy</b>.</p>
  
  <h3>Student Details</h3>
  <ul>
    <li><b>Name:</b> ${student.firstName} ${student.lastName}</li>
    <li><b>Email:</b> ${student.email}</li>
  </ul>

  <p>Please log in to your tutor dashboard to accept or reject the request.</p>
  <p><a href="${process.env.FRONTEND_URL}/tutor/requests" 
        style="background-color:#4CAF50;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">View Requests</a></p>
  
  <p>Best regards,<br/>Strive Academy Team</p>
  `;
}

module.exports = {
  getApplicationConfirmationTemplate,
  getAdminNotificationTemplate,
  getApprovalNotificationTemplate,
  getRejectionNotificationTemplate,
  getSetupReminderTemplate,
    getTutorRequestNotificationTemplate,
};
