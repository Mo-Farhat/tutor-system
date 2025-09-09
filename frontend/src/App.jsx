import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ContactFormProvider } from "./components/snippets/contact-form-overlay";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedTutorRoute from "./components/ProtectedTutorRoute";

import HomePage from "./pages/js/home";
import AboutusPage from "./pages/js/aboutus";
import FaqPage from "./pages/js/faq";
import ReviewsPage from "./pages/js/reviews";
import FindtPage from "./pages/js/find-tutor";
import JoinusPage from "./pages/js/joinus";
import TutorPage from "./pages/js/tutor";
import BFriendPage from "./pages/js/b-friend";
import InterviewPage from "./pages/js/interview";
import PricingPage from "./pages/js/pricing";
import UcatPage from "./pages/js/ucat";
import TermsPage from "./pages/js/terms";
import LoginPage from "./pages/js/login";
import SignupPage from "./pages/js/signup";
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
import TutorPasswordSetup from "./components/TutorPasswordSetup";
import AdminTestPanel from "./components/AdminTestPanel";
import StudentProfilePage from "./pages/js/dashboard/tutor/s-profile";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ContactFormProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/aboutus" element={<AboutusPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/find-a-tutor" element={<FindtPage />} />
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
            <Route path="/contact-us" element={<ContactusPage />} />
            <Route
              path="/tutor/setup-password/:token"
              element={<TutorPasswordSetup />}
            />
            <Route path="/admin/test" element={<AdminTestPanel />} />

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
          </Routes>
        </ContactFormProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;
