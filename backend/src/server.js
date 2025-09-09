const app = require("./app");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `📧 Email service: ${
      process.env.NODE_ENV === "production" ? "Enabled" : "Development mode"
    }`
  );
});
