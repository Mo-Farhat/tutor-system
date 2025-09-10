// Test script for email functionality
require("dotenv").config();
const emailService = require("./src/services/emailService");

async function testEmails() {
  console.log("🧪 Testing Email Service...\n");

  const testApplicationData = {
    applicationId: "TEST-001",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+61400000000",
    atar: 95.5,
    currentStudy: "Medicine at University of Melbourne",
    subjectsToTutor: "VCE Chemistry, VCE Physics, VCE Biology",
    motivation:
      "I want to help students achieve their academic goals and make a positive impact on their education.",
    createdAt: new Date().toLocaleString(),
  };

  const testTutorData = {
    fullName: "John Doe",
    email: "john.doe@example.com",
  };

  const testSetupToken = "test-token-123";

  try {
    // Test 1: Application Confirmation
    console.log("📧 Testing Application Confirmation...");
    const result1 = await emailService.sendApplicationConfirmation(
      testApplicationData.email,
      testApplicationData
    );
    console.log("✅ Result:", result1);

    // Test 2: Admin Notification
    console.log("\n📧 Testing Admin Notification...");
    const result2 = await emailService.sendAdminNotification(
      testApplicationData
    );
    console.log("✅ Result:", result2);

    // Test 3: Approval Notification
    console.log("\n📧 Testing Approval Notification...");
    const result3 = await emailService.sendApprovalNotification(
      testTutorData.email,
      testTutorData,
      testSetupToken
    );
    console.log("✅ Result:", result3);

    // Test 4: Rejection Notification
    console.log("\n📧 Testing Rejection Notification...");
    const result4 = await emailService.sendRejectionNotification(
      testTutorData.email,
      testTutorData,
      "We need more teaching experience for this position."
    );
    console.log("✅ Result:", result4);

    // Test 5: Setup Reminder
    console.log("\n📧 Testing Setup Reminder...");
    const result5 = await emailService.sendSetupReminder(
      testTutorData.email,
      testTutorData,
      testSetupToken
    );
    console.log("✅ Result:", result5);

    console.log("\n🎉 All email tests completed successfully!");
  } catch (error) {
    console.error("❌ Email test failed:", error);
  }
}

// Run the test
testEmails();
