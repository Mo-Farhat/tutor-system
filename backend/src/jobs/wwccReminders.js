const cron = require("node-cron");
const { tutorDocumentModel, tutorProfileModel, userModel } = require("../models");
const emailService = require("../services/emailService");
const notificationService = require("../services/notificationService");

async function sendReminders() {
  try {
    // naive approach: fetch all tutor profiles w/ documents_uploaded
    const profiles = await tutorProfileModel.findAll({ where: { documents_uploaded: true } });
    for (const p of profiles) {
      const wwcc = await tutorDocumentModel.getLatestWWCC(p.userId);
      if (!wwcc || !wwcc.expiresAt) continue;
      const days = Math.ceil((new Date(wwcc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
      if (days === 30 || days === 14 || days === 7 || days === 1) {
        const u = p.user || (await userModel.findById(p.userId));
        if (u?.email) {
          await emailService.sendEmail(
            u.email,
            "WWCC Expiry Reminder",
            `<p>Hi ${u.firstName}, your WWCC expires in ${days} day(s). Please upload a renewed WWCC.</p>`
          );
          
          // Create notification for tutor
          await notificationService.createNotification(
            u.id,
            "wwcc_expiry",
            "WWCC Expiring Soon",
            `Your Working with Children Check expires in ${days} day(s). Please upload a renewed WWCC to continue tutoring.`,
            "high",
            `/dashboard/tutor/documents`,
            { expiresAt: wwcc.expiresAt, daysRemaining: days }
          );
          
          // Create notification for admin user (hardcoded admin@striveacademy.com)
          try {
            const adminUser = await userModel.findByEmail("admin@striveacademy.com");
            if (adminUser) {
              await notificationService.createNotification(
                adminUser.id,
                "compliance_alert",
                `WWCC Expiring - ${u.firstName} ${u.lastName}`,
                `Tutor ${u.firstName} ${u.lastName}'s WWCC expires in ${days} day(s). Follow up required.`,
                "high",
                `/dashboard/admin/tutors/${u.id}`,
                { tutorId: u.id, expiresAt: wwcc.expiresAt, daysRemaining: days }
              );
              console.log(`✅ Created WWCC compliance alert for admin - ${u.firstName} ${u.lastName} (${days} days)`);
            } else {
              console.warn(`⚠️ Admin user not found with email: admin@striveacademy.com`);
            }
          } catch (error) {
            console.error("Error creating admin WWCC notification:", error);
          }
        }
      }
    }
  } catch (e) {
    console.error("WWCC reminder job error:", e);
  }
}

// Every day at 09:00 server time
function scheduleWWCCReminders() {
  cron.schedule("0 9 * * *", sendReminders, { timezone: "Australia/Sydney" });
}

module.exports = { scheduleWWCCReminders };
