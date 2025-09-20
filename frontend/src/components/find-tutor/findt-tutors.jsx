import { useState, useRef, useEffect } from "react";
import { getLiveTutors } from "../../services/authService";
import "../../css/find-tutor/findt-tutors.css";

function FindtTutors({ filters }) {
  const [allTutors, setAllTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLiveTutors();
  }, []);

  // Apply filters when filters prop changes
  useEffect(() => {
    applyFilters();
  }, [filters, allTutors]);

  const fetchLiveTutors = async () => {
    try {
      setLoading(true);
      const result = await getLiveTutors();

      if (result.success) {
        const tutorsData = result.data.data?.tutors || result.data.tutors || [];
        console.log("Fetched tutors:", tutorsData);
        setAllTutors(tutorsData);
        setFilteredTutors(tutorsData);
      } else {
        setError(result.error || "Failed to load tutors");
      }
    } catch (err) {
      setError("Error loading tutors: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (
      !filters ||
      (!filters.yearLevel &&
        !filters.curriculum &&
        !filters.subject &&
        !filters.location)
    ) {
      // No filters applied, show all tutors
      setFilteredTutors(allTutors);
      return;
    }

    const filtered = allTutors.filter((tutor) => {
      // Check location filter
      if (filters.location) {
        const tutorLocations = tutor.preferred_locations || [];
        const hasLocation = tutorLocations.some((location) =>
          location.toLowerCase().includes(filters.location.toLowerCase())
        );
        if (!hasLocation) return false;
      }

      // Check subject-related filters (year level, curriculum, subject)
      if (filters.yearLevel || filters.curriculum || filters.subject) {
        const tutorSubjects = tutor.subjects || [];

        // If specific subject is selected, look for exact match
        if (filters.subject && filters.yearLevel && filters.curriculum) {
          const targetSubject = `${filters.subject} - ${filters.yearLevel} (${filters.curriculum})`;
          const hasExactSubject = tutorSubjects.some(
            (subject) => subject === targetSubject
          );
          if (!hasExactSubject) return false;
        }
        // If only year level is selected
        else if (filters.yearLevel && !filters.curriculum && !filters.subject) {
          const hasYearLevel = tutorSubjects.some((subject) =>
            subject.includes(` - ${filters.yearLevel} (`)
          );
          if (!hasYearLevel) return false;
        }
        // If year level and curriculum/state are selected but no specific subject
        else if (filters.yearLevel && filters.curriculum && !filters.subject) {
          const hasYearAndCurriculum = tutorSubjects.some((subject) =>
            subject.includes(` - ${filters.yearLevel} (${filters.curriculum})`)
          );
          if (!hasYearAndCurriculum) return false;
        }
        // If only curriculum is selected (less common case)
        else if (filters.curriculum && !filters.yearLevel && !filters.subject) {
          const hasCurriculum = tutorSubjects.some((subject) =>
            subject.includes(`(${filters.curriculum})`)
          );
          if (!hasCurriculum) return false;
        }
        // If only subject name is selected (partial match)
        else if (filters.subject && !filters.yearLevel && !filters.curriculum) {
          const hasSubject = tutorSubjects.some((subject) =>
            subject.toLowerCase().includes(filters.subject.toLowerCase())
          );
          if (!hasSubject) return false;
        }
      }

      return true;
    });

    setFilteredTutors(filtered);
  };

  const getDefaultImage = (name) => {
    // Generate a consistent avatar based on the tutor's name
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarId = (seed % 99) + 1;
    const gender = seed % 2 === 0 ? "women" : "men";
    return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
  };

  if (loading) {
    return (
      <section
        className="row container-fluid d-flex g-0 findt-tutors-main"
        id="findt-tutors"
      >
        <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
          <div
            className="d-flex justify-content-center align-items-center w-100"
            style={{ minHeight: "400px" }}
          >
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading tutors...</span>
              </div>
              <p className="mt-3">Finding the best tutors for you...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="row container-fluid d-flex g-0 findt-tutors-main"
        id="findt-tutors"
      >
        <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
          <div className="alert alert-danger w-100" role="alert">
            {error}
            <button className="btn btn-primary ms-3" onClick={fetchLiveTutors}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (filteredTutors.length === 0 && allTutors.length > 0) {
    return (
      <section
        className="row container-fluid d-flex g-0 findt-tutors-main"
        id="findt-tutors"
      >
        <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
          <div
            className="text-center w-100"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <i className="fas fa-search fa-4x text-muted mb-3"></i>
              <h3>No tutors match your filters</h3>
              <p>Try adjusting your search criteria to find more tutors.</p>
              <p className="text-muted">
                Showing 0 of {allTutors.length} available tutors
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (allTutors.length === 0) {
    return (
      <section
        className="row container-fluid d-flex g-0 findt-tutors-main"
        id="findt-tutors"
      >
        <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
          <div
            className="text-center w-100"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <i className="fas fa-user-graduate fa-4x text-muted mb-3"></i>
              <h3>No tutors available</h3>
              <p>
                We're working on getting more tutors approved. Check back soon!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="row container-fluid d-flex g-0 findt-tutors-main"
      id="findt-tutors"
    >
      <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
        <div className="row g-4 w-100">
          {filteredTutors.map((tutor) => (
            <div key={tutor.id} className="col-xl-3 col-lg-4 col-md-6 col-12">
              <a href={`/tutor/${tutor.id}`} className="findt-tutors-card">
                <div className="findt-tutors-stats">
                  <span className="findt-tutors-gold">
                    Gold ({tutor.goldPoints})
                  </span>
                  <span className="findt-tutors-atr">
                    ATAR ({tutor.atrPoints})
                  </span>
                </div>
                <div
                  className={`findt-tutors-avatar ${tutor.status.toLowerCase()}`}
                >
                  <img
                    src={tutor.image || getDefaultImage(tutor.name)}
                    alt={tutor.name}
                    onError={(e) => {
                      e.target.src = getDefaultImage(tutor.name);
                    }}
                  />
                  <span className="findt-tutors-status">{tutor.status}</span>
                </div>
                <h3 className="findt-tutors-name">{tutor.name}</h3>
                <p className="findt-tutors-description">
                  {tutor.bio ||
                    `${tutor.name} is a qualified tutor specializing in ${
                      tutor.subjects?.slice(0, 2).join(", ") ||
                      "various subjects"
                    }.`}
                </p>
                {tutor.hourly_rate && (
                  <div className="findt-tutors-rate mb-2">
                    <small className="text-success fw-bold">
                      <i className="fas fa-dollar-sign me-1"></i>$
                      {tutor.hourly_rate}/hr
                    </small>
                  </div>
                )}
                {tutor.university && (
                  <div className="findt-tutors-university mb-2">
                    <small className="text-muted">
                      <i className="fas fa-graduation-cap me-1"></i>
                      {tutor.university}
                    </small>
                  </div>
                )}
                {/* Display tutor's subjects and locations */}
                <div className="findt-tutors-details mt-2">
                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="mb-1">
                      <small className="text-muted">
                        <i className="fas fa-book me-1"></i>
                        {tutor.subjects
                          .slice(0, 2)
                          .map((subject) => {
                            // Extract just the subject name from the full format
                            const subjectName = subject.split(" - ")[0];
                            return subjectName;
                          })
                          .join(", ")}
                        {tutor.subjects.length > 2 &&
                          ` +${tutor.subjects.length - 2} more`}
                      </small>
                    </div>
                  )}
                  {tutor.preferred_locations &&
                    tutor.preferred_locations.length > 0 && (
                      <div>
                        <small className="text-muted">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {tutor.preferred_locations.slice(0, 2).join(", ")}
                          {tutor.preferred_locations.length > 2 &&
                            ` +${tutor.preferred_locations.length - 2} more`}
                        </small>
                      </div>
                    )}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FindtTutors;
