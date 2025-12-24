import React from 'react';
import StudentPackages from '../../../../components/dashboards/student/packages/packages';
import * as Snippets from '../../../../components/dashboards/student/snippets/snippets-index';

function StudentPackagesPage() {
    return (
        <div className="student-packages-page-main">
            <div className="student-packages-nav-bar">
                <Snippets.StudentNavbar />
            </div>
            <div className="student-packages-content">
                <StudentPackages />
            </div>
        </div>
    );
}

export default StudentPackagesPage;