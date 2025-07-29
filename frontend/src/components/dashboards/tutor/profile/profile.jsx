import '../../../../css/dashboards/tutor/profile/profile.css';
import React, { useState } from 'react';

function TutorProfile() {
  const [formData, setFormData] = useState({
    fullName: 'Sarah Brown',
    email: 'sarah.brown@email.com',
    username: 'sarahbrown',
    phoneNumber: '+1 (555) 123-4567',
    bio: 'Experienced tutor with 5+ years helping students excel in mathematics and science.',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    abnNumber: '',
    paymentMethod: 'bank',
    accountName: '',
    bsb: '',
    accountNumber: ''
  });

  const [selectedLocations, setSelectedLocations] = useState(['Online', 'New York']);
  const [subjectEntries, setSubjectEntries] = useState([
    { yearLevel: 'Year 11/12', curriculumOrState: 'VCE', subject: 'Mathematics' }
  ]);
  const [schools, setSchools] = useState(['Brisbane State High School']);
  const [currentStudies, setCurrentStudies] = useState(['Bachelor of Science - University of Queensland']);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [introVideo, setIntroVideo] = useState(null);
  const [tutorContractFile, setTutorContractFile] = useState(null);
  const [wwccFile, setWwccFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (e) => {
    const value = e.target.value;
    if (value && !selectedLocations.includes(value)) {
      setSelectedLocations([...selectedLocations, value]);
    }
  };

  const removeLocation = (location) => {
    setSelectedLocations(selectedLocations.filter(loc => loc !== location));
  };

  const handleSubjectChange = (index, field, value) => {
    const newEntries = [...subjectEntries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value
    };
    setSubjectEntries(newEntries);
  };

  const addSubjectEntry = () => {
    setSubjectEntries([...subjectEntries, {
      yearLevel: '',
      curriculumOrState: '',
      subject: ''
    }]);
  };

  const removeSubjectEntry = (index) => {
    const newEntries = subjectEntries.filter((_, i) => i !== index);
    setSubjectEntries(newEntries);
  };

  const handleSchoolChange = (index, value) => {
    const newSchools = [...schools];
    newSchools[index] = value;
    setSchools(newSchools);
  };

  const addSchool = () => {
    setSchools([...schools, '']);
  };

  const removeSchool = (index) => {
    const newSchools = schools.filter((_, i) => i !== index);
    setSchools(newSchools);
  };

  const handleStudyChange = (index, value) => {
    const newStudies = [...currentStudies];
    newStudies[index] = value;
    setCurrentStudies(newStudies);
  };

  const addStudy = () => {
    setCurrentStudies([...currentStudies, '']);
  };

  const removeStudy = (index) => {
    const newStudies = currentStudies.filter((_, i) => i !== index);
    setCurrentStudies(newStudies);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setIntroVideo(videoUrl);
    }
  };

  const removeVideo = () => {
    if (introVideo) {
      URL.revokeObjectURL(introVideo);
      setIntroVideo(null);
    }
  };

  const handleTutorContractUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTutorContractFile(file);
    }
  };

  const handleWWCCUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWwccFile(file);
    }
  };

  const removeTutorContract = () => {
    setTutorContractFile(null);
  };

  const removeWWCC = () => {
    setWwccFile(null);
  };

  return (
    <div className="tutor-profile-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="tutor-profile-content">
              
              {/* Page Title */}
              <h1 className="tutor-profile-title">Account Management</h1>

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
                          <label htmlFor="profile-upload" className="tutor-profile-avatar-upload">
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
                          <h2>{formData.fullName}</h2>
                          <div className="tutor-profile-badges">
                            <span className="tutor-profile-badge-gold">Gold (250/5)</span>
                            <span className="tutor-profile-badge-atr">ATR (96.45)</span>
                          </div>
                          <div className="tutor-profile-meta">
                            <span className="tutor-profile-location">
                              <i className="fas fa-map-marker-alt"></i> New York
                            </span>
                            <span className="tutor-profile-joined">
                              <i className="fas fa-calendar-alt"></i> Joined March 17
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
                <h4 className="tutor-profile-section-title">Personal Information</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-user"></i> Full Name
                          </label>
                          <input 
                            type="text" 
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="tutor-profile-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-at"></i> Username
                          </label>
                          <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Enter your username"
                            className="tutor-profile-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-envelope"></i> Email
                          </label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email address"
                            className="tutor-profile-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-phone"></i> Phone Number
                          </label>
                          <input 
                            type="tel" 
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            className="tutor-profile-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="tutor-profile-form-group">
                      <label>
                        <i className="fas fa-comment-alt"></i> About you / Bio
                      </label>
                      <textarea 
                        rows="4" 
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Write something about yourself..."
                        className="tutor-profile-textarea"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Introduction Video Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">Introduction Video</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="tutor-profile-form-group">
                      <label>
                        <i className="fas fa-video"></i> Upload Introduction Video
                      </label>
                      <div className="tutor-profile-video-upload">
                        {introVideo ? (
                          <div className="tutor-profile-video-preview">
                            <video controls src={introVideo} className="tutor-profile-video"></video>
                            <button 
                              type="button" 
                              className="btn btn-outline-danger tutor-profile-video-remove"
                              onClick={removeVideo}
                            >
                              <i className="fas fa-trash-alt me-2"></i> Remove Video
                            </button>
                          </div>
                        ) : (
                          <div className="tutor-profile-video-placeholder">
                            <input
                              type="file"
                              id="video-upload"
                              className="tutor-profile-video-input"
                              accept="video/*"
                              onChange={handleVideoChange}
                            />
                            <label htmlFor="video-upload" className="tutor-profile-video-label">
                              <i className="fas fa-cloud-upload-alt"></i>
                              <span>Click to upload your introduction video</span>
                              <span className="tutor-profile-video-hint">
                                <i className="fas fa-info-circle"></i> MP4, WebM or Ogg format
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">Change Password</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-key"></i> Current Password
                          </label>
                          <input 
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Enter your current password"
                            className="tutor-profile-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-lock"></i> New Password
                          </label>
                          <div className="tutor-profile-password-container">
                            <input 
                              type={showPasswords.newPassword ? "text" : "password"}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              placeholder="Enter your new password"
                              className="tutor-profile-input"
                            />
                            <button 
                              type="button"
                              className="tutor-profile-password-toggle"
                              onClick={() => togglePasswordVisibility('newPassword')}
                            >
                              <i className={`fas ${showPasswords.newPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-lock"></i> Confirm Password
                          </label>
                          <div className="tutor-profile-password-container">
                            <input 
                              type={showPasswords.confirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm your new password"
                              className="tutor-profile-input"
                            />
                            <button 
                              type="button"
                              className="tutor-profile-password-toggle"
                              onClick={() => togglePasswordVisibility('confirmPassword')}
                            >
                              <i className={`fas ${showPasswords.confirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Locations Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">Available Locations</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="tutor-profile-form-group">
                      <label>
                        <i className="fas fa-map-marked-alt"></i> Select Locations
                      </label>
                      <select 
                        className="tutor-profile-select"
                        onChange={handleLocationSelect}
                        value=""
                      >
                        <option value="">Select locations...</option>
                        <option value="Online">Online</option>
                        <option value="New York">New York</option>
                        <option value="Los Angeles">Los Angeles</option>
                        <option value="Chicago">Chicago</option>
                        <option value="Houston">Houston</option>
                      </select>
                      <div className="tutor-profile-locations">
                        {selectedLocations.map((location, index) => (
                          <span key={index} className="tutor-profile-location-tag">
                            <i className="fas fa-map-pin"></i> {location}
                            <button 
                              type="button" 
                              onClick={() => removeLocation(location)}
                              className="tutor-profile-location-remove"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Tutoring Subjects Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">My Tutoring Subjects</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="tutor-profile-subjects">
                      {subjectEntries.map((entry, index) => (
                        <div key={index} className="tutor-profile-subject-entry">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <div className="tutor-profile-form-group">
                                <label>Year Level</label>
                                <select 
                                  className="tutor-profile-select"
                                  value={entry.yearLevel}
                                  onChange={(e) => handleSubjectChange(index, 'yearLevel', e.target.value)}
                                >
                                  <option value="">Select year level...</option>
                                  <option value="Year 1-10">Year 1-10</option>
                                  <option value="Year 11/12">Year 11/12</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-md-4 mb-3">
                              <div className="tutor-profile-form-group">
                                <label>Curriculum/State</label>
                                <select 
                                  className="tutor-profile-select"
                                  value={entry.curriculumOrState}
                                  onChange={(e) => handleSubjectChange(index, 'curriculumOrState', e.target.value)}
                                >
                                  <option value="">Select curriculum...</option>
                                  <option value="VCE">VCE</option>
                                  <option value="HSC">HSC</option>
                                  <option value="QLD">QLD</option>
                                  <option value="WA">WA</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-md-4 mb-3">
                              <div className="tutor-profile-form-group">
                                <label>Subject</label>
                                <select 
                                  className="tutor-profile-select"
                                  value={entry.subject}
                                  onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                                >
                                  <option value="">Select subject...</option>
                                  <option value="Mathematics">Mathematics</option>
                                  <option value="Physics">Physics</option>
                                  <option value="Chemistry">Chemistry</option>
                                  <option value="Biology">Biology</option>
                                  <option value="English">English</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          {subjectEntries.length > 1 && (
                            <button 
                              type="button" 
                              className="btn btn-outline-danger tutor-profile-remove-btn"
                              onClick={() => removeSubjectEntry(index)}
                            >
                              <i className="fas fa-trash-alt me-2"></i> Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="btn btn-outline-primary tutor-profile-add-btn" onClick={addSubjectEntry}>
                        <i className="fas fa-plus me-2"></i> Add Another Subject
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">Education</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    
                    <div className="tutor-profile-education-subsection">
                      <h5 className="tutor-profile-education-title">
                        <i className="fas fa-school"></i> I went to school at
                      </h5>
                      <div className="tutor-profile-education-entries">
                        {schools.map((school, index) => (
                          <div key={index} className="tutor-profile-education-entry">
                            <input
                              type="text"
                              className="tutor-profile-input"
                              value={school}
                              onChange={(e) => handleSchoolChange(index, e.target.value)}
                              placeholder="Enter school name"
                            />
                            {schools.length > 1 && (
                              <button 
                                type="button" 
                                className="btn btn-outline-danger tutor-profile-remove-btn"
                                onClick={() => removeSchool(index)}
                              >
                                <i className="fas fa-trash-alt me-2"></i> Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" className="btn btn-outline-primary tutor-profile-add-btn" onClick={addSchool}>
                          <i className="fas fa-plus me-2"></i> Add Another School
                        </button>
                      </div>
                    </div>

                    <div className="tutor-profile-education-subsection">
                      <h5 className="tutor-profile-education-title">
                        <i className="fas fa-university"></i> I'm Currently Studying
                      </h5>
                      <div className="tutor-profile-education-entries">
                        {currentStudies.map((study, index) => (
                          <div key={index} className="tutor-profile-education-entry">
                            <input
                              type="text"
                              className="tutor-profile-input"
                              value={study}
                              onChange={(e) => handleStudyChange(index, e.target.value)}
                              placeholder="Enter what you're studying"
                            />
                            {currentStudies.length > 1 && (
                              <button 
                                type="button" 
                                className="btn btn-outline-danger tutor-profile-remove-btn"
                                onClick={() => removeStudy(index)}
                              >
                                <i className="fas fa-trash-alt me-2"></i> Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" className="btn btn-outline-primary tutor-profile-add-btn" onClick={addStudy}>
                          <i className="fas fa-plus me-2"></i> Add Another Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Documents Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">Required Documents</h4>
                <p className="tutor-profile-section-description">Please upload the following required documents to complete your profile.</p>
                
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    
                    {/* ABN Number Section */}
                    <div className="tutor-profile-document-section mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="tutor-profile-card-title">
                          <i className="fas fa-id-card me-2"></i>
                          ABN Number
                        </h6>
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-clock me-1"></i>
                          Pending Approval
                        </span>
                      </div>
                      
                      <div className="tutor-profile-form-group">
                        <label>
                          <i className="fas fa-hashtag"></i> ABN Number
                        </label>
                        <input 
                          type="text" 
                          name="abnNumber"
                          value={formData.abnNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your ABN number (11 digits)"
                          className="tutor-profile-input"
                          maxLength="11"
                        />
                      </div>
                      
                      <div className="alert alert-info mt-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Please enter your valid Australian Business Number (ABN) for tax purposes.
                      </div>
                    </div>
                    
                    {/* Tutor Contract Section */}
                    <div className="tutor-profile-document-section mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="tutor-profile-card-title">
                          <i className="fas fa-file-contract me-2"></i>
                          Tutor Contract
                        </h6>
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-clock me-1"></i>
                          Pending Approval
                        </span>
                      </div>
                      
                      <div className="tutor-profile-upload-area">
                        {tutorContractFile ? (
                          <div className="tutor-profile-file-preview">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-file-pdf text-danger me-3" style={{fontSize: '2rem'}}></i>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{tutorContractFile.name}</h6>
                                <small className="text-muted">
                                  {(tutorContractFile.size / 1024 / 1024).toFixed(2)} MB
                                </small>
                              </div>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={removeTutorContract}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="tutor-profile-upload-placeholder">
                            <input
                              type="file"
                              id="tutor-contract-upload"
                              className="tutor-profile-file-input"
                              accept=".pdf,.doc,.docx"
                              onChange={handleTutorContractUpload}
                            />
                            <label htmlFor="tutor-contract-upload" className="tutor-profile-upload-label">
                              <i className="fas fa-cloud-upload-alt"></i>
                              <span>Click to upload Tutor Contract</span>
                              <small className="text-muted">PDF, DOC, or DOCX</small>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <div className="alert alert-info mt-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Please download the Tutor Contract form from your dashboard, sign it, and upload it here.
                      </div>
                    </div>

                    {/* WWCC Section */}
                    <div className="tutor-profile-document-section">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="tutor-profile-card-title">
                          <i className="fas fa-user-shield me-2"></i>
                          Working with Children Check (WWCC)
                        </h6>
                        <span className="badge bg-danger">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Not Uploaded
                        </span>
                      </div>
                      
                      <div className="tutor-profile-upload-area">
                        {wwccFile ? (
                          <div className="tutor-profile-file-preview">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-file-image text-success me-3" style={{fontSize: '2rem'}}></i>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{wwccFile.name}</h6>
                                <small className="text-muted">
                                  {(wwccFile.size / 1024 / 1024).toFixed(2)} MB
                                </small>
                              </div>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={removeWWCC}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="tutor-profile-upload-placeholder">
                            <input
                              type="file"
                              id="wwcc-upload"
                              className="tutor-profile-file-input"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleWWCCUpload}
                            />
                            <label htmlFor="wwcc-upload" className="tutor-profile-upload-label">
                              <i className="fas fa-cloud-upload-alt"></i>
                              <span>Click to upload WWCC document</span>
                              <small className="text-muted">PDF, JPG, or PNG</small>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <div className="alert alert-info mt-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Please upload a clear copy of your valid Working with Children Check certificate.
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">Payment Method</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="tutor-profile-payment-method-toggle">
                      <button 
                        type="button" 
                        className={`tutor-profile-payment-method-btn ${formData.paymentMethod === 'bank' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                      >
                        <i className="fas fa-university me-2"></i> Bank Account
                      </button>
                      <button 
                        type="button" 
                        className={`tutor-profile-payment-method-btn ${formData.paymentMethod === 'paypal' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                      >
                        <i className="fas fa-paypal me-2"></i> PayPal
                      </button>
                    </div>

                    {formData.paymentMethod === 'bank' && (
                      <div className="tutor-profile-bank-account-details">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-user"></i> Account Holder Name
                          </label>
                          <input 
                            type="text" 
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            placeholder="Enter your account holder name"
                            className="tutor-profile-input"
                          />
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <div className="tutor-profile-form-group">
                              <label>
                                <i className="fas fa-hashtag"></i> BSB Number
                              </label>
                              <input 
                                type="text" 
                                name="bsb"
                                value={formData.bsb}
                                onChange={handleInputChange}
                                placeholder="Enter your BSB number (6 digits)"
                                className="tutor-profile-input"
                                maxLength="6"
                              />
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="tutor-profile-form-group">
                              <label>
                                <i className="fas fa-hashtag"></i> Account Number
                              </label>
                              <input 
                                type="text" 
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleInputChange}
                                placeholder="Enter your account number (10 digits)"
                                className="tutor-profile-input"
                                maxLength="10"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="alert alert-info mt-3">
                          <i className="fas fa-info-circle me-2"></i>
                          Please provide your bank account details for direct deposit.
                        </div>
                      </div>
                    )}

                    {formData.paymentMethod === 'paypal' && (
                      <div className="tutor-profile-paypal-account-details">
                        <p>
                          <i className="fas fa-info-circle me-2"></i>
                          PayPal account details will be displayed here once you connect your PayPal account.
                        </p>
                        <button className="btn btn-primary">
                          <i className="fas fa-link me-2"></i> Connect PayPal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Account Details Section */}
              <div className="tutor-profile-section">
                <h4 className="tutor-profile-section-title">Bank Account Details</h4>
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="tutor-profile-form-group">
                      <label>
                        <i className="fas fa-user"></i> Account Holder Name
                      </label>
                      <input 
                        type="text" 
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        placeholder="Enter account holder name"
                        className="tutor-profile-input"
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-university"></i> BSB
                          </label>
                          <input 
                            type="text" 
                            name="bsb"
                            value={formData.bsb}
                            onChange={handleInputChange}
                            placeholder="Enter BSB number"
                            className="tutor-profile-input"
                            maxLength="6"
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="tutor-profile-form-group">
                          <label>
                            <i className="fas fa-credit-card"></i> Account Number
                          </label>
                          <input 
                            type="text" 
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            placeholder="Enter account number"
                            className="tutor-profile-input"
                            maxLength="10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
