import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import { ContactFormProvider } from "./components/snippets/contact-form-overlay";
import { AuthProvider } from "./contexts/AuthContext";
import { SubjectsProvider } from "./contexts/SubjectsContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedTutorRoute from "./components/ProtectedTutorRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import {useNavigate} from "react-router-dom";

import HomePage from "./pages/js/home";
import AboutusPage from "./pages/js/aboutus";
import FaqPage from "./pages/js/faq";
import ReviewsPage from "./pages/js/reviews";
import FindtPage from "./pages/js/find-tutor";
import FindTutorRequestPage from "./pages/js/find-tutor-request";
import JoinusPage from "./pages/js/joinus";
import TutorPage from "./pages/js/tutor";
import BFriendPage from "./pages/js/b-friend";
import InterviewPage from "./pages/js/interview";
import PricingPage from "./pages/js/pricing";
import UcatPage from "./pages/js/ucat";
import TermsPage from "./pages/js/terms";
import LoginPage from "./pages/js/login";
import SignupPage from "./pages/js/signup";
import AdminLoginPage from "./pages/js/login-signup/adminLogin";
import TutorContactPage from "./pages/js/tutor-contact";
import PrivacyPage from "./pages/js/privacy";
import ContactusPage from "./pages/js/contact-us";
import TutorSettingsPage from "./pages/js/dashboard/tutor/settings";
import TutorNotificationsPage from "./pages/js/dashboard/tutor/notifications";
import TutorHomePage from "./pages/js/dashboard/tutor/home";
import TutorEarningsPage from "./pages/js/dashboard/tutor/earnings";
import TutorProgressPage from "./pages/js/dashboard/tutor/progress";
import TutorCalendarPage from "./pages/js/dashboard/tutor/calendar";
import TutorStudentsPage from "./pages/js/dashboard/tutor/students";
import TutorProfilePage from "./pages/js/dashboard/tutor/profile";
import TutorDocumentsPage from "./pages/js/dashboard/tutor/documents";
import TutorPaymentDetailsPage from "./pages/js/dashboard/tutor/payment-details";
import TutorChangeRequestsPage from "./pages/js/dashboard/tutor/change-requests";
import TutorStudentRequestsPage from "./pages/js/dashboard/tutor/student-requests";
import TutorPasswordSetup from "./components/TutorPasswordSetup";
import StudentProfilePage from "./pages/js/dashboard/tutor/s-profile";

import StudentHomePage from "./pages/js/dashboard/student/home";
import StudentSchedulingPage from "./pages/js/dashboard/student/scheduling";
import StudentPaymentHistoryPage from "./pages/js/dashboard/student/payment-history";
import StudentPaymentMethodsPage from "./pages/js/dashboard/student/payment-methods";
import StudentPaymentSuccessPage from "./pages/js/dashboard/student/payment-success";
import StudentReferralAndOffersPage from "./pages/js/dashboard/student/referrals";
import StudentProgressMilestonesPage from "./pages/js/dashboard/student/progress";
import StudentProfileManagementPage from "./pages/js/dashboard/student/profile";
import StudentTutorProfilePage from "./pages/js/dashboard/student/tutor-profile";
import StudentTutorReportsPage from "./pages/js/dashboard/student/tutor-reports";
import StudentTutorRequestsPage from "./pages/js/dashboard/student/tutor-requests";
import StudentPackagesPage from "./pages/js/dashboard/student/packages";

// Admin Dashboard Pages
import AdminHomePage from "./pages/js/dashboard/admin/home";
import AdminTutorsPage from "./pages/js/dashboard/admin/tutors";
import AdminStudentsPage from "./pages/js/dashboard/admin/students";
import AdminCalendarPage from "./pages/js/dashboard/admin/calendar";
import AdminFinancePage from "./pages/js/dashboard/admin/finance";
import AdminPackagesPage from "./pages/js/dashboard/admin/packages";
import AdminReferralPage from "./pages/js/dashboard/admin/referral";
import AdminBlogPage from "./pages/js/dashboard/admin/blog";
import AdminNotificationsPage from "./pages/js/dashboard/admin/notifications";
import AdminSupportPage from "./pages/js/dashboard/admin/support";
import AdminSettingsPage from "./pages/js/dashboard/admin/settings";
import AdminAssignmentsPage from "./pages/js/dashboard/admin/assignments";
import AdminSubjectsPage from "./pages/js/dashboard/admin/subjects";
import AdminTiersPage from "./pages/js/dashboard/admin/tiers";



