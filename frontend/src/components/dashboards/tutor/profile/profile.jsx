import "../../../../css/dashboards/tutor/profile/profile.css";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import profileService from "../../../../services/profileService";
import authService from "../../../../services/authService";

function TutorProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completionStatus, setCompletionStatus] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phoneNumber: "",
    bio: "",
    hourly_rate: "",
    university: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    abnNumber: "",
    paymentMethod: "bank",
    accountName: "",
    bsb: "",
    accountNumber: "",
  });

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [subjectEntries, setSubjectEntries] = useState([]);
  const [schools, setSchools] = useState([]);
  const [currentStudies, setCurrentStudies] = useState([]);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [introVideo, setIntroVideo] = useState(null);
  const [tutorContractFile, setTutorContractFile] = useState(null);
  const [wwccFile, setWwccFile] = useState(null);
  const [wwccExpiry, setWwccExpiry] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      setError(''); // Clear any previous errors
      
      const username = user?.username || 'notmanu23'; // Use logged in user or fallback to existing user
      console.log('Fetching profile for username:', username);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/profile/?username=${username}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      if (data.success) {
        setProfileData(data.data);

        // Update form data with real user data
        const userData = data.data.user;
        const newFormData = {
          fullName: `${userData.first_name || ""} ${
            userData.last_name || ""
          }`.trim(),
          email: userData.email || "",
          username: userData.username || "",
          phoneNumber: data.data.phone_number || "",
          bio: data.data.bio || "",
          hourly_rate: data.data.hourly_rate || "",
          university: data.data.university || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          abnNumber: "",
          paymentMethod: "bank",
          accountName: "",
          bsb: "",
          accountNumber: "",
        };

        console.log("Setting form data:", newFormData);
        console.log("Phone number from API:", data.data.phone_number);
        setFormData(newFormData);

        // Set locations
        setSelectedLocations(
          data.data.preferred_locations || data.data.locations || []
        );

        // Set subjects
        const subjects =
          data.data.subjects_selected || data.data.subjects || [];
        setSubjectEntries(
          subjects.map((subject) => ({
            yearLevel: subject.year_level || "",
            curriculumOrState: subject.curriculum || "",
            subject: subject.subject || "",
          }))
        );

        // Set current studies
        setCurrentStudies(data.data.current_studies || []);
        // Set schools
        setSchools(data.data.schools_attended || []);

        // Fetch completion status

        const completionResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/completion-status/?username=${username}`);

        const completionData = await completionResponse.json();

        if (completionData.success) {
          setCompletionStatus(completionData.data);
        } else {
          console.error(
            "Failed to fetch completion status:",
            completionData.message
          );
        }
      } else {
        console.error("API Error:", data.message);
        setError(`Failed to load profile data: ${data.message}`);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError(`Failed to load profile data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear password errors when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleLocationSelect = (e) => {
    const value = e.target.value;
    if (value && !selectedLocations.includes(value)) {
      setSelectedLocations([...selectedLocations, value]);
    }
  };

  const removeLocation = (location) => {
    setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
  };

  const addSubjectEntry = () => {
    setSubjectEntries([
      ...subjectEntries,
      { yearLevel: "", curriculumOrState: "", subject: "" },
    ]);
  };

  const removeSubjectEntry = (index) => {
    setSubjectEntries(subjectEntries.filter((_, i) => i !== index));
  };

  const updateSubjectEntry = (index, field, value) => {
    const updatedEntries = [...subjectEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setSubjectEntries(updatedEntries);
  };

  const addSchool = () => {
    setSchools([...schools, ""]);
  };

  const removeSchool = (index) => {
    setSchools(schools.filter((_, i) => i !== index));
  };

  const updateSchool = (index, value) => {
    const updatedSchools = [...schools];
    updatedSchools[index] = value;
    setSchools(updatedSchools);
  };

  const addCurrentStudy = () => {
    setCurrentStudies([...currentStudies, ""]);
  };

  const removeCurrentStudy = (index) => {
    setCurrentStudies(currentStudies.filter((_, i) => i !== index));
  };

  const updateCurrentStudy = (index, value) => {
    const updatedStudies = [...currentStudies];
    updatedStudies[index] = value;
    setCurrentStudies(updatedStudies);
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      switch (type) {
        case "introVideo":
          setIntroVideo(file);
          break;
        case "tutorContract":
          setTutorContractFile(file);
          break;
        case "wwcc":
          setWwccFile(file);
          break;
        default:
          break;
      }
    }
  };

  const removeIntroVideo = () => {
    setIntroVideo(null);
  };

  const removeTutorContract = () => {
    setTutorContractFile(null);
  };

  const removeWWCC = () => {
    setWwccFile(null);
  };

  const handlePasswordChange = async () => {
    const errors = {};

    // Trim whitespace from passwords to avoid issues with copy/paste
    const currentPassword = formData.currentPassword.trim();
    const newPassword = formData.newPassword.trim();
    const confirmPassword = formData.confirmPassword.trim();


    // Validation
    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordErrors({});

      const result = await authService.changeTutorPassword(
        currentPassword,
        newPassword
      );

      if (result.success) {
        alert("Password updated successfully!");
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        setPasswordErrors({ general: result.error || "Failed to update password" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordErrors({ general: "An error occurred while changing password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const username = user?.username || "notmanu23"; // Use logged in user or fallback to existing user

      // Check if all required fields are filled
      const isComplete =
        formData.bio &&
        formData.hourly_rate &&
        formData.university &&
        formData.phoneNumber &&
        currentStudies.length > 0 &&
        selectedLocations.length > 0 &&
        subjectEntries.length > 0;

      // Upload required documents first if provided
      try {
        if (tutorContractFile || wwccFile || wwccExpiry) {
          await profileService.uploadDocuments(
            tutorContractFile,
            wwccFile,
            wwccExpiry
          );
        }
      } catch (uploadErr) {
        console.error("Error uploading documents:", uploadErr);
        // Continue to save other profile fields even if docs upload fails
      }

      // Prepare the update data
      const updateData = {
        bio: formData.bio,
        hourly_rate: parseFloat(formData.hourly_rate) || 45.0,
        university: currentStudies[0] || "",
        current_studies: currentStudies,
        locations: selectedLocations,
        subjects: subjectEntries.map((entry) => ({
          year_level: entry.yearLevel,
          curriculum: entry.curriculumOrState,
          subject: entry.subject,
        })),
        schools_attended: schools,
        preferred_locations: selectedLocations,
        subjects_selected: subjectEntries.map((entry) => ({
          year_level: entry.yearLevel,
          curriculum: entry.curriculumOrState,
          subject: entry.subject,
        })),
        phone_number: formData.phoneNumber,
        is_profile_complete: isComplete,
      };


      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/profile/?username=${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });


      const data = await response.json();

      if (data.success) {
        alert("Profile updated successfully!");
        // Reset local doc state after successful upload/save
        setTutorContractFile(null);
        setWwccFile(null);
        // Refresh the data including completion status
        fetchProfileData();
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tutor-profile-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="tutor-profile-content">
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading profile data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-profile-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="tutor-profile-content">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
                <button className="btn btn-primary" onClick={fetchProfileData}>
                  Retry Loading Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-profile-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="tutor-profile-content">
              {/* Page Title */}
              <h1 className="tutor-profile-title">Account Management</h1>

              {/* Profile Completion Status */}
              {completionStatus && (
                <div className="tutor-profile-section">
                  <div className="tutor-profile-card">
                    <div className="tutor-profile-card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h3 className="mb-2">Profile Completion Status</h3>
                          <p className="text-muted mb-0">
                            Complete your profile to access all dashboard
                            features
                          </p>
                        </div>
                        <div className="text-end">
                          <div className="completion-badge">
                            {completionStatus.fully_complete ? (
                              <span className="badge bg-success fs-6">
                                <i className="fas fa-check-circle me-2"></i>
                                Profile Complete
                              </span>
                            ) : (
                              <span className="badge bg-warning fs-6">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                Profile Incomplete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Show missing items if incomplete */}
                      {!completionStatus.fully_complete &&
                        completionStatus.missing_items.length > 0 && (
                          <div className="mt-3">
                            <h6 className="text-danger mb-2">Missing Items:</h6>
                            <ul className="list-unstyled">
                              {completionStatus.missing_items.map(
                                (item, index) => (
                                  <li key={index} className="text-danger mb-1">
                                    <i className="fas fa-times me-2"></i>
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Summary Section */}
              <div className="tutor-profile-section">
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="tutor-profile-summary">
                        <div className="tutor-profile-avatar">
                          <div className="tutor-profile-avatar-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                          <label
                            htmlFor="profile-upload"
                            className="tutor-profile-avatar-upload"
                          >
                            <i className="fas fa-camera"></i>
                            <input
                              type="file"
                              id="profile-upload"
                              className="d-none"
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <div className="tutor-profile-info">
                          <h2>
                            {formData.fullName ||
                              profileData?.user?.username ||
                              "Tutor"}
                          </h2>
                          <div className="tutor-profile-badges">
                            <span className="tutor-profile-badge-gold">
                              Gold ({profileData?.rating || "0.00"}/5)
                            </span>
                            <span className="tutor-profile-badge-atr">
                              ATR ({profileData?.atar || "96.45"})
                            </span>
                          </div>
                          <div className="tutor-profile-meta">
                            <span className="tutor-profile-location">
                              <i className="fas fa-map-marker-alt"></i>{" "}
                              {profileData?.preferred_locations?.[0] ||
                                profileData?.locations?.[0] ||
                                "Location not specified"}
                            </span>
                            <span className="tutor-profile-joined">
                              <i className="fas fa-calendar-alt"></i> Joined{" "}
                              {profileData?.approved_at
                                ? new Date(
                                    profileData.approved_at
                                  ).toLocaleDateString()
                                : "Recently"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-dark tutor-profile-edit-btn">
                        <i className="fas fa-pencil-alt me-2"></i> Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">
                  Personal Information
                </h2>
                <p className="tutor-profile-section-description">
                  Update your personal information and contact details.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="fullName" className="form-label">
                            Full Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="username" className="form-label">
                            Username
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="phoneNumber" className="form-label">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="hourly_rate" className="form-label">
                            Hourly Rate ($)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="hourly_rate"
                            name="hourly_rate"
                            value={formData.hourly_rate}
                            onChange={handleInputChange}
                            placeholder="45.00"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="university" className="form-label">
                            University/Institution
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="university"
                            name="university"
                            value={formData.university}
                            onChange={handleInputChange}
                            placeholder="e.g., University of Melbourne"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="bio" className="form-label">
                        Bio
                      </label>
                      <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself and your teaching experience..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">Education</h2>
                <p className="tutor-profile-section-description">
                  Add your educational background and qualifications.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="mb-3">
                      <label className="form-label">Current Studies</label>
                      {currentStudies.map((study, index) => (
                        <div key={index} className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control"
                            value={study}
                            onChange={(e) =>
                              updateCurrentStudy(index, e.target.value)
                            }
                            placeholder="e.g., Bachelor of Science - Mathematics"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeCurrentStudy(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={addCurrentStudy}
                      >
                        <i className="fas fa-plus me-2"></i>Add Current Study
                      </button>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Schools Attended</label>
                      {schools.map((school, index) => (
                        <div key={index} className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control"
                            value={school}
                            onChange={(e) =>
                              updateSchool(index, e.target.value)
                            }
                            placeholder="e.g., Melbourne High School"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeSchool(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={addSchool}
                      >
                        <i className="fas fa-plus me-2"></i>Add School
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tutoring Subjects Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">
                  Tutoring Subjects
                </h2>
                <p className="tutor-profile-section-description">
                  Specify the subjects you can tutor and your expertise levels.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    {subjectEntries.map((entry, index) => (
                      <div key={index} className="row mb-3">
                        <div className="col-md-4">
                          <label className="form-label">Year Level</label>
                          <select
                            className="form-select"
                            value={entry.yearLevel}
                            onChange={(e) =>
                              updateSubjectEntry(
                                index,
                                "yearLevel",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Year Level</option>
                            <option value="Year 1-10">Year 1-10</option>
                            <option value="Year 11/12">Year 11/12</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Curriculum/State</label>
                          <select
                            className="form-select"
                            value={entry.curriculumOrState}
                            onChange={(e) =>
                              updateSubjectEntry(
                                index,
                                "curriculumOrState",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Curriculum</option>
                            <option value="VCE">VCE</option>
                            <option value="HSC">HSC</option>
                            <option value="QLD">QLD</option>
                            <option value="WA">WA</option>
                            <option value="SA">SA</option>
                            <option value="TAS">TAS</option>
                            <option value="NT">NT</option>
                            <option value="ACT">ACT</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Subject</label>
                          <input
                            type="text"
                            className="form-control"
                            value={entry.subject}
                            onChange={(e) =>
                              updateSubjectEntry(
                                index,
                                "subject",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Mathematics"
                          />
                        </div>
                        <div className="col-md-1 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeSubjectEntry(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={addSubjectEntry}
                    >
                      <i className="fas fa-plus me-2"></i>Add Subject
                    </button>
                  </div>
                </div>
              </div>

              {/* Locations Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">
                  Preferred Locations
                </h2>
                <p className="tutor-profile-section-description">
                  Add locations where you're willing to tutor.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="mb-3">
                      <label htmlFor="locationSelect" className="form-label">
                        Add Location
                      </label>
                      <div className="input-group">
                        <select
                          className="form-select"
                          id="locationSelect"
                          onChange={handleLocationSelect}
                        >
                          <option value="">Select a location</option>
                          <option value="Melbourne CBD">Melbourne CBD</option>
                          <option value="South Yarra">South Yarra</option>
                          <option value="St Kilda">St Kilda</option>
                          <option value="Brunswick">Brunswick</option>
                          <option value="Fitzroy">Fitzroy</option>
                          <option value="Online">Online</option>
                        </select>
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Selected Locations</label>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedLocations.map((location, index) => (
                          <span
                            key={index}
                            className="badge bg-primary d-flex align-items-center"
                          >
                            {location}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              onClick={() => removeLocation(location)}
                            ></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">Change Password</h2>
                <p className="tutor-profile-section-description">
                  Update your account password for security.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label
                            htmlFor="currentPassword"
                            className="form-label"
                          >
                            Current Password
                          </label>
                          <div className="input-group">
                            <input
                              type={
                                showPasswords.currentPassword
                                  ? "text"
                                  : "password"
                              }
                              className={`form-control ${
                                passwordErrors.currentPassword ? "is-invalid" : ""
                              }`}
                              id="currentPassword"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  currentPassword: !prev.currentPassword,
                                }))
                              }
                            >
                              <i
                                className={`fas fa-${
                                  showPasswords.currentPassword
                                    ? "eye-slash"
                                    : "eye"
                                }`}
                              ></i>
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <div className="invalid-feedback d-block">
                              {passwordErrors.currentPassword}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label htmlFor="newPassword" className="form-label">
                            New Password
                          </label>
                          <div className="input-group">
                            <input
                              type={
                                showPasswords.newPassword ? "text" : "password"
                              }
                              className={`form-control ${
                                passwordErrors.newPassword ? "is-invalid" : ""
                              }`}
                              id="newPassword"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  newPassword: !prev.newPassword,
                                }))
                              }
                            >
                              <i
                                className={`fas fa-${
                                  showPasswords.newPassword
                                    ? "eye-slash"
                                    : "eye"
                                }`}
                              ></i>
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <div className="invalid-feedback d-block">
                              {passwordErrors.newPassword}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label
                            htmlFor="confirmPassword"
                            className="form-label"
                          >
                            Confirm New Password
                          </label>
                          <div className="input-group">
                            <input
                              type={
                                showPasswords.confirmPassword
                                  ? "text"
                                  : "password"
                              }
                              className={`form-control ${
                                passwordErrors.confirmPassword ? "is-invalid" : ""
                              }`}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  confirmPassword: !prev.confirmPassword,
                                }))
                              }
                            >
                              <i
                                className={`fas fa-${
                                  showPasswords.confirmPassword
                                    ? "eye-slash"
                                    : "eye"
                                }`}
                              ></i>
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <div className="invalid-feedback d-block">
                              {passwordErrors.confirmPassword}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* General error message */}
                    {passwordErrors.general && (
                      <div className="alert alert-danger">
                        {passwordErrors.general}
                      </div>
                    )}
                    
                    {/* Change Password Button */}
                    <div className="d-flex justify-content-end mt-3">
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handlePasswordChange}
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-key me-2"></i>
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">
                  Payment Information
                </h2>
                <p className="tutor-profile-section-description">
                  Update your payment details for receiving payments.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="abnNumber" className="form-label">
                            ABN Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="abnNumber"
                            name="abnNumber"
                            value={formData.abnNumber}
                            onChange={handleInputChange}
                            placeholder="11-digit ABN"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Payment Method</label>
                          <div>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="paymentMethod"
                                id="bankTransfer"
                                value="bank"
                                checked={formData.paymentMethod === "bank"}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="bankTransfer"
                              >
                                Bank Transfer
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="paymentMethod"
                                id="paypal"
                                value="paypal"
                                checked={formData.paymentMethod === "paypal"}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="paypal"
                              >
                                PayPal
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.paymentMethod === "bank" && (
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="accountName" className="form-label">
                              Account Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="accountName"
                              name="accountName"
                              value={formData.accountName}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="bsb" className="form-label">
                              BSB
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="bsb"
                              name="bsb"
                              value={formData.bsb}
                              onChange={handleInputChange}
                              placeholder="000-000"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label
                              htmlFor="accountNumber"
                              className="form-label"
                            >
                              Account Number
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="accountNumber"
                              name="accountNumber"
                              value={formData.accountNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Introduction Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">
                  Video Introduction
                </h2>
                <p className="tutor-profile-section-description">
                  Upload a short video introducing yourself to potential
                  students.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="tutor-profile-upload-area">
                      {introVideo ? (
                        <div className="tutor-profile-file-preview">
                          <div className="tutor-profile-file-info">
                            <i className="fas fa-video me-2"></i>
                            <span>{introVideo.name}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={removeIntroVideo}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="tutor-profile-upload-placeholder">
                          <input
                            type="file"
                            className="tutor-profile-file-input"
                            accept="video/*"
                            onChange={(e) => handleFileUpload(e, "introVideo")}
                            id="intro-video-upload"
                          />
                          <label
                            htmlFor="intro-video-upload"
                            className="tutor-profile-upload-label"
                          >
                            <i className="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                            <h5>Upload Video Introduction</h5>
                            <p className="text-muted">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-muted small">
                              MP4, AVI, MOV up to 100MB
                            </p>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="tutor-profile-section">
                <h2 className="tutor-profile-section-title">
                  Required Documents
                </h2>
                <p className="tutor-profile-section-description">
                  Upload required documents for verification.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="tutor-profile-upload-area">
                          <label className="form-label">Tutor Contract</label>
                          {tutorContractFile ? (
                            <div className="tutor-profile-file-preview">
                              <div className="tutor-profile-file-info">
                                <i className="fas fa-file-pdf me-2"></i>
                                <span>{tutorContractFile.name}</span>
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={removeTutorContract}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="tutor-profile-upload-placeholder">
                              <input
                                type="file"
                                className="tutor-profile-file-input"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) =>
                                  handleFileUpload(e, "tutorContract")
                                }
                                id="tutor-contract-upload"
                              />
                              <label
                                htmlFor="tutor-contract-upload"
                                className="tutor-profile-upload-label"
                              >
                                <i className="fas fa-file-pdf fa-2x mb-2"></i>
                                <p className="mb-0">Upload Tutor Contract</p>
                                <p className="text-muted small">
                                  PDF, DOC, DOCX
                                </p>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="tutor-profile-upload-area">
                          <label className="form-label">
                            Working with Children Check
                          </label>
                          {wwccFile ? (
                            <div className="tutor-profile-file-preview">
                              <div className="tutor-profile-file-info">
                                <i className="fas fa-file-pdf me-2"></i>
                                <span>{wwccFile.name}</span>
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={removeWWCC}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="tutor-profile-upload-placeholder">
                              <input
                                type="file"
                                className="tutor-profile-file-input"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => handleFileUpload(e, "wwcc")}
                                id="wwcc-upload"
                              />
                              <label
                                htmlFor="wwcc-upload"
                                className="tutor-profile-upload-label"
                              >
                                <i className="fas fa-file-pdf fa-2x mb-2"></i>
                                <p className="mb-0">Upload WWCC</p>
                                <p className="text-muted small">
                                  PDF, DOC, DOCX
                                </p>
                              </label>
                            </div>
                          )}
                          <div className="mt-2">
                            <label htmlFor="wwcc-expiry" className="form-label">
                              WWCC Expiry Date
                            </label>
                            <input
                              type="date"
                              id="wwcc-expiry"
                              className="form-control"
                              value={wwccExpiry}
                              onChange={(e) => setWwccExpiry(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="tutor-profile-section">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleSaveProfile}
                  >
                    <i className="fas fa-save me-2"></i>Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorProfile;
