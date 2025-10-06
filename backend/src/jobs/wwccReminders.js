// FILE: src/jobs/wwccReminders.js
const cron = require("node-cron");
const { tutorDocumentModel, tutorProfileModel, userModel } = require("../models");
const emailService = require("../services/emailService");

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
