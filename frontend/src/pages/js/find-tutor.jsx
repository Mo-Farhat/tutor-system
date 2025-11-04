import React, { useState, useCallback, useEffect } from "react"
import { useLocation } from "react-router-dom"
import * as Snippets from "../../components/snippets/snippets-index"
import * as FindTutorcomponents from "../../components/find-tutor/findt-index"


const FindTutorPage = () => {
    const location = useLocation();
    
    // Derive filters directly from URL query parameters (no state needed)
    const getFiltersFromURL = () => {
        const params = new URLSearchParams(location.search);
        // Ignore the 't' (timestamp) parameter
        return {
            yearLevel: params.get('yearLevel') || '',
            curriculum: params.get('curriculum') || '',
            subject: params.get('subject') || '',
            location: params.get('location') || ''
        };
    };

    const filters = getFiltersFromURL();
    const [userModifiedFilters, setUserModifiedFilters] = useState(null);

    // Scroll to top when URL changes
    useEffect(() => {
        console.log('🔗 URL params changed, filters:', filters);
        console.log('🔗 Full URL search:', location.search);
        
        // Clear user modifications when URL changes
        setUserModifiedFilters(null);
        
        // Scroll to top of page when URL changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.search]);

    const handleFiltersChange = useCallback((newFilters) => {
        console.log('📋 Filter change received in parent:', newFilters);
        setUserModifiedFilters(newFilters);
    }, []);

    // Use user-modified filters if they exist, otherwise use URL filters
    const activeFilters = userModifiedFilters || filters;

    return (
      <div className="find-tutor-container">
        {/* navbar */}
        <Snippets.Navbar />
        {/* hero */}
        <FindTutorcomponents.FindtHero />
        {/* filters */}
        <div id="filters-section">
          <FindTutorcomponents.FindtFilters 
            key={location.search || 'default'} 
            onFiltersChange={handleFiltersChange} 
            initialFilters={filters} 
          />
        </div>
        {/* tutors */}
        <FindTutorcomponents.FindtTutors filters={activeFilters} />
        {/* footer */}
        <Snippets.Footer />
      </div>
    );
  };
  
  export default FindTutorPage;  