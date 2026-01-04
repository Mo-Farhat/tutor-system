import "../../../../css/dashboards/tutor/profile/profile.css";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useSubjects } from "../../../../contexts/SubjectsContext";
import profileService from "../../../../services/profileService";
import authService from "../../../../services/authService";
import VideoRecorder from "./VideoRecorder";

function TutorProfile() {
  const { user } = useAuth();
  const { getYearLevels, getCurriculaFor, getSubjectsFor, isLoading: subjectsLoading } = useSubjects();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completionStatus, setCompletionStatus] = useState(null);

  // Edit mode and change request states
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changeDescription, setChangeDescription] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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
    paypalEmail: "",
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
  const [existingIntroVideoUrl, setExistingIntroVideoUrl] = useState(null);
  const [introVideoStatus, setIntroVideoStatus] = useState('none');
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [tutorContractFile, setTutorContractFile] = useState(null);
  const [wwccFile, setWwccFile] = useState(null);
  const [wwccExpiry, setWwccExpiry] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  
  // Availability toggle states
  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Fetch profile data, pending changes, and uploaded documents on component mount or when user changes
  useEffect(() => {
    // Only fetch if user is loaded
    if (user?.username) {
      fetchProfileData();
      checkPendingChanges();
      fetchUploadedDocuments();
    }
  }, [user]);

  // Fetch already-uploaded documents from the server
  const fetchUploadedDocuments = async () => {
    try {
      console.log('🔍 Fetching uploaded documents...');
      const response = await authService.getTutorDocuments();
      console.log('📄 getTutorDocuments response:', response);
      
      // Handle different response structures
      let documents = [];
      if (response?.success && Array.isArray(response.data)) {
        documents = response.data;
      } else if (response?.data && Array.isArray(response.data)) {
        documents = response.data;
      } else if (Array.isArray(response)) {
        documents = response;
      }
      
      console.log('✅ Parsed documents:', documents);
      setUploadedDocuments(documents);
      
      // Find WWCC document and set expiry date if available
      const wwccDoc = documents.find(doc => doc.type === 'wwcc');
      if (wwccDoc?.expiresAt) {
        // Format date for input[type="date"] (YYYY-MM-DD)
        const expiryDate = new Date(wwccDoc.expiresAt).toISOString().split('T')[0];
        setWwccExpiry(expiryDate);
      }
    } catch (err) {
      console.error("❌ Error fetching uploaded documents:", err);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      setError(''); // Clear any previous errors

      const username = user?.username;
      console.log('Fetching profile for username:', username);

      // Add auth header to fetch request
      const token = authService.getAccessToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/profile/?username=${username}`, {
        headers
      });
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      if (data.success) {
        // Get application data for pre-filling (if available)
        const applicationData = data.data.application;

        // Merge application data into profile data where profile fields are empty
        const mergedProfileData = {
          ...data.data,
          // Merge ATAR if profile doesn't have it but application does
          atar: data.data.atar || (applicationData?.atar ? parseFloat(applicationData.atar) : null),
        };

        setProfileData(mergedProfileData);
        
        // Set availability status from API
        setIsFullyBooked(data.data.is_fully_booked || false);

        // Update form data with real user data, using application data as fallback
        const userData = data.data.user;
        console.log("User data from API:", userData);
        console.log("First name:", userData.first_name, "Last name:", userData.last_name);

        // Build fullName - handle both snake_case and camelCase, and handle empty values
        const firstName = userData.first_name || userData.firstName || "";
        const lastName = userData.last_name || userData.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();

        console.log("Computed fullName:", fullName);

        const newFormData = {
          fullName: fullName || applicationData?.fullName || "",
          email: userData.email || "",
          username: userData.username || "",
          // Use profile phone_number, fallback to application phone
          phoneNumber: data.data.phone_number || applicationData?.phone || "",
          // Use profile bio, fallback to application motivation
          bio: data.data.bio || applicationData?.motivation || "",
          hourly_rate: data.data.hourly_rate || "",
          // Use profile university, fallback to application currentStudy
          university: data.data.university || applicationData?.currentStudy || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          // Use payment info from API if available
          abnNumber: data.data.paymentInfo?.abnNumber || "",
          paymentMethod: data.data.paymentInfo?.paymentMethod || "bank",
          accountName: data.data.paymentInfo?.accountName || "",
          bsb: data.data.paymentInfo?.bsb || "",
          accountNumber: data.data.paymentInfo?.accountNumber || "",
          paypalEmail: data.data.paymentInfo?.paypalEmail || "",
        };

        console.log("Setting form data:", newFormData);
        console.log("Phone number from API:", data.data.phone_number);
        console.log("Application data:", applicationData);
        setFormData(newFormData);

        // Set locations - use profile data, fallback to application currentState
        const profileLocations = data.data.preferred_locations || data.data.locations || [];
        const applicationLocations = applicationData?.currentState ? [applicationData.currentState] : [];
        setSelectedLocations(
          profileLocations.length > 0 ? profileLocations : applicationLocations
        );

        // Set subjects - use profile data, fallback to parsing application subjectsToTutor
        const profileSubjects = data.data.subjects_selected || data.data.subjects || [];
        let subjectsToUse = profileSubjects;

        // If no profile subjects but application has subjectsToTutor, parse it
        if (profileSubjects.length === 0 && applicationData?.subjectsToTutor) {
          // subjectsToTutor is typically a string, may need parsing
          // For now, create a basic subject entry
          const subjectStr = applicationData.subjectsToTutor;
          if (typeof subjectStr === 'string' && subjectStr.trim()) {
            subjectsToUse = [{
              year_level: "",
              curriculum: "",
              subject: subjectStr
            }];
          }
        }

        setSubjectEntries(
          subjectsToUse.map((subject) => ({
            yearLevel: subject.year_level || "",
            curriculumOrState: subject.curriculum || "",
            subject: subject.subject || subject || "",
          }))
        );

        // Set current studies - use profile data, fallback to application currentStudy
        const profileStudies = data.data.current_studies || [];
        const applicationStudies = applicationData?.currentStudy ? [applicationData.currentStudy] : [];
        setCurrentStudies(
          profileStudies.length > 0 ? profileStudies : applicationStudies
        );

        // Set schools
        setSchools(data.data.schools_attended || []);

        // Set existing intro video URL if available
        if (data.data.intro_video_path) {
          setExistingIntroVideoUrl(data.data.intro_video_path);
        }
        
        // Set intro video status
        if (data.data.intro_video_status) {
          setIntroVideoStatus(data.data.intro_video_status);
        }

        // Set existing photo URL if available
        if (data.data.photo_url) {
          setExistingPhotoUrl(data.data.photo_url);
        }

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

  // Handle availability toggle
  const handleAvailabilityToggle = async () => {
    try {
      setAvailabilityLoading(true);
      const newStatus = !isFullyBooked;
      
      const token = authService.getAccessToken();
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/availability`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ is_fully_booked: newStatus }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setIsFullyBooked(newStatus);
      } else {
        console.error('Failed to update availability:', data.message);
        alert('Failed to update availability. Please try again.');
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      alert('Error updating availability. Please try again.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Check for pending change requests
  const checkPendingChanges = async () => {
    try {
      const token = authService.getAccessToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/tutor/profile/pending-changes`, {
        headers
      });

      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setPendingChanges(data.data[0]);
      } else {
        setPendingChanges(null);
      }
    } catch (err) {
      console.error('Error checking pending changes:', err);
    }
  };

  // Enter edit mode (only if no pending changes and profile is complete)
  const handleEditProfile = () => {
    if (pendingChanges) {
      alert('You have pending changes awaiting admin approval. Please wait for review before making additional changes.');
      return;
    }
    setIsEditMode(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }

    fetchProfileData(); // Reload original data
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  // Submit changes for review
  const handleSubmitForReview = () => {
    setShowSubmitModal(true);
  };

  // Confirm and submit changes
  const confirmSubmitForReview = async () => {
    try {
      setSubmitLoading(true);

      const profileData = {
        bio: formData.bio,
        hourly_rate: parseFloat(formData.hourly_rate) || 45.0,
        university: formData.university,
        current_studies: currentStudies,
        subjects_selected: subjectEntries.map((entry) => ({
          year_level: entry.yearLevel,
          curriculum: entry.curriculumOrState,
          subject: entry.subject,
        })),
        preferred_locations: selectedLocations,
        schools_attended: schools,
        phone_number: formData.phoneNumber,
      };

      const token = authService.getAccessToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/tutor/profile/submit-changes`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          profileData,
          changeDescription
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile changes submitted successfully! Your changes will be reviewed by an administrator.');
        setIsEditMode(false);
        setShowSubmitModal(false);
        setChangeDescription('');
        setHasUnsavedChanges(false);
        await checkPendingChanges(); // Refresh pending changes
      } else {
        alert(`Failed to submit changes: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error submitting changes:', err);
      alert('Failed to submit changes. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Track unsaved changes
    if (isEditMode) {
      setHasUnsavedChanges(true);
    }

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
    const entry = { ...updatedEntries[index], [field]: value };
    
    // Cascade clearing: when yearLevel changes, clear curriculum and subject
    if (field === "yearLevel") {
      entry.curriculumOrState = "";
      entry.subject = "";
    }
    // When curriculum changes, clear subject
    if (field === "curriculumOrState") {
      entry.subject = "";
    }
    
    updatedEntries[index] = entry;
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
          // Upload video file immediately
          handleVideoFileUpload(file);
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

  // Handle video file upload (for file input, not recorded video)
  const handleVideoFileUpload = async (videoFile) => {
    try {
      setVideoUploadLoading(true);
      setIntroVideo(videoFile); // Show the file name in UI
      
      const token = authService.getAccessToken();
      if (!token) {
        alert('You must be logged in to upload a video');
        setIntroVideo(null);
        return;
      }

      // Create FormData with the video file
      const formDataUpload = new FormData();
      formDataUpload.append('videoIntro', videoFile);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/upload/video-intro`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        }
      );

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            // Non-JSON response (likely HTML error page)
            const textError = await response.text();
            console.error('Server returned non-JSON response:', textError.substring(0, 500));
            
            // Check for common issues
            if (response.status === 413) {
              errorMessage = 'Video file is too large. Please upload a smaller file (max 50MB recommended).';
            } else if (response.status === 504 || response.status === 408) {
              errorMessage = 'Upload timed out. Please try a smaller file or check your connection.';
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        alert(`Failed to upload video: ${errorMessage}`);
        setIntroVideo(null);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setExistingIntroVideoUrl(result.videoUrl);
        setIntroVideoStatus('pending');
        setIntroVideo(null);
        alert('Video uploaded successfully! It is now pending admin review.');
      } else {
        alert(`Failed to upload video: ${result.error || 'Unknown error'}`);
        setIntroVideo(null);
      }
    } catch (err) {
      console.error('Error uploading video file:', err);
      // Check for network errors
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert('Failed to upload video. Please try again.');
      }
      setIntroVideo(null);
    } finally {
      setVideoUploadLoading(false);
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    try {
      setPhotoUploadLoading(true);
      setProfilePhoto(file);
      
      const token = authService.getAccessToken();
      if (!token) {
        alert('You must be logged in to upload a photo');
        setProfilePhoto(null);
        return;
      }

      // Create FormData with the photo file
      const formDataUpload = new FormData();
      formDataUpload.append('photo', file);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/upload/photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        }
      );

      const result = await response.json();

      if (result.success) {
        setExistingPhotoUrl(result.photoUrl);
        setProfilePhoto(null);
        alert('Profile photo uploaded successfully!');
      } else {
        alert(`Failed to upload photo: ${result.error || 'Unknown error'}`);
        setProfilePhoto(null);
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Failed to upload photo. Please try again.');
      setProfilePhoto(null);
    } finally {
      setPhotoUploadLoading(false);
    }
  };

  const removeIntroVideo = () => {
    setIntroVideo(null);
  };

  // Handle recorded video upload from VideoRecorder
  const handleRecordedVideoUpload = async (videoBlob) => {
    try {
      setVideoUploadLoading(true);
      const token = authService.getAccessToken();
      
      if (!token) {
        alert('You must be logged in to upload a video');
        return;
      }

      // Create FormData with the video blob
      const formDataUpload = new FormData();
      const fileName = `recorded-intro-${Date.now()}.webm`;
      const videoFile = new File([videoBlob], fileName, { type: videoBlob.type || 'video/webm' });
      formDataUpload.append('videoIntro', videoFile);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/upload/video-intro`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        }
      );

      const result = await response.json();

      if (result.success) {
        setExistingIntroVideoUrl(result.videoUrl);
        setIntroVideoStatus('pending');
        setIntroVideo(null);
        alert('Video uploaded successfully! It is now pending admin review.');
      } else {
        alert(`Failed to upload video: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error uploading recorded video:', err);
      alert('Failed to upload video. Please try again.');
    } finally {
      setVideoUploadLoading(false);
    }
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
      const username = user?.username;

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
        fullName: formData.fullName,
        bio: formData.bio,
        hourly_rate: parseFloat(formData.hourly_rate) || 45.0,
        university: formData.university || "",
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
        // Add payment fields
        abnNumber: formData.abnNumber,
        paymentMethod: formData.paymentMethod,
        accountName: formData.accountName,
        bsb: formData.bsb,
        accountNumber: formData.accountNumber,
        paypalEmail: formData.paypalEmail,
      };


      // Get auth token for the request
      const token = authService.getAccessToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/profile/?username=${username}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updateData)
      });


      const data = await response.json();

      if (data.success) {
        alert("Profile updated successfully!");
        // Reset local doc state after successful upload/save
        setTutorContractFile(null);
        setWwccFile(null);
        // Refresh the data including completion status and documents
        fetchProfileData();
        fetchUploadedDocuments(); // Refresh uploaded documents display
        // Dispatch event to notify navbar to refresh
        window.dispatchEvent(new CustomEvent('profileUpdated'));
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

              {/* Live Profile Notice - Changes Go to Admin Review */}
              {profileData?.is_live && (
                <div className="tutor-profile-live-notice">
                  <div className="alert alert-info d-flex align-items-start" role="alert">
                    <div className="live-notice-icon me-3">
                      <i className="fas fa-shield-alt fa-2x"></i>
                    </div>
                    <div className="live-notice-content">
                      <h5 className="alert-heading mb-1">
                        <i className="fas fa-broadcast-tower me-2"></i>
                        Your Profile is Live
                      </h5>
                      <p className="mb-2">
                        Your profile is now visible to students. To maintain quality standards, 
                        <strong> any changes you make will be submitted for admin review</strong> before appearing on your public profile.
                      </p>
                      <div className="live-notice-steps">
                        <small className="text-muted">
                          <i className="fas fa-edit me-1"></i> Make edits → 
                          <i className="fas fa-paper-plane mx-1"></i> Submit for review → 
                          <i className="fas fa-check-circle mx-1"></i> Admin approves → 
                          <i className="fas fa-eye mx-1"></i> Changes go live
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Availability Status Toggle */}
              <div className="tutor-profile-section">
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h3 className="mb-2">
                          <i className="fas fa-calendar-check me-2"></i>
                          Availability Status
                        </h3>
                        <p className="text-muted mb-0">
                          Toggle this to let students know if you're accepting new bookings.
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className={`badge ${isFullyBooked ? 'bg-danger' : 'bg-success'} fs-6`}>
                          {isFullyBooked ? '🔴 Fully Booked' : '🟢 Available Now'}
                        </span>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="availability-toggle"
                            checked={isFullyBooked}
                            onChange={handleAvailabilityToggle}
                            disabled={availabilityLoading}
                            style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                          />
                          <label className="form-check-label visually-hidden" htmlFor="availability-toggle">
                            Toggle availability
                          </label>
                        </div>
                        {availabilityLoading && (
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <small className="text-muted d-block mt-2">
                      <i className="fas fa-info-circle me-1"></i>
                      When "Fully Booked" is enabled, students will see that you are not accepting new requests.
                    </small>
                  </div>
                </div>
              </div>

              {/* Profile Summary Section */}
              <div className="tutor-profile-section">
                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="tutor-profile-summary">
                        <div className="tutor-profile-avatar">
                          {existingPhotoUrl ? (
                            <img 
                              src={existingPhotoUrl} 
                              alt="Profile" 
                              className="tutor-profile-avatar-img"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="tutor-profile-avatar-placeholder" 
                            style={{ display: existingPhotoUrl ? 'none' : 'flex' }}
                          >
                            <i className="fas fa-user"></i>
                          </div>
                          <label
                            htmlFor="profile-upload"
                            className="tutor-profile-avatar-upload"
                          >
                            {photoUploadLoading ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Uploading...</span>
                              </div>
                            ) : (
                              <i className="fas fa-camera"></i>
                            )}
                            <input
                              type="file"
                              id="profile-upload"
                              className="d-none"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handlePhotoUpload}
                              disabled={photoUploadLoading}
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
                      <div className="d-flex gap-2 align-items-start">
                        {!isEditMode && !pendingChanges && (
                          <button
                            className="btn btn-dark tutor-profile-edit-btn"
                            onClick={handleEditProfile}
                          >
                            <i className="fas fa-pencil-alt me-2"></i> Edit Profile
                          </button>
                        )}

                        {isEditMode && (
                          <>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={handleCancelEdit}
                            >
                              <i className="fas fa-times me-2"></i> Cancel
                            </button>
                            <button
                              className="btn btn-success"
                              onClick={handleSubmitForReview}
                            >
                              <i className="fas fa-check me-2"></i> Submit for Review
                            </button>
                          </>
                        )}

                        {pendingChanges && (
                          <div className="alert alert-warning mb-0 py-2">
                            <i className="fas fa-clock me-2"></i>
                            <strong>Pending Changes</strong> - Awaiting admin review
                            <br />
                            <small>Submitted {new Date(pendingChanges.createdAt).toLocaleDateString()}</small>
                          </div>
                        )}
                      </div>
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
                  {!isEditMode && profileData?.is_live && (
                    <span className="text-muted ms-2">
                      <i className="fas fa-lock me-1"></i>
                      Profile is live - Click "Edit Profile" to make changes
                    </span>
                  )}
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
                            disabled={!isEditMode && profileData?.is_live}
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
                            disabled={!isEditMode && profileData?.is_live}
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
                            disabled={!isEditMode && profileData?.is_live}
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
                        disabled={!isEditMode && profileData?.is_live}
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
                            disabled={subjectsLoading}
                          >
                            <option value="">Select Year Level</option>
                            {getYearLevels().map((yearLevel) => (
                              <option key={yearLevel} value={yearLevel}>
                                {yearLevel}
                              </option>
                            ))}
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
                            disabled={!entry.yearLevel || subjectsLoading}
                          >
                            <option value="">Select Curriculum</option>
                            {entry.yearLevel && getCurriculaFor(entry.yearLevel).map((curriculum) => (
                              <option key={curriculum} value={curriculum}>
                                {curriculum}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Subject</label>
                          <select
                            className="form-select"
                            value={entry.subject}
                            onChange={(e) =>
                              updateSubjectEntry(
                                index,
                                "subject",
                                e.target.value
                              )
                            }
                            disabled={!entry.curriculumOrState || subjectsLoading}
                          >
                            <option value="">Select Subject</option>
                            {entry.yearLevel && entry.curriculumOrState && 
                              getSubjectsFor(entry.curriculumOrState, entry.yearLevel).map((subject) => (
                                <option key={subject} value={subject}>
                                  {subject}
                                </option>
                              ))
                            }
                          </select>
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
                              className={`form-control ${passwordErrors.currentPassword ? "is-invalid" : ""
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
                                className={`fas fa-${showPasswords.currentPassword
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
                              className={`form-control ${passwordErrors.newPassword ? "is-invalid" : ""
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
                                className={`fas fa-${showPasswords.newPassword
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
                              className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""
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
                                className={`fas fa-${showPasswords.confirmPassword
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

                    {formData.paymentMethod === "paypal" && (
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="paypalEmail" className="form-label">
                              PayPal Email Address
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="paypalEmail"
                              name="paypalEmail"
                              value={formData.paypalEmail || ""}
                              onChange={handleInputChange}
                              placeholder="Enter your PayPal email address"
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
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h2 className="tutor-profile-section-title mb-0">
                    Video Introduction
                  </h2>
                  {/* Video Status Badge */}
                  {introVideoStatus && introVideoStatus !== 'none' && (
                    <span className={`badge ${
                      introVideoStatus === 'pending' ? 'bg-warning text-dark' :
                      introVideoStatus === 'approved' ? 'bg-success' :
                      introVideoStatus === 'rejected' ? 'bg-danger' : ''
                    }`}>
                      <i className={`fas ${
                        introVideoStatus === 'pending' ? 'fa-clock' :
                        introVideoStatus === 'approved' ? 'fa-check-circle' :
                        introVideoStatus === 'rejected' ? 'fa-times-circle' : ''
                      } me-1`}></i>
                      {introVideoStatus === 'pending' ? 'Pending Review' :
                       introVideoStatus === 'approved' ? 'Approved' :
                       introVideoStatus === 'rejected' ? 'Rejected' : ''}
                    </span>
                  )}
                </div>
                <p className="tutor-profile-section-description">
                  Upload or record a short video introducing yourself to potential students.
                  Videos are reviewed before appearing on your public profile.
                </p>

                <div className="tutor-profile-card">
                  <div className="tutor-profile-card-body">
                    {videoUploadLoading && (
                      <div className="alert alert-info d-flex align-items-center mb-4">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Uploading video... Please wait.
                      </div>
                    )}
                    
                    {introVideoStatus === 'rejected' && (
                      <div className="alert alert-warning mb-4">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Your video was not approved. Please upload a new video following our guidelines.
                      </div>
                    )}

                    {/* VideoRecorder Component - handles both recording and shows existing video */}
                    <VideoRecorder
                      existingVideoUrl={existingIntroVideoUrl}
                      videoStatus={introVideoStatus}
                      onVideoReady={(blob, url) => {
                        console.log('Video ready:', { blob, url });
                      }}
                      onUpload={handleRecordedVideoUpload}
                    />

                    {/* File Upload Option (shown in Upload tab of VideoRecorder) */}
                    <div className="tutor-profile-upload-area mt-3">
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
                            <h5>{existingIntroVideoUrl ? 'Upload New Video' : 'Upload Video Introduction'}</h5>
                            <p className="text-muted">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-muted small">
                              MP4, WebM, AVI up to 100MB
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
                      {/* Tutor Contract */}
                      <div className="col-md-6">
                        <div className="tutor-profile-upload-area">
                          <label className="form-label">Tutor Contract</label>
                          {(() => {
                            const existingContract = uploadedDocuments.find(doc => doc.type === 'contract');
                            const hasExisting = !!existingContract && !tutorContractFile;
                            
                            if (tutorContractFile) {
                              // User selected a new file to upload
                              return (
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
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              );
                            } else if (hasExisting) {
                              // Document already uploaded - show clean status
                              return (
                                <div className="d-flex flex-column align-items-center p-4 border rounded bg-light">
                                  <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-check-circle text-success fa-2x me-2"></i>
                                    <span className="fw-bold text-success">Uploaded</span>
                                  </div>
                                  <small className="text-muted mb-3">
                                    Uploaded on {new Date(existingContract.uploadedAt).toLocaleDateString('en-AU')}
                                  </small>
                                  <label 
                                    htmlFor="tutor-contract-upload"
                                    className="btn btn-outline-secondary btn-sm"
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <i className="fas fa-sync-alt me-1"></i>
                                    Replace Document
                                  </label>
                                  <input
                                    type="file"
                                    className="d-none"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileUpload(e, "tutorContract")}
                                    id="tutor-contract-upload"
                                  />
                                </div>
                              );
                            } else {
                              // No document - show upload UI
                              return (
                                <div className="tutor-profile-upload-placeholder">
                                  <input
                                    type="file"
                                    className="tutor-profile-file-input"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileUpload(e, "tutorContract")}
                                    id="tutor-contract-upload"
                                  />
                                  <label
                                    htmlFor="tutor-contract-upload"
                                    className="tutor-profile-upload-label"
                                  >
                                    <i className="fas fa-file-pdf fa-2x mb-2"></i>
                                    <p className="mb-0">Upload Tutor Contract</p>
                                    <p className="text-muted small">PDF, DOC, DOCX</p>
                                  </label>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>

                      {/* WWCC */}
                      <div className="col-md-6">
                        <div className="tutor-profile-upload-area">
                          <label className="form-label">Working with Children Check</label>
                          {(() => {
                            const existingWWCC = uploadedDocuments.find(doc => doc.type === 'wwcc');
                            const hasExisting = !!existingWWCC && !wwccFile;
                            
                            if (wwccFile) {
                              // User selected a new file to upload
                              return (
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
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              );
                            } else if (hasExisting) {
                              // Document already uploaded - show clean status
                              return (
                                <div className="d-flex flex-column align-items-center p-4 border rounded bg-light">
                                  <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-check-circle text-success fa-2x me-2"></i>
                                    <span className="fw-bold text-success">Uploaded</span>
                                  </div>
                                  <small className="text-muted mb-3">
                                    Uploaded on {new Date(existingWWCC.uploadedAt).toLocaleDateString('en-AU')}
                                  </small>
                                  <label 
                                    htmlFor="wwcc-upload"
                                    className="btn btn-outline-secondary btn-sm"
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <i className="fas fa-sync-alt me-1"></i>
                                    Replace Document
                                  </label>
                                  <input
                                    type="file"
                                    className="d-none"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileUpload(e, "wwcc")}
                                    id="wwcc-upload"
                                  />
                                </div>
                              );
                            } else {
                              // No document - show upload UI
                              return (
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
                                    <p className="text-muted small">PDF, DOC, DOCX</p>
                                  </label>
                                </div>
                              );
                            }
                          })()}
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

      {/* Submit for Review Modal */}
      {showSubmitModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Profile Changes for Review</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Your profile changes will be submitted to an administrator for review.
                  Please provide a brief description of what you've changed:
                </p>
                <div className="mb-3">
                  <label htmlFor="changeDescription" className="form-label">
                    Description of Changes
                  </label>
                  <textarea
                    id="changeDescription"
                    className="form-control"
                    rows="4"
                    value={changeDescription}
                    onChange={(e) => setChangeDescription(e.target.value)}
                    placeholder="e.g., Updated my bio to reflect new teaching experience, added new subjects..."
                    disabled={submitLoading}
                  />
                  <small className="text-muted">
                    This helps administrators understand what has changed in your profile.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmSubmitForReview}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Submit for Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorProfile;
