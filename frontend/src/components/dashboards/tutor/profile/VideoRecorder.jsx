import React, { useState, useRef, useCallback, useEffect } from 'react';
import './VideoRecorder.css';

/**
 * VideoRecorder Component
 * Provides camera recording functionality with preview and upload capabilities.
 * Falls back to file upload on older browsers that don't support MediaRecorder.
 */
const VideoRecorder = ({ onVideoReady, onUpload, existingVideoUrl, videoStatus }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'record'
  const [isSupported, setIsSupported] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const durationIntervalRef = useRef(null);

  // Check browser support on mount
  useEffect(() => {
    const checkSupport = () => {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
      setIsSupported(hasGetUserMedia && hasMediaRecorder);
    };
    checkSupport();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      await startCamera();
      return;
    }

    setError(null);
    chunksRef.current = [];
    
    try {
      // Try to use WebM format with VP8 codec (widely supported)
      let options = { mimeType: 'video/webm;codecs=vp8,opus' };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {};
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        setRecordedBlob(blob);
        setRecordedUrl(url);
        
        if (onVideoReady) {
          onVideoReady(blob, url);
        }
        
        stopCamera();
      };

      // Countdown before recording
      setCountdown(3);
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(0);

      mediaRecorder.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Track duration
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording. Please try again.');
    }
  }, [startCamera, stopCamera, onVideoReady]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration(d => d + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const retakeVideo = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingDuration(0);
    startCamera();
  }, [recordedUrl, startCamera]);

  const handleUploadRecording = useCallback(() => {
    if (recordedBlob && onUpload) {
      onUpload(recordedBlob);
    }
  }, [recordedBlob, onUpload]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (!videoStatus || videoStatus === 'none') return null;
    
    const statusConfig = {
      pending: { color: 'warning', icon: 'clock', text: 'Pending Review' },
      approved: { color: 'success', icon: 'check-circle', text: 'Approved' },
      rejected: { color: 'danger', icon: 'times-circle', text: 'Rejected' }
    };
    
    const config = statusConfig[videoStatus];
    if (!config) return null;
    
    return (
      <span className={`badge bg-${config.color} video-status-badge`}>
        <i className={`fas fa-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    // Clean up camera if switching away from record tab
    if (activeTab === 'record') {
      stopCamera();
    }
    
    setActiveTab(tab);
  };

  return (
    <div className="video-recorder">
      {/* Status Badge */}
      {getStatusBadge() && (
        <div className="video-status-container mb-3">
          {getStatusBadge()}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="video-recorder-tabs">
        <button
          className={`video-recorder-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => handleTabChange('upload')}
        >
          <i className="fas fa-cloud-upload-alt me-2"></i>
          Upload Video
        </button>
        <button
          className={`video-recorder-tab ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => handleTabChange('record')}
          disabled={!isSupported}
        >
          <i className="fas fa-video me-2"></i>
          Record Video
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Upload Tab Content */}
      {activeTab === 'upload' && (
        <div className="video-recorder-upload-section">
          {existingVideoUrl && (
            <div className="existing-video-preview mb-4">
              <h6 className="mb-3">
                <i className="fas fa-check-circle text-success me-2"></i>
                Current Video
              </h6>
              <div className="ratio ratio-16x9 mb-3" style={{ maxWidth: '500px' }}>
                <video controls src={existingVideoUrl}>
                  Your browser does not support video playback.
                </video>
              </div>
              <p className="text-muted small">Upload a new video below to replace the current one.</p>
            </div>
          )}
          {/* File upload is handled by parent component */}
          <div className="upload-hint">
            <p className="text-muted">
              <i className="fas fa-info-circle me-2"></i>
              Use the file upload area below to upload a pre-recorded video (MP4, WebM, AVI up to 100MB).
            </p>
          </div>
        </div>
      )}

      {/* Record Tab Content */}
      {activeTab === 'record' && (
        <div className="video-recorder-record-section">
          {!isSupported ? (
            <div className="browser-not-supported">
              <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
              <h5>Browser Not Supported</h5>
              <p className="text-muted">
                Your browser doesn't support camera recording. 
                Please use a modern browser like Chrome, Firefox, or Edge, 
                or use the "Upload Video" option instead.
              </p>
            </div>
          ) : (
            <>
              {/* Video Preview */}
              <div className="video-preview-container">
                {countdown > 0 && (
                  <div className="countdown-overlay">
                    <span className="countdown-number">{countdown}</span>
                  </div>
                )}
                
                {recordedUrl ? (
                  <video 
                    src={recordedUrl} 
                    controls 
                    className="recorded-video-preview"
                  />
                ) : (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className={`camera-preview ${isRecording ? 'recording' : ''}`}
                  />
                )}
                
                {isRecording && (
                  <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    <span className="recording-time">{formatDuration(recordingDuration)}</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="video-recorder-controls">
                {!cameraReady && !recordedUrl && (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={startCamera}
                  >
                    <i className="fas fa-camera me-2"></i>
                    Start Camera
                  </button>
                )}

                {cameraReady && !isRecording && !recordedUrl && (
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={startRecording}
                  >
                    <i className="fas fa-circle me-2"></i>
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <div className="recording-controls">
                    <button
                      className="btn btn-warning"
                      onClick={pauseRecording}
                    >
                      <i className={`fas fa-${isPaused ? 'play' : 'pause'} me-2`}></i>
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={stopRecording}
                    >
                      <i className="fas fa-stop me-2"></i>
                      Stop Recording
                    </button>
                  </div>
                )}

                {recordedUrl && (
                  <div className="recorded-controls">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={retakeVideo}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Retake
                    </button>
                    <button
                      className="btn btn-success btn-lg"
                      onClick={handleUploadRecording}
                    >
                      <i className="fas fa-cloud-upload-alt me-2"></i>
                      Upload Recording
                    </button>
                  </div>
                )}
              </div>

              {/* Recording Tips */}
              {!isRecording && !recordedUrl && (
                <div className="recording-tips mt-4">
                  <h6>Tips for a great intro video:</h6>
                  <ul className="text-muted small">
                    <li>Find a quiet, well-lit location</li>
                    <li>Keep it short (30-60 seconds)</li>
                    <li>Introduce yourself and your teaching style</li>
                    <li>Mention your subjects and experience</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
