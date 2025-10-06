// FILE: src/server.js
const app = require("./app");
const { scheduleWWCCReminders } = require("./jobs/wwccReminders");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email service: ${process.env.NODE_ENV === "production" ? "Enabled" : "Development mode"}`);
  // Start cron
  try { scheduleWWCCReminders(); } catch (e) { console.error("Cron init error:", e); }
});
