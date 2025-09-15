const { userModel } = require("../models");

async function generateUniqueUsername(base) {
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 20) || "user";
  for (let i = 0; i < 5; i++) {
    const candidate = `${clean}${Math.floor(Math.random() * 10000)}`;
    const exists = await userModel.findByUsername(candidate);
    if (!exists) return candidate;
  }
  return `${clean}-${Date.now()}`;
}

module.exports = { generateUniqueUsername };
