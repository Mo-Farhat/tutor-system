import { useState, useRef, useEffect } from "react";
import "../../css/find-tutor/findt-filters.css"

function FindtFilters({ onFiltersChange }) {
    // Progressive filtering state
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFilters, setSelectedFilters] = useState({
        yearLevel: '',
        curriculum: '',
        subject: '',
        location: ''
    });

    // Subject search state
    const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);

    // Location state
    const [postcode, setPostcode] = useState('');
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    // Hardcoded subject data
    const subjectData = {
        yearLevels: ['Year 1-10', 'Year 11/12'],
        
        // Year 11/12 Curricula
        year1112Curricula: ['VCE', 'QCE', 'SACE', 'HSC', 'WACE', 'NTCET', 'BSSS', 'IB', 'Medical Entrance'],
        
        // Year 1-10 States
        year110States: ['VIC', 'QLD', 'SA', 'NSW', 'WA', 'NT', 'ACT', 'TAS', 'IB'],
        
        // Year 11/12 Subjects by Curriculum
        year1112Subjects: {
            'VCE': ['Physics', 'Chemistry', 'Biology', 'General Maths', 'Mathematical Methods', 'Specialist Mathematics', 'Further Mathematics', 'Legal Studies', 'Business', 'Psychology', 'Economics', 'English Literature', 'English Language', 'Health and Human Development', 'English as an Additional Language (EAL)', 'Accounting', 'Ancient History', 'Geography', 'History Revolutions', 'French', 'Latin', 'Japanese', 'Environmental Science', 'UCAT', 'Physical Education', 'Music Performance', 'Philosophy', 'Engineering', 'Politics'],
            
            'QCE': ['English', 'Chemistry', 'Biology', 'Physics', 'General Maths', 'Mathematical Methods', 'Specialist Mathematics', 'UCAT', 'Legal Studies', 'Business', 'Economics', 'English Literature', 'English as an Additional Language (EAL)', 'Accounting', 'Modern History', 'Ancient History', 'English Literature and Extension 1', 'Study of Religion', 'French', 'Japanese', 'Physical Education', 'Music Performance', 'Philosophy', 'Engineering'],
            
            'SACE': ['Mathematical Methods', 'English', 'Chemistry', 'Biology', 'Physics', 'Specialist Mathematics', 'General Maths', 'UCAT', 'Legal Studies', 'Business', 'Psychology', 'Economics', 'English as an Additional Language (EAL)', 'Accounting', 'Research Project', 'Modern History', 'Ancient History', 'Geography', 'Japanese', 'French', 'Physical Education', 'Music Performance', 'Literary Studies'],
            
            'HSC': ['Chemistry', 'Biology', 'Physics', 'Advanced Mathematics', 'UCAT', 'Legal Studies', 'Business', 'Psychology', 'Economics', 'English Literature', 'English Advanced', 'Extension 1 Mathematics', 'English Standard', 'English as an Additional Language (EAL)', 'Accounting', 'Standard Maths', 'Extension 2 Mathematics', 'Modern History', 'Personal Development, Health and Physical Education', 'Ancient History', 'English Literature and Extension 1', 'English Extension 2', 'Geography', 'Study of Religion', 'French', 'Latin', 'Japanese', 'Society and Culture', 'Music Performance', 'Philosophy', 'Engineering'],
            
            'WACE': ['Mathematical Methods', 'English', 'Chemistry', 'Biology', 'Physics', 'Specialist Mathematics', 'General Maths', 'UCAT', 'Business', 'Psychology', 'Economics', 'Literature', 'Mathematics Applications', 'Human Biology', 'English as an Additional Language (EAL)', 'Accounting', 'Modern History', 'Geography', 'French', 'Politics and Law', 'Japanese', 'Physical Education', 'Philosophy'],
            
            'NTCET': ['Mathematical Methods', 'English', 'Chemistry', 'Biology', 'Physics', 'Specialist Mathematics', 'General Maths', 'UCAT', 'Legal Studies', 'Business', 'Psychology', 'Economics', 'English as an Additional Language (EAL)', 'Accounting', 'Research Project', 'Modern History', 'Ancient History', 'Geography', 'Japanese', 'French', 'Physical Education', 'Music Performance', 'Literary Studies'],
            
            'BSSS': ['English', 'Chemistry', 'Biology', 'Physics', 'General Maths', 'Legal Studies', 'Economics', 'English Literature', 'Accounting', 'Study of Religion', 'Philosophy'],
            
            'IB': ['IB Chemistry SL', 'IB Chemistry HL', 'IB Business Management SL', 'IB Mathematics Analysis and Approaches SL', 'IB Mathematics: Analysis and Approaches HL', 'IB Economics SL', 'IB Economics HL', 'IB Biology SL', 'IB BIology HL', 'IB English Language & Literature SL', 'IB English Language & Literature HL', 'IB English Literature SL', 'IB English Literature HL', 'IB Mathematics Analysis & Interpretation SL', 'IB Mathematics Analysis & Interpretation HL', 'IB History SL', 'IB History HL', 'IB Geography SL', 'IB Geography HL', 'IB Chinese B SL', 'IB Chinese ab initio', 'IB Spanish ab initio', 'IB Spanish B SL', 'IB Music SL', 'IB Psychology SL', 'IB Psychology HL', 'IB Business Management HL', 'IB Physics SL', 'IB Physics HL'],
            
            'Medical Entrance': ['UCAT', 'GAMSAT', 'Interview Preparation', 'Application Support']
        },
        
        // Year 1-10 Subjects (same for all states)
        year110Subjects: ['Maths', 'English', 'Science', 'Selective Entry', 'English as an Additional Language (EAL)', 'Music Performance']
    };

    // Notify parent component when filters change
    useEffect(() => {
        if (onFiltersChange) {
            onFiltersChange({
                yearLevel: selectedFilters.yearLevel,
                curriculum: selectedFilters.curriculum,
                subject: selectedFilters.subject,
                location: showOnlineOnly ? 'Online' : (postcode || selectedFilters.location)
            });
        }
    }, [selectedFilters, postcode, showOnlineOnly, onFiltersChange]);

    // Update filtered subjects when search term changes
    useEffect(() => {
        if (subjectSearchTerm && selectedFilters.yearLevel && selectedFilters.curriculum) {
            const availableSubjects = getSubjectOptions();
            const filtered = availableSubjects.filter(subject =>
                subject.toLowerCase().includes(subjectSearchTerm.toLowerCase())
            );
            setFilteredSubjects(filtered);
        } else {
            setFilteredSubjects([]);
        }
    }, [subjectSearchTerm, selectedFilters.yearLevel, selectedFilters.curriculum]);

    // Handle year level selection
    const handleYearLevelSelect = (yearLevel) => {
        setSelectedFilters(prev => ({
            ...prev,
            yearLevel,
            curriculum: '', // Reset dependent selections
            subject: ''
        }));
        setCurrentStep(2);
        setSubjectSearchTerm('');
    };

    // Handle curriculum selection  
    const handleCurriculumSelect = (curriculum) => {
        setSelectedFilters(prev => ({
            ...prev,
            curriculum,
            subject: '' // Reset subject when curriculum changes
        }));
        setCurrentStep(3);
        setSubjectSearchTerm('');
    };

    // Handle subject selection
    const handleSubjectSelect = (subject) => {
        setSelectedFilters(prev => ({
            ...prev,
            subject
        }));
        setSubjectSearchTerm(subject);
        setShowSubjectSuggestions(false);
        setCurrentStep(4);
    };

    // Remove filter functions
    const removeYearLevel = () => {
        setSelectedFilters(prev => ({
            ...prev,
            yearLevel: '',
            curriculum: '',
            subject: ''
        }));
        setCurrentStep(1);
        setSubjectSearchTerm('');
    };

    const removeCurriculum = () => {
        setSelectedFilters(prev => ({
            ...prev,
            curriculum: '',
            subject: ''
        }));
        setCurrentStep(2);
        setSubjectSearchTerm('');
    };

    const removeSubject = () => {
        setSelectedFilters(prev => ({
            ...prev,
            subject: ''
        }));
        setCurrentStep(3);
        setSubjectSearchTerm('');
    };

    // Get curriculum/state options based on selected year level
    const getCurriculumOptions = () => {
        if (selectedFilters.yearLevel === 'Year 11/12') {
            return subjectData.year1112Curricula;
        } else if (selectedFilters.yearLevel === 'Year 1-10') {
            return subjectData.year110States;
        }
        return [];
    };

    // Get subject options based on selected year level and curriculum/state
    const getSubjectOptions = () => {
        if (selectedFilters.yearLevel === 'Year 11/12' && selectedFilters.curriculum) {
            return subjectData.year1112Subjects[selectedFilters.curriculum] || [];
        } else if (selectedFilters.yearLevel === 'Year 1-10' && selectedFilters.curriculum) {
            return subjectData.year110Subjects;
        }
        return [];
    };

    // Get curriculum label
    const getCurriculumLabel = () => {
        return selectedFilters.yearLevel === 'Year 11/12' ? 'Curriculum' : 'State';
    };

    // Handle subject search input
    const handleSubjectSearchChange = (e) => {
        const value = e.target.value;
        setSubjectSearchTerm(value);
        setShowSubjectSuggestions(value.length > 0);
    };

    // Handle online tutors toggle
    const handleShowOnlineToggle = () => {
        setShowOnlineOnly(!showOnlineOnly);
        if (!showOnlineOnly) {
            setPostcode(''); // Clear postcode when switching to online only
        }
    };

    // Handle clicking outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.subject-search-container')) {
                setShowSubjectSuggestions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Get current step title and highlight
    const getCurrentStepTitle = () => {
        switch(currentStep) {
            case 1:
                return { title: 'Choose Your', highlight: 'Year Level' };
            case 2:
                return { title: 'Choose Your', highlight: getCurriculumLabel() };
            case 3:
                return { title: 'Choose Your', highlight: 'Subject' };
            case 4:
                return { title: 'Filter by', highlight: 'Location' };
            default:
                return { title: 'Choose Your', highlight: 'Year Level' };
        }
    };

    const stepInfo = getCurrentStepTitle();

    return (
        <section className='progressive-filters-main'>
            <div className="filters-container">
                <div className="filter-step">
                    <div className="step-content">
                        <h3 className="step-title">{stepInfo.title} <span className="highlight">{stepInfo.highlight}</span></h3>
                        
                        {/* Selected Filters Pills */}
                        <div className="selected-filters">
                            {selectedFilters.yearLevel && (
                                <div className="filter-pill">
                                    <span>{selectedFilters.yearLevel}</span>
                                    <button onClick={removeYearLevel} className="remove-btn">×</button>
                                </div>
                            )}
                            {selectedFilters.curriculum && (
                                <div className="filter-pill">
                                    <span>{selectedFilters.curriculum}</span>
                                    <button onClick={removeCurriculum} className="remove-btn">×</button>
                                </div>
                            )}
                            {selectedFilters.subject && (
                                <div className="filter-pill">
                                    <span>{selectedFilters.subject}</span>
                                    <button onClick={removeSubject} className="remove-btn">×</button>
                                </div>
                            )}
                        </div>

                        {/* Step 1: Year Level Selection */}
                        {currentStep === 1 && (
                            <div className="options-grid">
                                {subjectData.yearLevels.map((yearLevel) => (
                                    <button
                                        key={yearLevel}
                                        className="option-btn"
                                        onClick={() => handleYearLevelSelect(yearLevel)}
                                    >
                                        {yearLevel}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Curriculum/State Selection */}
                        {currentStep === 2 && (
                            <div className="options-grid">
                                {getCurriculumOptions().map((curriculum) => (
                                    <button
                                        key={curriculum}
                                        className="option-btn"
                                        onClick={() => handleCurriculumSelect(curriculum)}
                                    >
                                        {curriculum}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 3: Subject Selection */}
                        {currentStep === 3 && (
                            <div className="subject-search-container">
                                <div className="search-input-container">
                                    <input
                                        type="text"
                                        placeholder="Type in your subject"
                                        value={subjectSearchTerm}
                                        onChange={handleSubjectSearchChange}
                                        className="subject-search-input"
                                        onFocus={() => setShowSubjectSuggestions(subjectSearchTerm.length > 0)}
                                    />
                                    <i className="fas fa-search search-icon"></i>
                                </div>
                                
                                {showSubjectSuggestions && filteredSubjects.length > 0 && (
                                    <div className="subject-suggestions">
                                        {filteredSubjects.slice(0, 8).map((subject, index) => (
                                            <button
                                                key={index}
                                                className="suggestion-item"
                                                onClick={() => handleSubjectSelect(subject)}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Show all available subjects as buttons when no search term */}
                                {!subjectSearchTerm && (
                                    <div className="all-subjects-grid">
                                        {getSubjectOptions().map((subject, index) => (
                                            <button
                                                key={index}
                                                className="subject-option-btn"
                                                onClick={() => handleSubjectSelect(subject)}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Location Filter */}
                        {currentStep === 4 && (
                            <div className="location-options">
                                <button 
                                    className={`online-tutors-btn ${showOnlineOnly ? 'active' : ''}`}
                                    onClick={handleShowOnlineToggle}
                                >
                                    Show all online tutors
                                </button>
                                
                                <span className="or-text">or</span>
                                
                                <div className="postcode-container">
                                    <input
                                        type="text"
                                        placeholder="0000"
                                        value={postcode}
                                        onChange={(e) => setPostcode(e.target.value)}
                                        className="postcode-input"
                                        disabled={showOnlineOnly}
                                        maxLength="4"
                                    />
                                    <button className="save-btn">Save</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FindtFilters;