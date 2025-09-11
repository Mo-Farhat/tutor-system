// Centralized export for all models
const userModel = require("./userModel");
const tutorApplicationModel = require("./tutorApplicationModel");
const tutorProfileModel = require("./tutorProfileModel");
const setupTokenModel = require("./setupTokenModel");

module.exports = {
  userModel,
  tutorApplicationModel,
  tutorProfileModel,
  setupTokenModel,
};
