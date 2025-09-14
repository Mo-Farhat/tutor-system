// Centralized export for all models
const userModel = require("./userModel");
const tutorApplicationModel = require("./tutorApplicationModel");
const tutorProfileModel = require("./tutorProfileModel");
const studentProfileModel = require("./studentProfileModel");
const setupTokenModel = require("./setupTokenModel");

module.exports = {
  userModel,
  tutorApplicationModel,
  tutorProfileModel,
  studentProfileModel,
  setupTokenModel,
};
