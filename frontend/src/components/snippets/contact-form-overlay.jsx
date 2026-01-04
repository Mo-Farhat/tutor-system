import React, { useState, useEffect, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import '../../css/snippets/contact-form-overlay.css';
import { useSubjects } from '../../contexts/SubjectsContext';

// Create a context to expose the overlay functionality globally
const ContactFormContext = createContext({
  openContactForm: () => {},
  closeContactForm: () => {},
});

// Custom hook to access the contact form from anywhere in the app
export const useContactForm = () => useContext(ContactFormContext);

export const ContactFormProvider = ({ children }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Only show overlay on home page after 5 seconds
    if (location.pathname === '/') {
      const timer = setTimeout(() => {
        setShowOverlay(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const openContactForm = () => {
    setShowOverlay(true);
  };
  
  const closeContactForm = () => {
    setShowOverlay(false);
  };

  return (
    <ContactFormContext.Provider value={{ openContactForm, closeContactForm }}>
      {children}
      {location.pathname === '/' && showOverlay && <ContactFormOverlay onClose={closeContactForm} />}
    </ContactFormContext.Provider>
  );
};

const ContactFormOverlay = ({ onClose }) => {
  const { getYear1112Subjects, getYear110Subjects } = useSubjects();
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  
  // Get all unique curricula from subjects
  const getCurriculumOptions = () => {
    const year1112 = getYear1112Subjects() || {};
    const year110 = getYear110Subjects() || {};
    const allCurricula = new Set([...Object.keys(year1112), ...Object.keys(year110)]);
    return Array.from(allCurricula).sort();
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    onClose();
  };

  return (
    <div className="snippet-contact-us-overlay">
      <div className="snippet-contact-us-backdrop" onClick={onClose}></div>
      <div className="snippet-contact-us-modal">
        <div className="container">
          <div className="row">
            <div className="col-md-6 d-none d-md-flex justify-content-center align-items-center snippet-contact-us-image-container">
              <div className="snippet-contact-us-heading">
                <h1>Let Us Know What You're Looking For  We'll Handle the Rest</h1>
              </div>
            </div>
            <div className="col-md-6 col-sm-12 snippet-contact-us-form-container">
              <button 
                className="snippet-contact-us-close-btn" 
                onClick={onClose}
                aria-label="Close"
              >
                &times;
              </button>
              
              <h2 className="snippet-contact-us-form-title d-md-none">Form overlay heading</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="fullName" 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    placeholder="John.Doe@gmail.com" 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Telephone number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="phone" 
                    placeholder="+61 123456789" 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="contactTime" className="form-label">What time of day would you like us to contact you?</label>
                  <input 
                    type="text" 
                    className="form-control snippet-contact-us-time-input" 
                    id="contactTime" 
                    placeholder="Eg: Morning, Afternoon or Evening" 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="curriculum" className="form-label">What curriculum are you looking for?</label>
                  <select 
                    className="form-control" 
                    id="curriculum"
                    value={selectedCurriculum}
                    onChange={(e) => setSelectedCurriculum(e.target.value)}
                  >
                    <option value="">Select a curriculum...</option>
                    {getCurriculumOptions().map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
                
                <div className="d-grid">
                  <button type="submit" className="btn snippet-contact-us-submit-btn">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactFormOverlayStandalone = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname === '/') {
      const timer = setTimeout(() => {
        setShowOverlay(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setShowOverlay(false);
  };

  if (!showOverlay || location.pathname !== '/') return null;
  
  return <ContactFormOverlay onClose={handleClose} />;
};

export default ContactFormOverlayStandalone; 