import React, { useState } from 'react';
import '../../../../css/dashboards/tutor/change-requests/change-requests.css';
import * as Snippets from '../../../../components/dashboards/tutor/snippets/snippets-index';
import TutorChangeRequestForm from '../../../../components/TutorChangeRequestForm';
import TutorChangeRequestList from '../../../../components/TutorChangeRequestList';

const TutorChangeRequestsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    // Trigger refresh of the change requests list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="tutor-change-requests-page-main">
      <div className="tutor-change-requests-nav-bar">
        <Snippets.TutorNavbar2 />
      </div>
      <div className="tutor-change-requests-content">
        <div className="tutor-change-requests-container">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="tutor-change-requests-main-content">
                  
                  {/* Page Header Section */}
                  <div className="tutor-change-requests-section">
                    <h4 className="tutor-change-requests-section-title">Profile Change Requests</h4>
                    <p className="tutor-change-requests-section-description">
                      Request changes to your profile information that require administrator approval. All requests will be reviewed within 1-2 business days.
                    </p>
                  </div>

                  {/* Content Section */}
                  <div className="tutor-change-requests-section">
                    <div className="row">
                      <div className="col-xl-6 col-lg-12 mb-4">
                        <TutorChangeRequestForm onSuccess={handleFormSuccess} />
                      </div>
                      <div className="col-xl-6 col-lg-12 mb-4">
                        <TutorChangeRequestList refreshTrigger={refreshTrigger} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorChangeRequestsPage;
