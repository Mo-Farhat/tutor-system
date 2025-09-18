import React, { useState, useRef, useEffect } from "react";

const VideoRecorder = ({ onVideoReady, onError, className = "" }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Clean up blob URL
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [videoBlobUrl]);

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      // Log supported formats for debugging
      const supportedFormats = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4;codecs=h264,aac",
        "video/mp4;codecs=h264",
        "video/mp4",
      ];

      console.log("Browser codec support:");
      supportedFormats.forEach((format) => {
        console.log(
          `${format}: ${MediaRecorder.isTypeSupported(format) ? "✅" : "❌"}`
        );
      });

      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      streamRef.current = stream;

      // Debug: Log stream tracks
      console.log(
        "Stream tracks:",
        stream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        }))
      );

      // Set up video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Set up MediaRecorder with fallback codecs
      let mediaRecorder;
      const codecOptions = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4;codecs=h264,aac",
        "video/mp4;codecs=h264",
        "video/mp4",
      ];

      let selectedMimeType = null;
      for (const mimeType of codecOptions) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error("No supported video codec found");
      }

      console.log("Using codec:", selectedMimeType);

      // Try to create MediaRecorder with the selected codec
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
        });
      } catch (codecError) {
        console.warn(
          "Failed with selected codec, trying fallback:",
          codecError
        );

        // Fallback: try without specific codecs
        const fallbackOptions = ["video/webm", "video/mp4"];
        for (const fallback of fallbackOptions) {
          if (MediaRecorder.isTypeSupported(fallback)) {
            try {
              mediaRecorder = new MediaRecorder(stream, {
                mimeType: fallback,
              });
              selectedMimeType = fallback;
              console.log("Using fallback codec:", fallback);
              break;
            } catch (e) {
              continue;
            }
          }
        }

        if (!mediaRecorder) {
          // Last resort: try video-only recording
          console.warn("Trying video-only recording as last resort");
          try {
            const videoOnlyStream = new MediaStream();
            stream.getVideoTracks().forEach((track) => {
              videoOnlyStream.addTrack(track);
            });

            mediaRecorder = new MediaRecorder(videoOnlyStream, {
              mimeType: "video/webm",
            });
            selectedMimeType = "video/webm";
            console.log("Using video-only recording");
          } catch (videoOnlyError) {
            throw new Error(
              "Unable to create MediaRecorder with any supported format. Your browser may not support video recording."
            );
          }
        }
      }

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(
            "Recording data chunk:",
            event.data.size,
            "bytes, type:",
            event.data.type
          );
          recordedChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: selectedMimeType,
        });

        console.log("Final blob created:", {
          size: blob.size,
          type: blob.type,
          chunks: recordedChunksRef.current.length,
        });

        // Create a File object with proper extension for backend validation
        const fileExtension = selectedMimeType.includes("webm")
          ? ".webm"
          : ".mp4";
        const fileName = `video-submission-${Date.now()}${fileExtension}`;
        const file = new File([blob], fileName, { type: selectedMimeType });

        console.log("File created for submission:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // Create blob URL for preview
        const blobUrl = URL.createObjectURL(blob);

        // Clean up previous blob URL if it exists
        if (videoBlobUrl) {
          URL.revokeObjectURL(videoBlobUrl);
        }

        setVideoBlobUrl(blobUrl);
        setHasVideo(true);
        onVideoReady(file); // Pass File object instead of Blob
        stopAllTracks();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Unable to access camera/microphone. Please check permissions.");
      onError && onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const reRecord = () => {
    setHasVideo(false);
    setRecordingTime(0);
    stopAllTracks();

    // Clean up blob URL
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
      setVideoBlobUrl(null);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={`video-recorder ${className}`}>
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!hasVideo && (
        <div className="mb-3">
          <div className="video-preview-container position-relative">
            <video
              ref={videoRef}
              autoPlay
              muted={true}
              playsInline
              className="w-100 rounded"
              style={{
                maxHeight: "400px",
                backgroundColor: "#f8f9fa",
                border: "2px solid #dee2e6",
              }}
            />
            {isRecording && (
              <div className="position-absolute top-0 start-0 m-3">
                <span className="badge bg-danger">
                  <i className="fas fa-circle me-1"></i>
                  REC {formatTime(recordingTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {hasVideo && videoBlobUrl && (
        <div className="mb-3">
          <div className="video-preview-container">
            <video
              ref={videoRef}
              src={videoBlobUrl}
              controls
              muted={false}
              playsInline
              className="w-100 rounded"
              style={{
                maxHeight: "400px",
                backgroundColor: "#f8f9fa",
                border: "2px solid #28a745",
              }}
              onError={(e) => {
                console.warn("Video playback error:", e);
                setError(
                  "Video preview failed to load. The recording was successful but preview is unavailable."
                );
              }}
              onLoadStart={() => {
                console.log("Video loading started");
              }}
              onCanPlay={() => {
                console.log("Video can play");
              }}
            />
          </div>
        </div>
      )}

      <div className="d-flex gap-2 flex-wrap">
        {!hasVideo && !isRecording && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={startRecording}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Starting...
              </>
            ) : (
              <>
                <i className="fas fa-video me-2"></i>
                Start Recording
              </>
            )}
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={stopRecording}
          >
            <i className="fas fa-stop me-2"></i>
            Stop Recording
          </button>
        )}

        {hasVideo && (
          <button type="button" className="btn btn-warning" onClick={reRecord}>
            <i className="fas fa-redo me-2"></i>
            Re-record
          </button>
        )}
      </div>

      <div className="form-text mt-2">
        <i className="fas fa-info-circle me-1"></i>
        Format: WebM/MP4 | Max duration: 2 minutes | Make sure you're in a
        well-lit area
      </div>
    </div>
  );
};

export default VideoRecorder;
