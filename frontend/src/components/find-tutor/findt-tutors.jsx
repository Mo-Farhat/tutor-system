import { useState, useRef, useEffect, useCallback } from "react";
import { getLiveTutors } from "../../services/authService";
import "../../css/find-tutor/findt-tutors.css"

function FindtTutors({ filters }) {
    const [allTutors, setAllTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    console.log('🎨 FindtTutors render:', { 
        allTutorsLength: allTutors.length, 
        filteredTutorsLength: filteredTutors.length, 
        loading, 
        error: !!error,
        filtersApplied: !!filters,
        currentFilters: filters
    });

    useEffect(() => {
        console.log('📱 FindtTutors mounted, calling fetchLiveTutors');
        fetchLiveTutors();
    }, []);

    const fetchLiveTutors = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(''); // Clear any previous errors
            
            console.log('🔍 FindtTutors: Starting API call', { forceRefresh });
            
            const result = await getLiveTutors();
            
            console.log('🔍 FindtTutors: API result', result);
            
            if (result.success) {
                // Handle both shapes:
                // - Backend response: { success, data: { tutors: [...] } }
                // - Direct array (fallback)
                const tutorsData = result?.data?.data?.tutors
                    || result?.data?.tutors
                    || (Array.isArray(result?.data) ? result.data : [])
                    || [];
                console.log('📚 FindtTutors: Tutors data', tutorsData);
                console.log('📊 FindtTutors: Tutors count', tutorsData.length);
                
                // Add a timestamp to help with debugging
                console.log('🗓️ FindtTutors: Data fetched at', new Date().toISOString());
                
                setAllTutors(tutorsData);
                setFilteredTutors(tutorsData);
            } else {
                console.error('❌ FindtTutors: API failed', result.error);
                setError(result.error || 'Failed to load tutors');
            }
        } catch (err) {
            console.error('💥 FindtTutors: Exception', err);
            setError('Error loading tutors: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = useCallback(() => {
        console.log('🔧 applyFilters called with:', { filters, allTutorsCount: allTutors.length });
        
        if (!filters || (!filters.yearLevel && !filters.curriculum && !filters.subject && !filters.location)) {
            // No filters applied, show all tutors
            console.log('✅ No filters, showing all tutors');
            setFilteredTutors(allTutors);
            return;
        }

        const filtered = allTutors.filter(tutor => {
            // Check location filter
            if (filters.location) {
                const tutorLocations = tutor.preferred_locations || [];
                const hasLocation = tutorLocations.some(location => 
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
                    const hasExactSubject = tutorSubjects.some(subject => 
                        subject === targetSubject
                    );
                    if (!hasExactSubject) return false;
                }
                // If only year level is selected
                else if (filters.yearLevel && !filters.curriculum && !filters.subject) {
                    let hasYearLevel = false;
                    
                    if (filters.yearLevel === 'Year 1-10') {
                        // Match any of: Year 1-10, or individual years 1-10, or Primary
                        hasYearLevel = tutorSubjects.some(subject => {
                            const subjectLower = subject.toLowerCase();
                            return subjectLower.includes('year 1-10') ||
                                   subjectLower.includes('year 7') ||
                                   subjectLower.includes('year 8') ||
                                   subjectLower.includes('year 9') ||
                                   subjectLower.includes('year 10') ||
                                   subjectLower.includes('primary');
                        });
                    } else if (filters.yearLevel === 'Year 11/12') {
                        // Match any of: Year 11/12, Year 11, Year 12
                        hasYearLevel = tutorSubjects.some(subject => {
                            const subjectLower = subject.toLowerCase();
                            return subjectLower.includes('year 11/12') ||
                                   subjectLower.includes('year 11') ||
                                   subjectLower.includes('year 12');
                        });
                    } else {
                        // Fallback for other year levels
                        hasYearLevel = tutorSubjects.some(subject => 
                            subject.includes(` - ${filters.yearLevel} (`) || 
                            subject.includes(filters.yearLevel)
                        );
                    }
                    
                    if (!hasYearLevel) return false;
                }
                // If year level and curriculum/state are selected but no specific subject
                else if (filters.yearLevel && filters.curriculum && !filters.subject) {
                    const hasYearAndCurriculum = tutorSubjects.some(subject => 
                        subject.includes(` - ${filters.yearLevel} (${filters.curriculum})`) ||
                        (subject.includes(filters.yearLevel) && subject.includes(filters.curriculum))
                    );
                    if (!hasYearAndCurriculum) return false;
                }
                // If only curriculum is selected (less common case)
                else if (filters.curriculum && !filters.yearLevel && !filters.subject) {
                    const hasCurriculum = tutorSubjects.some(subject => 
                        subject.includes(`(${filters.curriculum})`)
                    );
                    if (!hasCurriculum) return false;
                }
                // If only subject name is selected (partial match)
                else if (filters.subject && !filters.yearLevel && !filters.curriculum) {
                    const hasSubject = tutorSubjects.some(subject => 
                        subject.toLowerCase().includes(filters.subject.toLowerCase())
                    );
                    if (!hasSubject) return false;
                }
            }

            return true;
        });

        console.log('🎯 Filtered tutors:', filtered.length, 'out of', allTutors.length);
        setFilteredTutors(filtered);
    }, [filters, allTutors]);

    // Apply filters when filters or allTutors change
    useEffect(() => {
        console.log('🔄 Triggering filter application');
        applyFilters();
    }, [applyFilters]);

    const getDefaultImage = (name) => {
        // Generate a consistent avatar based on the tutor's name
        const safeName = typeof name === 'string' && name.length > 0 ? name : 'Tutor';
        const seed = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const avatarId = (seed % 99) + 1;
        const gender = seed % 2 === 0 ? 'women' : 'men';
        return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
    };

    const renderStars = (rating) => {
        const numRating = Number(rating) || 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <div className="findt-tutors-rating">
                <span className="findt-tutors-rating-value">{numRating.toFixed(1)}</span>
                <div className="findt-tutors-stars">
                    {Array.from({ length: fullStars }).map((_, i) => (
                        <i key={i} className="fas fa-star findt-tutors-star-filled"></i>
                    ))}
                    {hasHalfStar && (
                        <i className="fas fa-star-half-alt findt-tutors-star-filled"></i>
                    )}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                        <i key={`empty-${i}`} className="far fa-star findt-tutors-star-empty"></i>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
                <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: '400px' }}>
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
            <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
                <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                    <div className="alert alert-danger w-100" role="alert">
                        {error}
                        <button 
                            className="btn btn-primary ms-3" 
                            onClick={fetchLiveTutors}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (filteredTutors.length === 0 && allTutors.length > 0) {
        return (
            <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
                <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                    <div className="text-center w-100" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
                <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                    <div className="text-center w-100" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div>
                            <i className="fas fa-user-graduate fa-4x text-muted mb-3"></i>
                            <h3>No tutors available</h3>
                            <p>We're working on getting more tutors approved. Check back soon!</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
            <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                <div className="row g-4 w-100">
                    {filteredTutors.map((tutor) => {
                        const name = tutor.name || 'Tutor';
                        const avatarClass = (tutor.status && tutor.status.toLowerCase() === 'approved') ? 'available' : 'booked';
                        const rate = tutor.hourly_rate ? `$${Number(tutor.hourly_rate).toFixed(0)}/hr` : '';
                        const topSubjects = Array.isArray(tutor.subjects) ? tutor.subjects.slice(0, 2).map(s => (s || '').split(' - ')[0]).join(', ') : '';
                        const topLocations = Array.isArray(tutor.preferred_locations) ? tutor.preferred_locations.slice(0, 2).join(', ') : '';
                        // Enhanced photo fallback: photo_url → image → getDefaultImage
                        const tutorImage = tutor.photo_url || tutor.image || getDefaultImage(name);
                        // Education info
                        const university = tutor.university || '';
                        const currentStudies = Array.isArray(tutor.current_studies) ? tutor.current_studies : [];
                        const hasEducationInfo = university || currentStudies.length > 0;
                        const rating = tutor.rating || 0;
                        
                        return (
                        <div key={tutor.id} className="col-xl-3 col-lg-4 col-md-6 col-12">
                            <a href={`/find-a-tutor/request?tutorId=${tutor.id}`} className="findt-tutors-card">
                                <div className="findt-tutors-stats">
                                    <span className="findt-tutors-gold">Gold ({tutor.goldPoints || 0})</span>
                                    <span className="findt-tutors-atr">ATAR ({tutor.atrPoints || 0})</span>
                                </div>
                                <div className={`findt-tutors-avatar ${avatarClass}`}>
                                    <img 
                                        src={tutorImage}
                                        alt={name}
                                        onError={(e) => {
                                            e.target.src = getDefaultImage(name);
                                        }}
                                    />
                                    <span className="findt-tutors-status">{tutor.status || 'available'}</span>
                                </div>
                                <h3 className="findt-tutors-name">{name}</h3>
                                {/* Rating Display */}
                                {rating > 0 && (
                                    <div className="findt-tutors-rating-container mb-2">
                                        {renderStars(rating)}
                                    </div>
                                )}
                                {/* Education Information */}
                                {hasEducationInfo && (
                                    <div className="findt-tutors-education mb-2">
                                        {university && (
                                            <div className="findt-tutors-university">
                                                <i className="fas fa-graduation-cap me-1"></i>
                                                <small>{university}</small>
                                            </div>
                                        )}
                                        {currentStudies.length > 0 && (
                                            <div className="findt-tutors-studies">
                                                <i className="fas fa-book-reader me-1"></i>
                                                <small>{currentStudies.slice(0, 2).join(', ')}{currentStudies.length > 2 ? '...' : ''}</small>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="findt-tutors-details mt-2">
                                    {topSubjects && (
                                        <div className="mb-1">
                                            <small className="text-muted">
                                                <i className="fas fa-book me-1"></i>
                                                {topSubjects}
                                                {Array.isArray(tutor.subjects) && tutor.subjects.length > 2 && ` +${tutor.subjects.length - 2} more`}
                                            </small>
                                        </div>
                                    )}
                                    {topLocations && (
                                        <div>
                                            <small className="text-muted">
                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                {topLocations}
                                                {Array.isArray(tutor.preferred_locations) && tutor.preferred_locations.length > 2 && ` +${tutor.preferred_locations.length - 2} more`}
                                            </small>
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                                    <span className="text-primary fw-semibold">{rate}</span>
                                    
                                </div>
                            </a>
                        </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default FindtTutors;