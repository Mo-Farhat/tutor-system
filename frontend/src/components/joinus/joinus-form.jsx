import React, { useState } from "react";

import tutorService from "../../services/tutorService";
import VideoRecorder from "../VideoRecorder";

import authService from "../../services/authService";

import "../../css/joinus/joinus-form.css";

function JoinusForm({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    phone: "",
    email: "",

    // Education Background
    currentStudy: "",
    year12State: "",
    year12CompletionYear: "",
    currentState: "",
    atar: "",

    // Availability & Commitment
    canCommit3Hours: "yes",
    canCommit1Year: "yes",
    canTutorMostWeeks: "yes",
    canTutorGroups: "yes",

    // Tutoring Subjects & Qualifications
    subjectsToTutor: "",
    hasWorkingWithChildrenCheck: "no",

    // Motivation
    motivation: "",

    // Video Submission
    videoSubmission: null,

    // Document Upload
    resume: null,
  });

  const [errors, setErrors] = useState({});
  const [showTerminationMessage, setShowTerminationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State options for dropdown
  const australianStates = [
    "Australian Capital Territory",
    "New South Wales",
    "Northern Territory",
    "Queensland",
    "South Australia",
    "Tasmania",
    "Victoria",
    "Western Australia",
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? "yes" : "no",
      }));
    } else if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear termination message if changing any disqualifying fields
    if (
      name === "atar" ||
      name === "canCommit3Hours" ||
      name === "canCommit1Year" ||
      name === "canTutorMostWeeks" ||
      name === "canTutorGroups"
    ) {
      setShowTerminationMessage("");
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleVideoReady = (videoBlob) => {
    setFormData((prev) => ({
      ...prev,
      videoSubmission: videoBlob,
    }));

    // Clear any video-related errors
    if (errors.videoSubmission) {
      setErrors((prev) => ({
        ...prev,
        videoSubmission: "",
      }));
    }
  };

  const handleVideoError = (error) => {
    console.error("Video recording error:", error);
    setErrors((prev) => ({
      ...prev,
      videoSubmission: "Failed to record video. Please try again.",
    }));
  };

  // Validate the current step
  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 1: // Personal Information
        if (!formData.fullName.trim()) {
          stepErrors.fullName = "Full name is required";
          isValid = false;
        } else {
          const nameParts = formData.fullName
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          if (nameParts.length < 2) {
            stepErrors.fullName = "Please provide both first and last name";
            isValid = false;
          }
        }

        if (!formData.phone.trim()) {
          stepErrors.phone = "Phone number is required";
          isValid = false;
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
          stepErrors.phone = "Please enter a valid 10-digit phone number";
          isValid = false;
        }

        if (!formData.email.trim()) {
          stepErrors.email = "Email is required";
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          stepErrors.email = "Email is invalid";
          isValid = false;
        }
        break;

      case 2: // Education Background
        if (!formData.currentStudy.trim()) {
          stepErrors.currentStudy =
            "Please tell us what you are currently studying";
          isValid = false;
        }

        if (!formData.year12State) {
          stepErrors.year12State = "Please select where you completed Year 12";
          isValid = false;
        }

        if (!formData.year12CompletionYear) {
          stepErrors.year12CompletionYear =
            "Please select when you completed Year 12";
          isValid = false;
        }

        if (!formData.currentState) {
          stepErrors.currentState = "Please select your current state";
          isValid = false;
        }

        if (!formData.atar.trim()) {
          stepErrors.atar = "ATAR is required";
          isValid = false;
        } else if (isNaN(formData.atar)) {
          stepErrors.atar = "Please enter a valid number";
          isValid = false;
        }
        break;

      case 3: // Availability & Commitment
        if (formData.canCommit3Hours !== "yes") {
          setShowTerminationMessage(
            "Unfortunately, we require a minimum commitment of 3 hours per week. Thank you for your interest."
          );
          isValid = false;
        }

        if (formData.canCommit1Year !== "yes") {
          setShowTerminationMessage(
            "Unfortunately, we require a commitment of at least one year. Thank you for your interest."
          );
          isValid = false;
        }

        if (formData.canTutorMostWeeks !== "yes") {
          setShowTerminationMessage(
            "Unfortunately, we require tutors to be available for most weeks of the school year. Thank you for your interest."
          );
          isValid = false;
        }

        if (formData.canTutorGroups !== "yes") {
          setShowTerminationMessage(
            "Unfortunately, we require tutors to be open to both 1-on-1 and small group sessions. Thank you for your interest."
          );
          isValid = false;
        }
        break;

      case 4: // Tutoring Subjects & Qualifications
        if (!formData.subjectsToTutor.trim()) {
          stepErrors.subjectsToTutor =
            "Please tell us which subjects you would like to tutor";
          isValid = false;
        }
        break;

      case 5: // Motivation & Teaching Approach
        if (!formData.motivation.trim()) {
          stepErrors.motivation =
            "Please tell us why you would like to become part of the Strive Academics team";
          isValid = false;
        }
        break;

      case 6: // Video Submission
        if (!formData.videoSubmission) {
          stepErrors.videoSubmission = "Please record your video submission";
          isValid = false;
        }
        break;

      case 7: // Document Upload
        if (!formData.resume) {
          stepErrors.resume = "Please upload your resume";
          isValid = false;
        }
        break;

      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  // Handle next button
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous button
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps before submitting (ensures required fields like full name are present)
    const stepsToValidate = [1, 2, 3, 4, 5, 6, 7];
    let firstInvalidStep = null;
    for (const step of stepsToValidate) {
      const valid = validateStep(step);
      if (!valid && firstInvalidStep === null) {
        firstInvalidStep = step;
      }
    }
    if (firstInvalidStep !== null) {
      setCurrentStep(firstInvalidStep);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Form data being submitted:", formData);
      const response = await authService.submitTutorApplication(formData);
      console.log("Response received:", response);

      // Show success message
      alert(
        `${response.message}\n\nApplication ID: ${response.applicationId}\nStatus: ${response.status}`
      );

      // Reset form and close modal
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        currentStudy: "",
        year12State: "",
        year12CompletionYear: "",
        currentState: "",
        atar: "",
        canCommit3Hours: "yes",
        canCommit1Year: "yes",
        canTutorMostWeeks: "yes",
        canTutorGroups: "yes",
        subjectsToTutor: "",
        hasWorkingWithChildrenCheck: "no",
        motivation: "",
        videoSubmission: null,
        resume: null,
      });
      setCurrentStep(1);
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Application submission failed:", error);
      alert(`Application submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there's a termination message, show it instead of the form
  if (showTerminationMessage) {
    return (
      <div className={`joinus-form-overlay ${isOpen ? "active" : ""}`}>
        <div className="joinus-form-container">
          <div className="joinus-form-header">
            <h2>Tutor Application</h2>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="joinus-form-termination">
            <p>{showTerminationMessage}</p>
            <button className="btn btn-primary mt-3" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`joinus-form-overlay ${isOpen ? "active" : ""}`}>
      <div className="joinus-form-container">
        <div className="joinus-form-header">
          <h2>Tutor Application</h2>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        <div className="joinus-form-progress mb-4">
          <div className="joinus-form-steps">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div
                key={step}
                className={`joinus-form-step-indicator ${
                  currentStep === step ? "active" : ""
                } ${currentStep > step ? "completed" : ""}`}
              >
                <div className="step-number">
                  {currentStep > step ? "✓" : step}
                </div>
                <div className="step-label">
                  {step === 1 && "Personal"}
                  {step === 2 && "Education"}
                  {step === 3 && "Availability"}
                  {step === 4 && "Subjects"}
                  {step === 5 && "Motivation"}
                  {step === 6 && "Video"}
                  {step === 7 && "Resume"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="joinus-form-content">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="joinus-form-step">
              <h3 className="mb-4">Personal Information</h3>

              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  What is your full name? (First and last name)
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.fullName ? "is-invalid" : ""
                  }`}
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  What is your phone number? (10-digit number)
                </label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  id="phone"
                  name="phone"
                  placeholder="e.g., 0400123456"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  What is your email address?
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Education Background */}
          {currentStep === 2 && (
            <div className="joinus-form-step">
              <h3 className="mb-4">Education Background</h3>

              <div className="mb-3">
                <label htmlFor="currentStudy" className="form-label">
                  What are you currently studying at university?
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.currentStudy ? "is-invalid" : ""
                  }`}
                  id="currentStudy"
                  name="currentStudy"
                  value={formData.currentStudy}
                  onChange={handleChange}
                />
                {errors.currentStudy && (
                  <div className="invalid-feedback">{errors.currentStudy}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="year12State" className="form-label">
                  In which state did you complete Year 12?
                </label>
                <select
                  className={`form-select ${
                    errors.year12State ? "is-invalid" : ""
                  }`}
                  id="year12State"
                  name="year12State"
                  value={formData.year12State}
                  onChange={handleChange}
                >
                  <option value="">Select state</option>
                  {australianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.year12State && (
                  <div className="invalid-feedback">{errors.year12State}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="year12CompletionYear" className="form-label">
                  What year did you complete Year 12?
                </label>
                <select
                  className={`form-select ${
                    errors.year12CompletionYear ? "is-invalid" : ""
                  }`}
                  id="year12CompletionYear"
                  name="year12CompletionYear"
                  value={formData.year12CompletionYear}
                  onChange={handleChange}
                >
                  <option value="">Select year</option>
                  {Array.from(
                    { length: 20 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year12CompletionYear && (
                  <div className="invalid-feedback">
                    {errors.year12CompletionYear}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="currentState" className="form-label">
                  Which state do you currently live in?
                </label>
                <select
                  className={`form-select ${
                    errors.currentState ? "is-invalid" : ""
                  }`}
                  id="currentState"
                  name="currentState"
                  value={formData.currentState}
                  onChange={handleChange}
                >
                  <option value="">Select state</option>
                  {australianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.currentState && (
                  <div className="invalid-feedback">{errors.currentState}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="atar" className="form-label">
                  What was your ATAR? (Must be 97 or above to proceed)
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.atar ? "is-invalid" : ""}`}
                  id="atar"
                  name="atar"
                  value={formData.atar}
                  onChange={handleChange}
                />
                {errors.atar && (
                  <div className="invalid-feedback">{errors.atar}</div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Availability & Commitment */}
          {currentStep === 3 && (
            <div className="joinus-form-step">
              <h3 className="mb-4">Availability & Commitment</h3>

              <div className="mb-3">
                <label className="form-label d-block">
                  Are you able to commit at least 3 hours to tutoring each week?
                </label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canCommit3HoursYes"
                    name="canCommit3Hours"
                    value="yes"
                    checked={formData.canCommit3Hours === "yes"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canCommit3HoursYes"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canCommit3HoursNo"
                    name="canCommit3Hours"
                    value="no"
                    checked={formData.canCommit3Hours === "no"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canCommit3HoursNo"
                  >
                    No
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">
                  Will you commit to tutoring at Strive Academics for at least
                  the next year?
                </label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canCommit1YearYes"
                    name="canCommit1Year"
                    value="yes"
                    checked={formData.canCommit1Year === "yes"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canCommit1YearYes"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canCommit1YearNo"
                    name="canCommit1Year"
                    value="no"
                    checked={formData.canCommit1Year === "no"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canCommit1YearNo"
                  >
                    No
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">
                  Are you able to tutor for most weeks of the school year?
                </label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canTutorMostWeeksYes"
                    name="canTutorMostWeeks"
                    value="yes"
                    checked={formData.canTutorMostWeeks === "yes"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canTutorMostWeeksYes"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canTutorMostWeeksNo"
                    name="canTutorMostWeeks"
                    value="no"
                    checked={formData.canTutorMostWeeks === "no"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canTutorMostWeeksNo"
                  >
                    No
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">
                  Are you happy to tutor in 1-on-1 sessions as well as in small
                  groups of up to 4 students?
                </label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canTutorGroupsYes"
                    name="canTutorGroups"
                    value="yes"
                    checked={formData.canTutorGroups === "yes"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canTutorGroupsYes"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="canTutorGroupsNo"
                    name="canTutorGroups"
                    value="no"
                    checked={formData.canTutorGroups === "no"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="canTutorGroupsNo"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Tutoring Subjects & Qualifications */}
          {currentStep === 4 && (
            <div className="joinus-form-step">
              <h3 className="mb-4">Tutoring Subjects & Qualifications</h3>

              <div className="mb-3">
                <label htmlFor="subjectsToTutor" className="form-label">
                  What subjects would you like to tutor?
                </label>
                <textarea
                  className={`form-control ${
                    errors.subjectsToTutor ? "is-invalid" : ""
                  }`}
                  id="subjectsToTutor"
                  name="subjectsToTutor"
                  rows="4"
                  value={formData.subjectsToTutor}
                  onChange={handleChange}
                ></textarea>
                {errors.subjectsToTutor && (
                  <div className="invalid-feedback">
                    {errors.subjectsToTutor}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label d-block">
                  Do you have a current and valid Employee Working with
                  Children's Check?
                </label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="hasWorkingWithChildrenCheckYes"
                    name="hasWorkingWithChildrenCheck"
                    value="yes"
                    checked={formData.hasWorkingWithChildrenCheck === "yes"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="hasWorkingWithChildrenCheckYes"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="hasWorkingWithChildrenCheckNo"
                    name="hasWorkingWithChildrenCheck"
                    value="no"
                    checked={formData.hasWorkingWithChildrenCheck === "no"}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="hasWorkingWithChildrenCheckNo"
                  >
                    No
                  </label>
                </div>

                {formData.hasWorkingWithChildrenCheck === "no" && (
                  <div className="alert alert-warning mt-2">
                    Please note, a valid Employee Working with Children's Check
                    is required to work with Strive Academics. If you do not
                    currently have one, we encourage you to apply for it as soon
                    as possible and provide us with confirmation of your
                    application. You may continue with your application for now.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Motivation & Teaching Approach */}
          {currentStep === 5 && (
            <div className="joinus-form-step">
              <h3 className="mb-4">Motivation & Teaching Approach</h3>

              <div className="mb-3">
                <label htmlFor="motivation" className="form-label">
                  Briefly, why would you like to become part of the Strive
                  Academics team?
                </label>
                <textarea
                  className={`form-control ${
                    errors.motivation ? "is-invalid" : ""
                  }`}
                  id="motivation"
                  name="motivation"
                  rows="4"
                  value={formData.motivation}
                  onChange={handleChange}
                ></textarea>
                {errors.motivation && (
                  <div className="invalid-feedback">{errors.motivation}</div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Video Submission */}
          {currentStep === 6 && (
            <div className="joinus-form-step">
              <h3 className="mb-4">Video Submission</h3>

              <div className="mb-4">
                <h5>
                  🎥 Please record a 1-2 minute video answering the following:
                </h5>
                <ol>
                  <li className="mb-2">
                    Tell us a bit about yourself and your tutoring style (keep
                    it casual - you don't need a script)
                  </li>
                  <li className="mb-2">
                    Explain why you would make an excellent tutor for Strive
                    Academics, highlighting any relevant skills, experiences, or
                    passion that set you apart from others
                  </li>
                  <li className="mb-2">
                    Explain a challenging concept from one of the subjects you
                    would like to tutor in a way that a student with no prior
                    knowledge could understand
                  </li>
                </ol>
                <p className="text-muted">
                  This video helps us assess your communication skills, ability
                  to simplify complex ideas, and overall enthusiasm for
                  tutoring.
                </p>
              </div>

              <div className="mb-3">
                <VideoRecorder
                  onVideoReady={handleVideoReady}
                  onError={handleVideoError}
                  className={errors.videoSubmission ? "is-invalid" : ""}
                />
                {errors.videoSubmission && (
                  <div className="invalid-feedback">
                    {errors.videoSubmission}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 7: Document Upload */}
          {currentStep === 7 && (
            <div className="joinus-form-step">
              <h3 className="mb-4">Document Upload</h3>

              <div className="mb-3">
                <label htmlFor="resume" className="form-label">
                  Please upload your resume
                </label>
                <input
                  type="file"
                  className={`form-control ${
                    errors.resume ? "is-invalid" : ""
                  }`}
                  id="resume"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleChange}
                />
                {errors.resume && (
                  <div className="invalid-feedback">{errors.resume}</div>
                )}
                <div className="form-text">
                  Accepted formats: PDF, DOC, DOCX
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <strong>Final Step:</strong> Please review all your information
                before submitting. Once submitted, we will review your
                application and contact you regarding the next steps.
              </div>
            </div>
          )}

          <div className="joinus-form-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinusForm;