const App = () => {
  return (
    <AuthProvider>
      <SubjectsProvider>
      <Router>
        <ScrollToTop />
        <ContactFormProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/aboutus" element={<AboutusPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/find-a-tutor" element={<FindtPage />} />
            <Route path="/find-a-tutor/request" element={<FindTutorRequestPage />} />
            <Route path="/join-us" element={<JoinusPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/tutor/:id" element={<TutorPage />} />
            <Route path="/tutor/contact" element={<TutorContactPage />} />
            <Route path="/bring-a-friend-and-save" element={<BFriendPage />} />
            <Route path="/interview-preparation" element={<InterviewPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/ucat" element={<UcatPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/contact-us" element={<ContactusPage />} />

            <Route
              path="/tutor/setup-password/:token"
              element={<TutorPasswordSetup />}
            />

            {/* Tutor Dashboard Routes - Protected by completion status */}
            <Route
              path="/dashboard/tutor/home"
              element={
                <ProtectedTutorRoute>
                  <TutorHomePage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/settings"
              element={<TutorSettingsPage />}
            />
            <Route
              path="/dashboard/tutor/notifications"
              element={
                <ProtectedTutorRoute>
                  <TutorNotificationsPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/earnings"
              element={
                <ProtectedTutorRoute>
                  <TutorEarningsPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/progress"
              element={
                <ProtectedTutorRoute>
                  <TutorProgressPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/calendar"
              element={
                <ProtectedTutorRoute>
                  <TutorCalendarPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/students"
              element={
                <ProtectedTutorRoute>
                  <TutorStudentsPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/profile"
              element={<TutorProfilePage />}
            />
            <Route
              path="/tutor/documents"
              element={
                <ProtectedTutorRoute allowedRoutes={["/tutor/documents"]}>
                  <TutorDocumentsPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/payment-details"
              element={
                <ProtectedTutorRoute allowedRoutes={["/tutor/payment-details"]}>
                  <TutorPaymentDetailsPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/s-profile"
              element={<StudentProfilePage />}
            />
            <Route
              path="/dashboard/tutor/change-requests"
              element={
                <ProtectedTutorRoute>
                  <TutorChangeRequestsPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/dashboard/tutor/student-requests"
              element={
                <ProtectedTutorRoute>
                  <TutorStudentRequestsPage />
                </ProtectedTutorRoute>
              }
            />

            {/* student Dashboard Routes*/}
            <Route
              path="/dashboard/student/home"
              element={<StudentHomePage />}
            />
            <Route
              path="/dashboard/student/tutor/:username"
              element={<StudentTutorProfilePage />}
            />
            <Route
              path="/dashboard/student/scheduling"
              element={<StudentSchedulingPage />}
            />
            <Route
              path="/dashboard/student/payment-history"
              element={<StudentPaymentHistoryPage />}
            />
            <Route
              path="/dashboard/student/packages"
              element={<StudentPackagesPage />}
            />
            <Route
              path="/dashboard/student/payment-methods"
              element={<StudentPaymentMethodsPage />}
            />
            <Route
              path="/dashboard/student/payment-success"
              element={<StudentPaymentSuccessPage />}
            />
            <Route
              path="/dashboard/student/referral-and-offers"
              element={<StudentReferralAndOffersPage />}
            />
            <Route
              path="/dashboard/student/progress-milestones"
              element={<StudentProgressMilestonesPage />}
            />
            <Route
              path="/dashboard/student/profile-management"
              element={<StudentProfileManagementPage />}
            />
            <Route
              path="/dashboard/student/tutor-reports"
              element={<StudentTutorReportsPage />}
            />
            <Route
              path="/dashboard/student/tutor-requests"
              element={<StudentTutorRequestsPage />}
            />
            {/* Redirect old profile details route to new unified profile page */}
            <Route
              path="/dashboard/student/profile-details"
              element={
                <Navigate to="/dashboard/student/profile-management" replace />
              }
            />

            {/* Admin Dashboard Routes - Protected by AdminGuard */}
            <Route
              path="/dashboard/admin/home"
              element={
                <ProtectedAdminRoute>
                  <AdminHomePage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/tutors"
              element={
                <ProtectedAdminRoute>
                  <AdminTutorsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/students"
              element={
                <ProtectedAdminRoute>
                  <AdminStudentsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/calendar"
              element={
                <ProtectedAdminRoute>
                  <AdminCalendarPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/finance"
              element={
                <ProtectedAdminRoute>
                  <AdminFinancePage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/packages"
              element={
                <ProtectedAdminRoute>
                  <AdminPackagesPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/referral"
              element={
                <ProtectedAdminRoute>
                  <AdminReferralPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/subjects"
              element={
                <ProtectedAdminRoute>
                  <AdminSubjectsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/blog"
              element={
                <ProtectedAdminRoute>
                  <AdminBlogPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/assignments"
              element={
                <ProtectedAdminRoute>
                  <AdminAssignmentsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/notifications"
              element={
                <ProtectedAdminRoute>
                  <AdminNotificationsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/support"
              element={
                <ProtectedAdminRoute>
                  <AdminSupportPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/settings"
              element={
                <ProtectedAdminRoute>
                  <AdminSettingsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/dashboard/admin/tiers"
              element={
                <ProtectedAdminRoute>
                  <AdminTiersPage />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </ContactFormProvider>
      </Router>
      </SubjectsProvider>
    </AuthProvider>
  );
};

export default App;
