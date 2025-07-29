import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { getUserProfile, getSubjectSelectionData, getTutorSubjects, updateTutorSubjects, updateUserProfile, updateUserProfileWithFiles, updateTutorProfile, updateTutorVideoSubmission } from '../../../../services/authService';
import "../../../../css/dashboards/tutor/account-settings/account-settings.css";

function TutorSettingsTutorAccountSettings() {
    const { user } = useAuth();
    const location = useLocation();
    const welcomeMessage = location.state?.message;
    
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [introVideo, setIntroVideo] = useState(null);
    const [videoBlob, setVideoBlob] = useState(null); // Track blob URL for cleanup
    const [isVideoUploading, setIsVideoUploading] = useState(false);
    const [schools, setSchools] = useState(['']);
    const [currentStudies, setCurrentStudies] = useState(['']);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tutorProfile, setTutorProfile] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Subject selection data from API
    const [subjectData, setSubjectData] = useState({
        year_levels: [],
        curricula: [],
        states: [],
        year_11_12_subjects: {},
        year_1_10_subjects: {}
    });
    const [subjectEntries, setSubjectEntries] = useState([{
        yearLevel: '',
        curriculumOrState: '',
        subject: ''
    }]);
    
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    useEffect(() => {
        fetchTutorProfile();
        fetchSubjectData();
    }, []);

    const fetchSubjectData = async () => {
        try {
            const result = await getSubjectSelectionData();
            if (result.success) {
                setSubjectData(result.data);
            } else {
                console.error('Failed to load subject data:', result.error);
            }
        } catch (err) {
            console.error('Error loading subject data:', err.message);
        }
    };

    const fetchTutorProfile = async () => {
        try {
            setLoading(true);
            const result = await getUserProfile();
            
            if (result.success) {
                const userData = result.data;
                const profile = userData.profile || {};
                
                setTutorProfile(profile);
                setFormData({
                    fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
                    username: userData.username || '',
                    email: userData.email || '',
                    phoneNumber: userData.phone_number || '',
                    bio: profile.bio || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                
                // Set profile-specific data - prioritize new arrays, fallback to single fields
                if (profile.current_studies && profile.current_studies.length > 0) {
                    setCurrentStudies(profile.current_studies);
                } else if (profile.university) {
                    setCurrentStudies([profile.university]);
                } else {
                    setCurrentStudies(['']);
                }
                
                if (profile.schools_attended && profile.schools_attended.length > 0) {
                    setSchools(profile.schools_attended);
                } else if (profile.school) {
                    setSchools([profile.school]);
                } else {
                    setSchools(['']);
                }
                
                if (profile.preferred_locations && profile.preferred_locations.length > 0) {
                    setSelectedLocations(profile.preferred_locations);
                }
                
                // Load current subject selections from the new subjects_selected field
                if (profile.subjects_selected && profile.subjects_selected.length > 0) {
                    setSelectedSubjects(profile.subjects_selected);
                    // Convert subjects to entries format for display
                    const subjectEntries = profile.subjects_selected.map(subject => {
                        // Try to parse the subject format: "SubjectName - YearLevel (Curriculum/State)"
                        const parts = subject.split(' - ');
                        if (parts.length >= 2) {
                            const subjectName = parts[0];
                            const yearAndCurriculum = parts[1];
                            const matches = yearAndCurriculum.match(/^(.+?) \((.+?)\)$/);
                            if (matches) {
                                return {
                                    yearLevel: matches[1],
                                    curriculumOrState: matches[2],
                                    subject: subjectName
                                };
                            }
                        }
                        // Fallback for subjects that don't match the expected format
                        return {
                            yearLevel: '',
                            curriculumOrState: '',
                            subject: subject
                        };
                    });
                    setSubjectEntries(subjectEntries);
                } else {
                    // Set default empty entry if no subjects selected
                    setSubjectEntries([{
                        yearLevel: '',
                        curriculumOrState: '',
                        subject: ''
                    }]);
                }
                
                // Legacy: also check subjects_taught for backwards compatibility
                if ((!profile.subjects_selected || profile.subjects_selected.length === 0) && 
                    profile.subjects_taught && profile.subjects_taught.length > 0) {
                    const subjectEntries = profile.subjects_taught.map(subject => ({
                        yearLevel: '',
                        curriculumOrState: '',
                        subject: subject
                    }));
                    setSubjectEntries(subjectEntries);
                }
                
                // Set profile picture if available
                if (userData.profile_picture_url) {
                    setProfileImage(userData.profile_picture_url);
                } else if (userData.profile_picture) {
                    // Fallback to relative URL if absolute URL not available
                    setProfileImage(`http://178.128.109.143:8000${userData.profile_picture}`);
                }
                
                // Set video if available, but don't override blob URLs during user interaction
                if (profile.video_submission && !videoBlob) {
                    // If it's a URL from backend, use it directly
                    if (typeof profile.video_submission === 'string' && profile.video_submission.startsWith('http')) {
                        setIntroVideo(profile.video_submission);
                    } else if (typeof profile.video_submission === 'string') {
                        // If it's a relative path, construct the full URL
                        setIntroVideo(`http://178.128.109.143:8000${profile.video_submission}`);
                    }
                }
            } else {
                setError('Failed to load profile data');
            }
        } catch (err) {
            setError('Error loading profile: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Store the actual file for upload
                setProfileImageFile(file);
                
                // Create preview URL for display
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfileImage(reader.result);
                };
                reader.readAsDataURL(file);

                // Automatically save the profile image
                const userProfileData = {
                    profile_picture: file
                };

                console.log('Automatically saving profile image...');
                const userResult = await updateUserProfileWithFiles(userProfileData);
                
                if (userResult.success) {
                    console.log('Profile image saved successfully');
                    // Refresh the profile data to get the new image URL
                    await fetchTutorProfile();
                    // Clear the file state since it's been uploaded
                    setProfileImageFile(null);
                } else {
                    console.error('Failed to save profile image:', userResult.error);
                    // You could show an error message here if needed
                    setError('Failed to save profile image: ' + userResult.error);
                }
            } catch (err) {
                console.error('Error uploading profile image:', err);
                setError('Error uploading profile image: ' + err.message);
            }
        }
    };

    const handleVideoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsVideoUploading(true);
                
                // Clean up previous blob URL if it exists
                if (videoBlob) {
                    URL.revokeObjectURL(videoBlob);
                }
                
                // Create new preview URL for display
                const videoUrl = URL.createObjectURL(file);
                setVideoBlob(videoUrl);
                setIntroVideo(videoUrl);

                // Automatically save the video
                console.log('Automatically saving introduction video...');
                const result = await updateTutorVideoSubmission(file);
                
                if (result.success) {
                    console.log('Introduction video saved successfully');
                    // Don't immediately refresh profile to avoid changing video source during playback
                    // The video will load from backend on next page load or when user refreshes
                } else {
                    console.error('Failed to save introduction video:', result.error);
                    setError('Failed to save introduction video: ' + result.error);
                }
            } catch (err) {
                console.error('Error uploading introduction video:', err);
                setError('Error uploading introduction video: ' + err.message);
            } finally {
                setIsVideoUploading(false);
            }
        }
    };

    const handleLocationSelect = (e) => {
        const value = e.target.value;
        if (value && !selectedLocations.includes(value)) {
            setSelectedLocations([...selectedLocations, value]);
        }
    };

    const handleSubjectChange = (index, field, value) => {
        const newEntries = [...subjectEntries];
        newEntries[index] = {
            ...newEntries[index],
            [field]: value
        };
        
        // Reset dependent fields
        if (field === 'yearLevel') {
            newEntries[index].curriculumOrState = '';
            newEntries[index].subject = '';
        } else if (field === 'curriculumOrState') {
            newEntries[index].subject = '';
        }
        
        setSubjectEntries(newEntries);
    };

    const getCurriculumOrStateOptions = (yearLevel) => {
        if (yearLevel === 'Year 11/12') {
            return subjectData.curricula || [];
        } else if (yearLevel === 'Year 1-10') {
            return subjectData.states || [];
        }
        return [];
    };

    const getSubjectOptions = (yearLevel, curriculumOrState) => {
        if (yearLevel === 'Year 11/12' && curriculumOrState) {
            return subjectData.year_11_12_subjects[curriculumOrState] || [];
        } else if (yearLevel === 'Year 1-10' && curriculumOrState) {
            return subjectData.year_1_10_subjects[curriculumOrState] || [];
        }
        return [];
    };

    const getCurriculumOrStateLabel = (yearLevel) => {
        if (yearLevel === 'Year 11/12') {
            return 'Curriculum';
        } else if (yearLevel === 'Year 1-10') {
            return 'State';
        }
        return 'Curriculum/State';
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

    const removeLocation = (location) => {
        setSelectedLocations(selectedLocations.filter(loc => loc !== location));
    };

    const handleSchoolChange = (index, value) => {
        const newSchools = [...schools];
        newSchools[index] = value;
        setSchools(newSchools);
    };

    const handleStudyChange = (index, value) => {
        const newStudies = [...currentStudies];
        newStudies[index] = value;
        setCurrentStudies(newStudies);
    };

    const addSchool = () => {
        setSchools([...schools, '']);
    };

    const removeSchool = (index) => {
        const newSchools = schools.filter((_, i) => i !== index);
        setSchools(newSchools);
    };

    const addStudy = () => {
        setCurrentStudies([...currentStudies, '']);
    };

    const removeStudy = (index) => {
        const newStudies = currentStudies.filter((_, i) => i !== index);
        setCurrentStudies(newStudies);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setError('');
            
            // Split full name into first and last name
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Prepare user profile data (basic user fields)
            const userProfileData = {
                first_name: firstName,
                last_name: lastName,
                email: formData.email,
                phone_number: formData.phoneNumber,
            };
            
            // Update user profile (basic info) - profile image is handled separately
            const userResult = await updateUserProfile(userProfileData);
            
            if (!userResult.success) {
                console.error('Failed to update user profile:', userResult.error);
                setError('Failed to update basic profile information: ' + userResult.error);
                return;
            }
            
            // Prepare tutor profile data (tutor-specific fields)
            const tutorProfileData = {
                bio: formData.bio,
                university: currentStudies[0] || '',
                school: schools[0] || '',
                preferred_locations: selectedLocations,
                // Save all education entries in the new fields
                schools_attended: schools.filter(school => school.trim() !== ''),
                current_studies: currentStudies.filter(study => study.trim() !== ''),
            };
            
            // Update tutor profile (tutor-specific info)
            const tutorResult = await updateTutorProfile(tutorProfileData);
            
            if (!tutorResult.success) {
                console.error('Failed to update tutor profile:', tutorResult.error);
                setError('Failed to update tutor profile information: ' + tutorResult.error);
                return;
            }
            
            // Convert subject entries to the format expected by the API
            const formattedSubjects = subjectEntries
                .filter(entry => entry.yearLevel && entry.curriculumOrState && entry.subject)
                .map(entry => `${entry.subject} - ${entry.yearLevel} (${entry.curriculumOrState})`);
            
            // Update subject selections
            if (formattedSubjects.length > 0) {
                const subjectResult = await updateTutorSubjects({
                    subjects_selected: formattedSubjects
                });
                
                if (!subjectResult.success) {
                    console.error('Failed to update subjects:', subjectResult.error);
                    setError('Failed to update subject selections: ' + subjectResult.error);
                    return;
                }
            }
            
            // Refresh the profile data to show the updates
            await fetchTutorProfile();
            
            console.log('All profile data updated successfully');
            setIsEditMode(false);
            setError('');
            
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Error updating profile: ' + err.message);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Cleanup blob URLs on component unmount
    useEffect(() => {
        return () => {
            if (videoBlob) {
                URL.revokeObjectURL(videoBlob);
            }
        };
    }, [videoBlob]);

    if (loading) {
        return (
            <div className="account-settings-main">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="account-settings-main">
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button 
                        className="btn btn-primary ms-3" 
                        onClick={fetchTutorProfile}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="account-settings-main">
            {welcomeMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {welcomeMessage}
                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
            )}
            
            <h1 className="account-settings-title">Account Management</h1>

            <div className="account-settings-header">
                <div className="account-settings-profile">
                    <div className="account-settings-avatar">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" />
                        ) : (
                            <div className="account-settings-avatar-placeholder">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                        <label htmlFor="profile-upload" className="account-settings-avatar-upload">
                            <i className="fas fa-camera"></i>
                            <input
                                type="file"
                                id="profile-upload"
                                className="d-none"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                    <div className="account-settings-profile-info">
                        <h2>{formData.fullName || user?.username || 'Tutor'}</h2>
                        <div className="account-settings-stats">
                            <span className="stats-gold">
                                Rating: {tutorProfile?.rating || '0.0'}/5.0
                            </span>
                            <span className="stats-atr">
                                ATAR: {tutorProfile?.atar || 'Not specified'}
                            </span>
                        </div>
                        <div className="account-settings-meta">
                            <span className="account-settings-location">
                                <i className="fas fa-graduation-cap"></i> {tutorProfile?.university || 'University not specified'}
                            </span>
                            <span className="account-settings-joined">
                                <i className="fas fa-calendar-alt"></i> 
                                {tutorProfile?.approved_at ? 
                                    `Approved ${new Date(tutorProfile.approved_at).toLocaleDateString()}` : 
                                    'Approval pending'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="account-settings-form">
                <form onSubmit={handleSubmit}>
                    <div className="edit-button-container">
                        <button 
                            type="button" 
                            className={`edit-mode-button ${isEditMode ? 'active' : ''}`}
                            onClick={() => setIsEditMode(!isEditMode)}
                        >
                            <i className="fas fa-edit"></i>
                            {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="account-settings-form-row">
                        <div className="account-settings-form-group">
                            <label>
                                <i className="fas fa-user"></i> Full Name
                            </label>
                            <input 
                                type="text" 
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="account-settings-form-group">
                            <label>
                                <i className="fas fa-at"></i> Username
                            </label>
                            <input 
                                type="text" 
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Enter your username"
                                disabled={!isEditMode}
                            />
                        </div>
                    </div>

                    <div className="account-settings-form-row">
                        <div className="account-settings-form-group">
                            <label>
                                <i className="fas fa-envelope"></i> Email
                            </label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email address"
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="account-settings-form-group">
                            <label>
                                <i className="fas fa-phone"></i> Phone Number
                            </label>
                            <input 
                                type="tel" 
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                disabled={!isEditMode}
                            />
                        </div>
                    </div>

                    <div className="account-settings-form-group full-width">
                        <label>
                            <i className="fas fa-comment-alt"></i> About you / Bio
                        </label>
                        <textarea 
                            rows="4" 
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Write something about yourself..."
                            disabled={!isEditMode}
                        ></textarea>
                    </div>

                    <div className="account-settings-form-group full-width">
                        <label>
                            <i className="fas fa-video"></i> Introduction Video
                        </label>
                        <div className="video-upload-container">
                            {introVideo ? (
                                <div className="video-preview">
                                    <video 
                                        controls 
                                        src={introVideo}
                                        className="uploaded-video"
                                        onError={(e) => {
                                            console.warn('Video load error:', e);
                                            // Don't show error to user for common video loading issues
                                        }}
                                        onLoadStart={() => {
                                            console.log('Video loading started');
                                        }}
                                        onCanPlay={() => {
                                            console.log('Video can play');
                                        }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                    {isVideoUploading && (
                                        <div className="video-upload-overlay">
                                            <div className="spinner-border text-light" role="status">
                                                <span className="visually-hidden">Uploading...</span>
                                            </div>
                                            <p className="text-light mt-2">Uploading video...</p>
                                        </div>
                                    )}
                                    {isEditMode && (
                                        <button 
                                            type="button" 
                                            className="video-remove-btn"
                                            onClick={async () => {
                                                try {
                                                    // Clean up blob URL if it exists
                                                    if (videoBlob) {
                                                        URL.revokeObjectURL(videoBlob);
                                                        setVideoBlob(null);
                                                    }
                                                    
                                                    // Remove video from backend by sending null
                                                    const result = await updateTutorProfile({ video_submission: null });
                                                    if (result.success) {
                                                        setIntroVideo(null);
                                                        console.log('Video removed successfully');
                                                    } else {
                                                        console.error('Failed to remove video:', result.error);
                                                        setError('Failed to remove video: ' + result.error);
                                                    }
                                                } catch (err) {
                                                    console.error('Error removing video:', err);
                                                    setError('Error removing video: ' + err.message);
                                                }
                                            }}
                                        >
                                            <i className="fas fa-trash-alt"></i> Remove Video
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="video-upload-placeholder">
                                    <input
                                        type="file"
                                        id="video-upload"
                                        className="video-input"
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        disabled={!isEditMode}
                                    />
                                    <label 
                                        htmlFor="video-upload" 
                                        className={`video-upload-label d-flex flex-column align-items-center gap-2 ${!isEditMode ? 'disabled' : ''}`}
                                    >
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span>Click to upload your introduction video</span>
                                        <span className="video-format-hint">
                                            <i className="fas fa-info-circle"></i> MP4, WebM or Ogg format
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>
                            <i className="fas fa-lock"></i> CHANGE PASSWORD
                        </h3>
                        <div className="form-section-content">
                            <div className="password-change-container">
                                <div className="account-settings-form-group">
                                    <label>
                                        <i className="fas fa-key"></i> Current Password
                                    </label>
                                    <div className="password-input-container">
                                        <input 
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter your current password"
                                            disabled={!isEditMode}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                <div className="account-settings-form-group">
                                    <label>
                                        <i className="fas fa-lock"></i> New Password
                                    </label>
                                    <div className="password-input-container">
                                        <input 
                                            type={showPasswords.newPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter your new password"
                                            disabled={!isEditMode}
                                            className="form-input"
                                        />
                                        <button 
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                            disabled={!isEditMode}
                                        >
                                            <i className={`fas ${showPasswords.newPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="account-settings-form-group">
                                    <label>
                                        <i className="fas fa-lock"></i> Confirm Password
                                    </label>
                                    <div className="password-input-container">
                                        <input 
                                            type={showPasswords.confirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword || ''}
                                            onChange={handleInputChange}
                                            placeholder="Confirm your new password"
                                            disabled={!isEditMode}
                                            className="form-input"
                                        />
                                        <button 
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            disabled={!isEditMode}
                                        >
                                            <i className={`fas ${showPasswords.confirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>
                            <i className="fas fa-map-marked-alt"></i> AVAILABLE LOCATIONS
                        </h3>
                        <div className="form-section-content">
                            <div className="multi-select-container">
                                <select 
                                    className="form-select"
                                    onChange={handleLocationSelect}
                                    value=""
                                    disabled={!isEditMode}
                                >
                                    <option value="">Select locations...</option>
                                    <option value="Online">Online</option>
                                    <option value="Tingalpa">Tingalpa</option>
                                    <option value="Camp hill">Camp hill</option>
                                    <option value="Buderim">Buderim</option>
                                </select>
                                <div className="selected-items">
                                    {selectedLocations.map((location, index) => (
                                        <span key={index} className="selected-tag">
                                            <i className="fas fa-map-pin"></i> {location}
                                            {isEditMode && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeLocation(location)}
                                                    className="tag-remove"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>
                            <i className="fas fa-book"></i> MY TUTORING SUBJECTS
                        </h3>
                        <div className="form-section-content">
                            <div className="education-entries">
                                {subjectEntries.map((entry, index) => (
                                    <div key={index} className="education-entry">
                                        <div className="subject-dropdowns">
                                            <div className="subject-dropdown-group">
                                                <label>Year Level</label>
                                                <select 
                                                    className="form-select"
                                                    value={entry.yearLevel}
                                                    onChange={(e) => handleSubjectChange(index, 'yearLevel', e.target.value)}
                                                    disabled={!isEditMode}
                                                >
                                                    <option value="">Select year level...</option>
                                                    {subjectData.year_levels.map((year) => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="subject-dropdown-group">
                                                <label>{getCurriculumOrStateLabel(entry.yearLevel)}</label>
                                                <select 
                                                    className="form-select"
                                                    value={entry.curriculumOrState}
                                                    onChange={(e) => handleSubjectChange(index, 'curriculumOrState', e.target.value)}
                                                    disabled={!isEditMode || !entry.yearLevel}
                                                >
                                                    <option value="">Select {getCurriculumOrStateLabel(entry.yearLevel).toLowerCase()}...</option>
                                                    {getCurriculumOrStateOptions(entry.yearLevel).map((curr) => (
                                                        <option key={curr} value={curr}>{curr}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="subject-dropdown-group">
                                                <label>Subject</label>
                                                <select 
                                                    className="form-select"
                                                    value={entry.subject}
                                                    onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                                                    disabled={!isEditMode || !entry.yearLevel || !entry.curriculumOrState}
                                                >
                                                    <option value="">Select subject...</option>
                                                    {getSubjectOptions(entry.yearLevel, entry.curriculumOrState).map((state) => (
                                                        <option key={state} value={state}>{state}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {isEditMode && subjectEntries.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    className="btn-remove"
                                                    onClick={() => removeSubjectEntry(index)}
                                                >
                                                    <i className="fas fa-trash-alt"></i> Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isEditMode && (
                                    <button type="button" className="btn-add" onClick={addSubjectEntry}>
                                        <i className="fas fa-plus"></i> Add Another Subject
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>
                            <i className="fas fa-graduation-cap"></i> EDUCATION
                        </h3>
                        <div className="education-subsection">
                            <h4>
                                <i className="fas fa-school"></i> I went to school at
                            </h4>
                            <div className="education-entries">
                                {schools.map((school, index) => (
                                    <div key={index} className="education-entry">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={school}
                                            onChange={(e) => handleSchoolChange(index, e.target.value)}
                                            placeholder="Enter school name"
                                            disabled={!isEditMode}
                                        />
                                        {isEditMode && schools.length > 1 && (
                                            <button 
                                                type="button" 
                                                className="btn-remove"
                                                onClick={() => removeSchool(index)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditMode && (
                                    <button type="button" className="btn-add" onClick={addSchool}>
                                        <i className="fas fa-plus"></i> Add Another School
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="education-subsection">
                            <h4>
                                <i className="fas fa-university"></i> I'm Currently Studying
                            </h4>
                            <div className="education-entries">
                                {currentStudies.map((study, index) => (
                                    <div key={index} className="education-entry">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={study}
                                            onChange={(e) => handleStudyChange(index, e.target.value)}
                                            placeholder="Enter what you're studying"
                                            disabled={!isEditMode}
                                        />
                                        {isEditMode && currentStudies.length > 1 && (
                                            <button 
                                                type="button" 
                                                className="btn-remove"
                                                onClick={() => removeStudy(index)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditMode && (
                                    <button type="button" className="btn-add" onClick={addStudy}>
                                        <i className="fas fa-plus"></i> Add Another Course
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="form-submit-container">
                            <button type="submit" className="submit-button">
                                <i className="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default TutorAccountSettings;
