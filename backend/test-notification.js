// Test script to create a notification for existing application
const { userModel, tutorApplicationModel } = require("./src/models");
const notificationService = require("./src/services/notificationService");

async function createTestNotification() {
  try {
    // Get the application
    const application = await tutorApplicationModel.findById(39);
    if (!application) {
      console.error("Application not found");
      return;
    }

    console.log("Application found:", {
      id: application.id,
      fullName: application.fullName,
      email: application.email,
      atar: application.atar,
    });

    // Get admin user
    const adminUser = await userModel.findByEmail("admin@striveacademy.com");
    if (!adminUser) {
      console.error("❌ Admin user not found with email: admin@striveacademy.com");
      console.log("Creating admin user...");
      
      // Create admin if doesn't exist
      const authService = require("./src/services/authService");
      const { generateUniqueUsername } = require("./src/services/usernameService");
      
      const hashedPassword = await authService.hashPassword("admin123");
      const username = await generateUniqueUsername("admin");
      
      const newAdmin = await userModel.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@striveacademy.com",
        username,
        password: hashedPassword,
        role: "admin",
        status: "active",
      });
      
      console.log("✅ Admin user created:", newAdmin.id);
      
      // Create notification for new admin
      await notificationService.createNotification(
        newAdmin.id,
        "new_application",
        `New Tutor Application - ${application.fullName}`,
        `${application.fullName} has submitted a tutor application. ATAR: ${application.atar}`,
        "high",
        `/dashboard/admin/applications/${application.id}`,
        { applicationId: application.id }
      );
      
      console.log("✅ Test notification created for admin!");
      return;
    }

    console.log("Admin user found:", {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create notification
    const notification = await notificationService.createNotification(
      adminUser.id,
      "new_application",
      `New Tutor Application - ${application.fullName}`,
      `${application.fullName} has submitted a tutor application. ATAR: ${application.atar}`,
      "high",
      `/dashboard/admin/applications/${application.id}`,
      { applicationId: application.id }
    );

    console.log("✅ Test notification created successfully!");
    console.log("Notification:", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      read: notification.read,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating test notification:", error);
    process.exit(1);
  }
}

createTestNotification();
