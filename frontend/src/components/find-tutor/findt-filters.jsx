import { useState, useRef, useEffect } from "react";
import { getSubjectSelectionData } from "../../services/authService";
import "../../css/find-tutor/findt-filters.css"

function FindtFilters({ onFiltersChange }) {
    // Create separate states and refs for each dropdown
    const [yearDropdown, setYearDropdown] = useState({
        isOpen: false,
        selectedOption: ""
    });
    const [curriculumDropdown, setCurriculumDropdown] = useState({
        isOpen: false,
        selectedOption: ""
    });
    const [subjectDropdown, setSubjectDropdown] = useState({
        isOpen: false,
        selectedOption: ""
    });
    const [locationDropdown, setLocationDropdown] = useState({
        isOpen: false,
        selectedOption: ""
    });

    // Subject data from API
    const [subjectData, setSubjectData] = useState({
        year_levels: [],
        curricula: [],
        states: [],
        year_11_12_subjects: {},
        year_1_10_subjects: {}
    });
    const [loading, setLoading] = useState(true);

    // Create separate refs for each dropdown
    const yearDropdownRef = useRef(null);
    const curriculumDropdownRef = useRef(null);
    const subjectDropdownRef = useRef(null);
    const locationDropdownRef = useRef(null);
    // Add a wrapper ref for the whole filters section
    const filtersWrapperRef = useRef(null);

    // Load subject data on component mount
    useEffect(() => {
        fetchSubjectData();
    }, []);

    // Notify parent component when filters change
    useEffect(() => {
        if (onFiltersChange) {
            onFiltersChange({
                yearLevel: yearDropdown.selectedOption,
                curriculum: curriculumDropdown.selectedOption,
                subject: subjectDropdown.selectedOption,
                location: locationDropdown.selectedOption
            });
        }
    }, [yearDropdown.selectedOption, curriculumDropdown.selectedOption, subjectDropdown.selectedOption, locationDropdown.selectedOption, onFiltersChange]);

    const fetchSubjectData = async () => {
        try {
            setLoading(true);
            const result = await getSubjectSelectionData();
            if (result.success) {
                setSubjectData(result.data);
            } else {
                console.error('Failed to load subject data:', result.error);
            }
        } catch (err) {
            console.error('Error loading subject data:', err.message);
        } finally {
            setLoading(false);
        }
    };
  
    // Toggle functions for each dropdown
    const toggleYearDropdown = () => {
        setYearDropdown({
            ...yearDropdown,
            isOpen: !yearDropdown.isOpen
        });
    };

    const toggleCurriculumDropdown = () => {
        setCurriculumDropdown({
            ...curriculumDropdown,
            isOpen: !curriculumDropdown.isOpen
        });
    };

    const toggleSubjectDropdown = () => {
        setSubjectDropdown({
            ...subjectDropdown,
            isOpen: !subjectDropdown.isOpen
        });
    };

    const toggleLocationDropdown = () => {
        setLocationDropdown({
            ...locationDropdown,
            isOpen: !locationDropdown.isOpen
        });
    };
  
    // Handle selecting options for each dropdown
    const handleYearSelect = (option) => {
        setYearDropdown({
            isOpen: false,
            selectedOption: option
        });
        // Reset dependent dropdowns
        setCurriculumDropdown({
            isOpen: false,
            selectedOption: ""
        });
        setSubjectDropdown({
            isOpen: false,
            selectedOption: ""
        });
    };

    const handleCurriculumSelect = (option) => {
        setCurriculumDropdown({
            isOpen: false,
            selectedOption: option
        });
        // Reset subject dropdown when curriculum changes
        setSubjectDropdown({
            isOpen: false,
            selectedOption: ""
        });
    };

    const handleSubjectSelect = (option) => {
        setSubjectDropdown({
            isOpen: false,
            selectedOption: option
        });
    };

    const handleLocationSelect = (option) => {
        setLocationDropdown({
            isOpen: false,
            selectedOption: option
        });
    };
    
    // Handle clearing selected options
    const clearYearOption = (e) => {
        e.stopPropagation(); // Prevent dropdown from opening when close is clicked
        setYearDropdown({
            ...yearDropdown,
            selectedOption: ""
        });
        setCurriculumDropdown({
            isOpen: false,
            selectedOption: ""
        });
        setSubjectDropdown({
            isOpen: false,
            selectedOption: ""
        });
    };
    
    const clearCurriculumOption = (e) => {
        e.stopPropagation(); 
        setCurriculumDropdown({
            ...curriculumDropdown,
            selectedOption: ""
        });
        setSubjectDropdown({
            isOpen: false,
            selectedOption: ""
        });
    };
    
    const clearSubjectOption = (e) => {
        e.stopPropagation();
        setSubjectDropdown({
            ...subjectDropdown,
            selectedOption: ""
        });
    };
    
    const clearLocationOption = (e) => {
        e.stopPropagation();
        setLocationDropdown({
            ...locationDropdown,
            selectedOption: ""
        });
    };

    // Get curriculum/state options based on selected year level
    const getCurriculumOptions = () => {
        if (yearDropdown.selectedOption === 'Year 11/12') {
            return subjectData.curricula || [];
        } else if (yearDropdown.selectedOption === 'Year 1-10') {
            return subjectData.states || [];
        }
        return [];
    };

    // Get subject options based on selected year level and curriculum/state
    const getSubjectOptions = () => {
        if (yearDropdown.selectedOption === 'Year 11/12' && curriculumDropdown.selectedOption) {
            return subjectData.year_11_12_subjects[curriculumDropdown.selectedOption] || [];
        } else if (yearDropdown.selectedOption === 'Year 1-10' && curriculumDropdown.selectedOption) {
            return subjectData.year_1_10_subjects[curriculumDropdown.selectedOption] || [];
        }
        return [];
    };

    // Get label for curriculum/state dropdown
    const getCurriculumLabel = () => {
        if (yearDropdown.selectedOption === 'Year 11/12') {
            return 'Curriculum';
        } else if (yearDropdown.selectedOption === 'Year 1-10') {
            return 'State';
        }
        return 'Curriculum';
    };

    // Common locations - you can expand this list or make it dynamic
    const commonLocations = [
        'Online',
        'Brisbane',
        'Sydney', 
        'Melbourne',
        'Perth',
        'Adelaide',
        'Canberra',
        'Darwin',
        'Hobart',
        'Gold Coast',
        'Newcastle',
        'Wollongong',
        'Geelong',
        'Townsville',
        'Cairns'
    ];
  
    // Close dropdowns when clicking outside the filters section
    useEffect(() => {
        function handleClickOutside(event) {
            if (!filtersWrapperRef.current) return;
            if (!filtersWrapperRef.current.contains(event.target)) {
                setYearDropdown(prev => ({ ...prev, isOpen: false }));
                setCurriculumDropdown(prev => ({ ...prev, isOpen: false }));
                setSubjectDropdown(prev => ({ ...prev, isOpen: false }));
                setLocationDropdown(prev => ({ ...prev, isOpen: false }));
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    if (loading) {
        return (
            <section className='row container-fluid d-flex g-0 findt-filters-main' id='findt-filters'>
                <div className="col-8 d-flex findt-filters-sec justify-content-center align-items-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading filters...</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='row container-fluid d-flex g-0 findt-filters-main' id='findt-filters'>
            <div className="col-8 d-flex findt-filters-sec" ref={filtersWrapperRef}>
                {/* Year Level Dropdown */}
                <div className="col-3 d-flex findt-filter-main justify-content-center align-items-center gap-3" ref={yearDropdownRef}>
                    <span className="fw-bold findt-filter-h">Year Level</span>
                    <div className="dropdown">
                        <button 
                            className={`btn btn-secondary d-flex px-5 auto-width ${yearDropdown.isOpen ? 'dropdown-open' : ''}`}
                            type="button"
                            onClick={toggleYearDropdown}
                            aria-expanded={yearDropdown.isOpen}
                        >
                            {yearDropdown.selectedOption || "Select Year"}
                        </button>
                        
                        {yearDropdown.isOpen && (
                            <ul className="dropdown-menu show">
                                {subjectData.year_levels.map((year) => (
                                    <li key={year}>
                                        <button className="dropdown-item" onClick={() => handleYearSelect(year)}>
                                            {year}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {yearDropdown.selectedOption && (
                        <button type="button" className="btn-close" onClick={clearYearOption} aria-label="Close"></button>
                    )}
                </div>

                {/* Curriculum Dropdown */}
                <div className="col-3 d-flex findt-filter-main justify-content-center align-items-center gap-3" ref={curriculumDropdownRef}>
                    <span className="fw-bold findt-filter-h">{getCurriculumLabel()}</span>
                    <div className="dropdown">
                        <button 
                            className={`btn btn-secondary d-flex px-3 auto-width ${curriculumDropdown.isOpen ? 'dropdown-open' : ''}`}
                            type="button"
                            onClick={toggleCurriculumDropdown}
                            aria-expanded={curriculumDropdown.isOpen}
                            disabled={!yearDropdown.selectedOption}
                        >
                            {curriculumDropdown.selectedOption || "Select"}
                        </button>
                        
                        {curriculumDropdown.isOpen && (
                            <ul className="dropdown-menu show">
                                {getCurriculumOptions().map((curr) => (
                                    <li key={curr}>
                                        <button className="dropdown-item" onClick={() => handleCurriculumSelect(curr)}>
                                            {curr}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {curriculumDropdown.selectedOption && (
                        <button type="button" className="btn-close" onClick={clearCurriculumOption} aria-label="Close"></button>
                    )}
                </div>

                {/* Subject Dropdown */}
                <div className="col-3 d-flex findt-filter-main justify-content-center align-items-center gap-3" ref={subjectDropdownRef}>
                    <span className="fw-bold findt-filter-h">Subject</span>
                    <div className="dropdown">
                        <button 
                            className={`btn btn-secondary d-flex px-3 auto-width ${subjectDropdown.isOpen ? 'dropdown-open' : ''}`}
                            type="button"
                            onClick={toggleSubjectDropdown}
                            aria-expanded={subjectDropdown.isOpen}
                            disabled={!yearDropdown.selectedOption || !curriculumDropdown.selectedOption}
                        >
                            {subjectDropdown.selectedOption || "Select Subject"}
                        </button>
                        
                        {subjectDropdown.isOpen && (
                            <ul className="dropdown-menu show">
                                {getSubjectOptions().map((subject) => (
                                    <li key={subject}>
                                        <button className="dropdown-item" onClick={() => handleSubjectSelect(subject)}>
                                            {subject}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {subjectDropdown.selectedOption && (
                        <button type="button" className="btn-close" onClick={clearSubjectOption} aria-label="Close"></button>
                    )}
                </div>

                {/* Location Dropdown */}
                <div className="col-3 d-flex findt-filter-main justify-content-center align-items-center gap-3" ref={locationDropdownRef}>
                    <span className="fw-bold findt-filter-h">Location</span>
                    <div className="dropdown">
                        <button 
                            className={`btn btn-secondary d-flex px-3 auto-width ${locationDropdown.isOpen ? 'dropdown-open' : ''}`}
                            type="button"
                            onClick={toggleLocationDropdown}
                            aria-expanded={locationDropdown.isOpen}
                        >
                            {locationDropdown.selectedOption || "Select Location"}
                        </button>
                        
                        {locationDropdown.isOpen && (
                            <ul className="dropdown-menu show">
                                {commonLocations.map((location) => (
                                    <li key={location}>
                                        <button className="dropdown-item" onClick={() => handleLocationSelect(location)}>
                                            {location}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {locationDropdown.selectedOption && (
                        <button type="button" className="btn-close" onClick={clearLocationOption} aria-label="Close"></button>
                    )}
                </div>
            </div>
        </section>
    );
}

export default FindtFilters;