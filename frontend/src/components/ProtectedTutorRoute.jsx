import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedTutorRoute = ({ children, allowedRoutes = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const completionStatusCache = useRef(null);
  const lastFetchTime = useRef(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Routes that are always allowed (settings/profile page)
  const alwaysAllowedRoutes = [
    "/dashboard/tutor/profile",
    "/dashboard/tutor/settings",
  ];

  useEffect(() => {
    const checkCompletionStatus = async () => {
      // Check if we have a valid cache
      const now = Date.now();
      const isCacheValid = 
        completionStatusCache.current && 
        lastFetchTime.current && 
        (now - lastFetchTime.current) < CACHE_DURATION;

      // Use cache if valid and we're not on the profile page (profile page needs fresh data)
      if (isCacheValid && location.pathname !== "/dashboard/tutor/profile") {
        setCompletionStatus(completionStatusCache.current);
        setLoading(false);
        return;
      }

      // Otherwise, fetch fresh data
      try {
        setLoading(true);
        const username = user?.username || "notmanu23";
        const response = await fetch(
          `${
            process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
          }/api/auth/tutor/completion-status/?username=${username}`
        );
        const data = await response.json();

        if (data.success) {
          setCompletionStatus(data.data);
          // Update cache
          completionStatusCache.current = data.data;
          lastFetchTime.current = now;
        } else {
          console.error("Failed to get completion status:", data.message);
        }
      } catch (error) {
        console.error("Error checking completion status:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only refetch if user changes or coming from profile page
    const shouldRefetch = 
      !user || 
      location.pathname === "/dashboard/tutor/profile" ||
      !completionStatusCache.current;

    if (shouldRefetch) {
      checkCompletionStatus();
    } else {
      // Use cached data
      setCompletionStatus(completionStatusCache.current);
      setLoading(false);
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (!loading && completionStatus) {
      const currentPath = location.pathname;

      // If profile is not fully complete and user is not on an allowed route, redirect to settings
      if (
        !completionStatus.fully_complete &&
        !alwaysAllowedRoutes.includes(currentPath) &&
        !allowedRoutes.includes(currentPath)
      ) {
        navigate("/dashboard/tutor/profile", {
          replace: true,
          state: {
            message:
              "Please complete your profile and upload required documents before accessing other dashboard features.",
            completionStatus,
          },
        });
      }
    }
  }, [loading, completionStatus, location.pathname, navigate, allowedRoutes]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Checking profile completion...</p>
        </div>
      </div>
    );
  }

  // If profile is not complete and user is on a restricted route, show completion message
  // Only check after loading is complete AND completionStatus exists
  if (
    !loading &&
    completionStatus &&
    !completionStatus.fully_complete &&
    !alwaysAllowedRoutes.includes(location.pathname) &&
    !allowedRoutes.includes(location.pathname)
  ) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="card-title text-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Profile Incomplete
                </h3>
                <p className="card-text">
                  Please complete your profile and upload required documents
                  before accessing this feature.
                </p>

                {completionStatus && (
                  <div className="mt-4">
                    <h5>Missing Items:</h5>
                    <ul className="list-unstyled">
                      {completionStatus.missing_items.map((item, index) => (
                        <li key={index} className="text-danger">
                          <i className="fas fa-times me-2"></i>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="btn btn-primary mt-3"
                  onClick={() => navigate("/dashboard/tutor/profile")}
                >
                  <i className="fas fa-edit me-2"></i>
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedTutorRoute;
