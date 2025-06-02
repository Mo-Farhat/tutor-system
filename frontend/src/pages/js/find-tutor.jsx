import React, { useState } from "react"
import * as Snippets from "../../components/snippets/snippets-index"
import * as FindTutorcomponents from "../../components/find-tutor/findt-index"


const FindTutorPage = () => {
    const [filters, setFilters] = useState({
        yearLevel: '',
        curriculum: '',
        subject: '',
        location: ''
    });

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
      <div className="find-tutor-container">
        {/* navbar */}
        <Snippets.Navbar />
        {/* hero */}
        <FindTutorcomponents.FindtHero />
        {/* filters */}
        <FindTutorcomponents.FindtFilters onFiltersChange={handleFiltersChange} />
        {/* tutors */}
        <FindTutorcomponents.FindtTutors filters={filters} />
        {/* footer */}
        <Snippets.Footer />
      </div>
    );
  };
  
  export default FindTutorPage;  