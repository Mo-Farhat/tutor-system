import React, { useState, useEffect } from "react";
import {
  TUTOR_STATUS,
  TUTOR_STATUS_LABELS,
  TUTOR_TIERS,
  TUTOR_TIER_LABELS,
  COMMON_SUBJECTS,
  CALENDAR_VIEWS,
  SESSION_STATUS,
  SESSION_STATUS_LABELS,
  DOCUMENT_STATUS,
  COMPLIANCE_ALERT_TYPES,
} from "../constants/adminConstants";
import "../../../../css/dashboards/admin/tutors/tutorProfile.css";

function TutorProfileModal({ tutor, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tutorData, setTutorData] = useState(tutor);
  const [isEditing, setIsEditing] = useState(false);
  const [changeRequests, setChangeRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [calendarView, setCalendarView] = useState(CALENDAR_VIEWS.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSessionNotes, setSelectedSessionNotes] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showBankingModal, setShowBankingModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");

  // Mock data for demonstration
  useEffect(() => {
    if (tutor) {
      // Mock change requests - varies by tutor
      const changeRequestsData = {
        1: [
          // Sarah Johnson
          {
            id: 1,
            type: "profile_update",
            field: "intro",
            oldValue: "Experienced tutor with 5 years of teaching experience.",
            newValue:
              "Experienced tutor with 6 years of teaching experience specializing in VCE Chemistry and Biology.",
            status: "pending",
            submittedDate: "2024-03-15",
            comments: "Updated experience and added specialization details",
          },
          {
            id: 2,
            type: "subject_change",
            field: "subjects",
            oldValue: ["VCE Chemistry", "VCE Biology"],
            newValue: ["VCE Chemistry", "VCE Biology", "VCE Physics"],
            status: "approved",
            submittedDate: "2024-03-10",
            comments:
              "Added Physics to subject list after completing certification",
          },
          {
            id: 3,
            type: "banking_update",
            field: "banking",
            oldValue: "BSB: 123-456, Account: ****7890",
            newValue: "BSB: 123-456, Account: ****7891",
            status: "pending",
            submittedDate: "2024-03-18",
            comments: "Updated account number due to bank account change",
          },
        ],
        2: [
          // Michael Chen
          {
            id: 4,
            type: "profile_update",
            field: "qualifications",
            oldValue: "Bachelor of Engineering (Honours)",
            newValue:
              "Bachelor of Engineering (Honours), Graduate Certificate in Education",
            status: "pending",
            submittedDate: "2024-03-20",
            comments: "Completed additional education qualification",
          },
        ],
        3: [
          // Emma Thompson
          {
            id: 5,
            type: "subject_change",
            field: "subjects",
            oldValue: ["QCE English", "QCE Modern History"],
            newValue: [
              "QCE English",
              "QCE Modern History",
              "QCE Legal Studies",
              "QCE Psychology",
            ],
            status: "pending",
            submittedDate: "2024-03-19",
            comments:
              "Added Psychology and Legal Studies to expand subject offerings",
          },
        ],
        4: [], // James Wilson - suspended, no pending changes
        5: [
          // Dr. Jennifer Davis
          {
            id: 6,
            type: "profile_update",
            field: "intro",
            oldValue:
              "Doctorate in English Literature with 8 years of tutoring experience.",
            newValue:
              "Doctorate in English Literature with 9 years of tutoring experience. Specialized in VCE English Literature and UCAT preparation.",
            status: "approved",
            submittedDate: "2024-03-12",
            comments: "Updated experience and added UCAT specialization",
          },
        ],
      };

      setChangeRequests(changeRequestsData[tutor.id] || []);

      // Mock sessions data - varies by tutor
      const sessionsData = {
        1: [
          // Sarah Johnson - Chemistry/Biology tutor
          {
            id: 1,
            studentName: "John Smith",
            subject: "VCE Chemistry",
            date: new Date(2024, 2, 20, 14, 0),
            duration: 60,
            status: SESSION_STATUS.COMPLETED,
            rating: 5,
            notes:
              "Great session, student understood organic chemistry concepts well. Covered alkanes, alkenes, and alkynes.",
          },
          {
            id: 2,
            studentName: "Emily Chen",
            subject: "VCE Biology",
            date: new Date(2024, 2, 21, 16, 0),
            duration: 90,
            status: SESSION_STATUS.COMPLETED,
            rating: 4,
            notes:
              "Worked on cell division concepts. Student needs more practice with mitosis diagrams.",
          },
          {
            id: 3,
            studentName: "David Lee",
            subject: "VCE Chemistry",
            date: new Date(2024, 2, 22, 10, 0),
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 4,
            studentName: "Sophie Wilson",
            subject: "VCE Biology",
            date: new Date(2024, 2, 25, 15, 30),
            duration: 60,
            status: SESSION_STATUS.COMPLETED,
            rating: 5,
            notes:
              "Excellent progress on genetics unit. Student mastered Punnett squares.",
          },
          {
            id: 5,
            studentName: "Alex Thompson",
            subject: "VCE Physics",
            date: new Date(2024, 2, 28, 11, 0),
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          // September 2025 Calendar Data
          {
            id: 101,
            studentName: "Alice Johnson",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 2, 14, 0), // Sep 2, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 102,
            studentName: "Ben Chen",
            subject: "VCE Biology",
            date: new Date(2025, 8, 3, 16, 0), // Sep 3, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 103,
            studentName: "Carla Davis",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 5, 10, 0), // Sep 5, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 104,
            studentName: "Daniel Kim",
            subject: "VCE Biology",
            date: new Date(2025, 8, 6, 15, 30), // Sep 6, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 105,
            studentName: "Emma Wilson",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 9, 11, 0), // Sep 9, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 106,
            studentName: "Frank Miller",
            subject: "VCE Biology",
            date: new Date(2025, 8, 10, 14, 0), // Sep 10, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 107,
            studentName: "Grace Lee",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 12, 16, 0), // Sep 12, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 108,
            studentName: "Henry Brown",
            subject: "VCE Biology",
            date: new Date(2025, 8, 13, 13, 0), // Sep 13, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 109,
            studentName: "Isabella Taylor",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 16, 15, 0), // Sep 16, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 110,
            studentName: "Jack Anderson",
            subject: "VCE Biology",
            date: new Date(2025, 8, 17, 10, 0), // Sep 17, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 111,
            studentName: "Kate Martinez",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 19, 14, 0), // Sep 19, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 112,
            studentName: "Liam Thompson",
            subject: "VCE Biology",
            date: new Date(2025, 8, 20, 16, 0), // Sep 20, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 113,
            studentName: "Mia Garcia",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 23, 11, 0), // Sep 23, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 114,
            studentName: "Noah Rodriguez",
            subject: "VCE Biology",
            date: new Date(2025, 8, 24, 15, 30), // Sep 24, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 115,
            studentName: "Olivia White",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 26, 13, 0), // Sep 26, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 116,
            studentName: "Peter Harris",
            subject: "VCE Biology",
            date: new Date(2025, 8, 27, 14, 0), // Sep 27, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 117,
            studentName: "Quinn Clark",
            subject: "VCE Chemistry",
            date: new Date(2025, 8, 30, 16, 0), // Sep 30, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
        ],
        2: [
          // Michael Chen - New tutor, limited sessions
          {
            id: 6,
            studentName: "Liam O'Connor",
            subject: "HSC Mathematics Advanced",
            date: new Date(2024, 2, 23, 14, 0),
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          // September 2025 Calendar Data
          {
            id: 201,
            studentName: "Alex Chen",
            subject: "VCE Mathematics Methods",
            date: new Date(2025, 8, 1, 15, 0), // Sep 1, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 202,
            studentName: "Beth Davis",
            subject: "VCE Mathematics Specialist",
            date: new Date(2025, 8, 4, 14, 0), // Sep 4, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 203,
            studentName: "Chris Brown",
            subject: "VCE Mathematics Methods",
            date: new Date(2025, 8, 7, 16, 0), // Sep 7, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 204,
            studentName: "Diana Zhang",
            subject: "VCE Mathematics Specialist",
            date: new Date(2025, 8, 8, 10, 0), // Sep 8, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 205,
            studentName: "Ethan Wilson",
            subject: "VCE Mathematics Methods",
            date: new Date(2025, 8, 11, 15, 0), // Sep 11, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 206,
            studentName: "Fiona Lee",
            subject: "VCE Mathematics Specialist",
            date: new Date(2025, 8, 14, 13, 0), // Sep 14, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 207,
            studentName: "George Kim",
            subject: "VCE Mathematics Methods",
            date: new Date(2025, 8, 15, 16, 0), // Sep 15, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 208,
            studentName: "Hannah Park",
            subject: "VCE Mathematics Specialist",
            date: new Date(2025, 8, 18, 14, 0), // Sep 18, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 209,
            studentName: "Ian Smith",
            subject: "VCE Mathematics Methods",
            date: new Date(2025, 8, 21, 15, 0), // Sep 21, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 210,
            studentName: "Julia Taylor",
            subject: "VCE Mathematics Specialist",
            date: new Date(2025, 8, 22, 10, 0), // Sep 22, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 211,
            studentName: "Kevin Johnson",
            subject: "VCE Mathematics Methods",
            date: new Date(2025, 8, 25, 16, 0), // Sep 25, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 212,
            studentName: "Luna Chen",
            subject: "VCE Mathematics Specialist",
            date: new Date(2025, 8, 28, 13, 0), // Sep 28, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 213,
            studentName: "Max Davis",
            subject: "VCE Mathematics Methods",
            date: new Date(2025, 8, 29, 14, 0), // Sep 29, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
        ],
        3: [
          // Emma Thompson - English/History tutor
          {
            id: 7,
            studentName: "Olivia Martinez",
            subject: "QCE English",
            date: new Date(2024, 2, 20, 16, 0),
            duration: 75,
            status: SESSION_STATUS.COMPLETED,
            rating: 4,
            notes:
              "Worked on essay structure and analysis techniques. Student improved significantly.",
          },
          {
            id: 8,
            studentName: "Noah Patel",
            subject: "QCE Modern History",
            date: new Date(2024, 2, 22, 13, 0),
            duration: 60,
            status: SESSION_STATUS.COMPLETED,
            rating: 5,
            notes:
              "Covered World War II causes and consequences. Excellent discussion on historical significance.",
          },
          {
            id: 9,
            studentName: "Isabella Rodriguez",
            subject: "QCE Legal Studies",
            date: new Date(2024, 2, 25, 15, 0),
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          // September 2025 Calendar Data
          {
            id: 301,
            studentName: "Anna Green",
            subject: "VCE English Language",
            date: new Date(2025, 8, 2, 15, 0), // Sep 2, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 302,
            studentName: "Ben Johnson",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 3, 14, 0), // Sep 3, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 303,
            studentName: "Carla Lee",
            subject: "VCE English Language",
            date: new Date(2025, 8, 5, 16, 0), // Sep 5, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 304,
            studentName: "David Taylor",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 6, 13, 0), // Sep 6, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 305,
            studentName: "Emma Wilson",
            subject: "VCE English Language",
            date: new Date(2025, 8, 9, 15, 0), // Sep 9, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 306,
            studentName: "Frank Miller",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 10, 14, 0), // Sep 10, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 307,
            studentName: "Grace Kim",
            subject: "VCE English Language",
            date: new Date(2025, 8, 12, 16, 0), // Sep 12, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 308,
            studentName: "Henry Park",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 13, 13, 0), // Sep 13, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 309,
            studentName: "Isabella Smith",
            subject: "VCE English Language",
            date: new Date(2025, 8, 16, 15, 0), // Sep 16, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 310,
            studentName: "Jack Anderson",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 17, 14, 0), // Sep 17, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 311,
            studentName: "Kate Martinez",
            subject: "VCE English Language",
            date: new Date(2025, 8, 19, 16, 0), // Sep 19, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 312,
            studentName: "Liam Thompson",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 20, 13, 0), // Sep 20, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 313,
            studentName: "Mia Garcia",
            subject: "VCE English Language",
            date: new Date(2025, 8, 23, 15, 0), // Sep 23, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 314,
            studentName: "Noah Rodriguez",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 24, 14, 0), // Sep 24, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 315,
            studentName: "Olivia White",
            subject: "VCE English Language",
            date: new Date(2025, 8, 26, 16, 0), // Sep 26, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 316,
            studentName: "Peter Harris",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 27, 13, 0), // Sep 27, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 317,
            studentName: "Quinn Clark",
            subject: "VCE English Language",
            date: new Date(2025, 8, 30, 15, 0), // Sep 30, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
        ],
        4: [
          // James Wilson - Suspended tutor, historical sessions
          {
            id: 10,
            studentName: "Mason Lee",
            subject: "VCE Mathematical Methods",
            date: new Date(2024, 1, 15, 14, 0),
            duration: 60,
            status: SESSION_STATUS.COMPLETED,
            rating: 4,
            notes:
              "Last session before suspension. Covered calculus applications.",
          },
          {
            id: 11,
            studentName: "Charlotte Brown",
            subject: "VCE Specialist Mathematics",
            date: new Date(2024, 1, 18, 16, 0),
            duration: 90,
            status: SESSION_STATUS.COMPLETED,
            rating: 5,
            notes:
              "Advanced calculus and complex numbers. Student excelled in problem-solving.",
          },
          // September 2025 Calendar Data
          {
            id: 401,
            studentName: "Alex Brown",
            subject: "VCE Physics",
            date: new Date(2025, 8, 1, 16, 0), // Sep 1, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 402,
            studentName: "Beth Singh",
            subject: "VCE Physics",
            date: new Date(2025, 8, 4, 11, 0), // Sep 4, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 403,
            studentName: "Chris Williams",
            subject: "UCAT",
            date: new Date(2025, 8, 7, 15, 0), // Sep 7, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 404,
            studentName: "Diana Patel",
            subject: "VCE Physics",
            date: new Date(2025, 8, 8, 14, 0), // Sep 8, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 405,
            studentName: "Ethan Kumar",
            subject: "VCE Physics",
            date: new Date(2025, 8, 11, 16, 0), // Sep 11, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 406,
            studentName: "Fiona Lee",
            subject: "UCAT",
            date: new Date(2025, 8, 14, 13, 0), // Sep 14, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 407,
            studentName: "George Kim",
            subject: "VCE Physics",
            date: new Date(2025, 8, 15, 15, 0), // Sep 15, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 408,
            studentName: "Hannah Park",
            subject: "VCE Physics",
            date: new Date(2025, 8, 18, 10, 0), // Sep 18, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 409,
            studentName: "Ian Smith",
            subject: "UCAT",
            date: new Date(2025, 8, 21, 14, 0), // Sep 21, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 410,
            studentName: "Julia Taylor",
            subject: "VCE Physics",
            date: new Date(2025, 8, 22, 16, 0), // Sep 22, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 411,
            studentName: "Kevin Johnson",
            subject: "VCE Physics",
            date: new Date(2025, 8, 25, 11, 0), // Sep 25, 2025
            duration: 90,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 412,
            studentName: "Luna Chen",
            subject: "UCAT",
            date: new Date(2025, 8, 28, 15, 0), // Sep 28, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 413,
            studentName: "Max Davis",
            subject: "VCE Physics",
            date: new Date(2025, 8, 29, 13, 0), // Sep 29, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
        ],
        5: [
          // Dr. Jennifer Davis - Elite tutor, many sessions
          {
            id: 12,
            studentName: "Grace Wilson",
            subject: "VCE English Literature",
            date: new Date(2024, 2, 20, 10, 0),
            duration: 75,
            status: SESSION_STATUS.COMPLETED,
            rating: 5,
            notes:
              "Shakespeare analysis - Hamlet. Student demonstrated excellent critical thinking.",
          },
          {
            id: 13,
            studentName: "Oliver Taylor",
            subject: "UCAT",
            date: new Date(2024, 2, 21, 14, 0),
            duration: 120,
            status: SESSION_STATUS.COMPLETED,
            rating: 5,
            notes:
              "UCAT preparation - Verbal Reasoning section. Student improved from 60% to 85% accuracy.",
          },
          {
            id: 14,
            studentName: "Ruby Chen",
            subject: "VCE Legal Studies",
            date: new Date(2024, 2, 22, 16, 0),
            duration: 60,
            status: SESSION_STATUS.COMPLETED,
            rating: 4,
            notes:
              "Constitutional law review. Student needs more practice with case studies.",
          },
          {
            id: 15,
            studentName: "Lucas Martinez",
            subject: "UCAT",
            date: new Date(2024, 2, 25, 9, 0),
            duration: 120,
            status: SESSION_STATUS.COMPLETED,
            rating: 5,
            notes:
              "Abstract Reasoning practice. Student mastered pattern recognition techniques.",
          },
          {
            id: 16,
            studentName: "Ava Singh",
            subject: "VCE English Literature",
            date: new Date(2024, 2, 26, 11, 0),
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 17,
            studentName: "Ethan Williams",
            subject: "UCAT",
            date: new Date(2024, 2, 28, 15, 0),
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          // September 2025 Calendar Data
          {
            id: 501,
            studentName: "Alice Johnson",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 1, 10, 0), // Sep 1, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 502,
            studentName: "Ben Chen",
            subject: "UCAT",
            date: new Date(2025, 8, 2, 14, 0), // Sep 2, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 503,
            studentName: "Carla Davis",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 3, 16, 0), // Sep 3, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 504,
            studentName: "Daniel Kim",
            subject: "UCAT",
            date: new Date(2025, 8, 4, 9, 0), // Sep 4, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 505,
            studentName: "Emma Wilson",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 5, 11, 0), // Sep 5, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 506,
            studentName: "Frank Miller",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 6, 15, 0), // Sep 6, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 507,
            studentName: "Grace Lee",
            subject: "UCAT",
            date: new Date(2025, 8, 7, 13, 0), // Sep 7, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 508,
            studentName: "Henry Brown",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 8, 16, 0), // Sep 8, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 509,
            studentName: "Isabella Taylor",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 9, 10, 0), // Sep 9, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 510,
            studentName: "Jack Anderson",
            subject: "UCAT",
            date: new Date(2025, 8, 10, 14, 0), // Sep 10, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 511,
            studentName: "Kate Martinez",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 11, 11, 0), // Sep 11, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 512,
            studentName: "Liam Thompson",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 12, 15, 0), // Sep 12, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 513,
            studentName: "Mia Garcia",
            subject: "UCAT",
            date: new Date(2025, 8, 13, 9, 0), // Sep 13, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 514,
            studentName: "Noah Rodriguez",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 14, 16, 0), // Sep 14, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 515,
            studentName: "Olivia White",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 15, 13, 0), // Sep 15, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 516,
            studentName: "Peter Harris",
            subject: "UCAT",
            date: new Date(2025, 8, 16, 11, 0), // Sep 16, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 517,
            studentName: "Quinn Clark",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 17, 14, 0), // Sep 17, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 518,
            studentName: "Rachel Green",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 18, 10, 0), // Sep 18, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 519,
            studentName: "Sam Wilson",
            subject: "UCAT",
            date: new Date(2025, 8, 19, 15, 0), // Sep 19, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 520,
            studentName: "Tina Lee",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 20, 12, 0), // Sep 20, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 521,
            studentName: "Uma Patel",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 21, 16, 0), // Sep 21, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 522,
            studentName: "Victor Kim",
            subject: "UCAT",
            date: new Date(2025, 8, 22, 9, 0), // Sep 22, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 523,
            studentName: "Wendy Chen",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 23, 13, 0), // Sep 23, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 524,
            studentName: "Xavier Brown",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 24, 15, 0), // Sep 24, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 525,
            studentName: "Yara Singh",
            subject: "UCAT",
            date: new Date(2025, 8, 25, 11, 0), // Sep 25, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 526,
            studentName: "Zoe Taylor",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 26, 14, 0), // Sep 26, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 527,
            studentName: "Aaron Davis",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 27, 10, 0), // Sep 27, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 528,
            studentName: "Bella Wilson",
            subject: "UCAT",
            date: new Date(2025, 8, 28, 16, 0), // Sep 28, 2025
            duration: 120,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 529,
            studentName: "Charlie Lee",
            subject: "VCE English Literature",
            date: new Date(2025, 8, 29, 12, 0), // Sep 29, 2025
            duration: 75,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
          {
            id: 530,
            studentName: "Diana Park",
            subject: "VCE Legal Studies",
            date: new Date(2025, 8, 30, 15, 0), // Sep 30, 2025
            duration: 60,
            status: SESSION_STATUS.SCHEDULED,
            rating: null,
            notes: "",
          },
        ],
      };

      setSessions(sessionsData[tutor.id] || []);
    }
  }, [tutor]);

  const handleSave = () => {
    setIsEditing(false);
    onUpdate(tutorData);
  };

  const handleApproveChange = (requestId) => {
    setChangeRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "approved" } : req
      )
    );
  };

  const handleRejectChange = (requestId, reason) => {
    setChangeRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: "rejected", rejectionReason: reason }
          : req
      )
    );
  };

  const handleTierChange = (newTier) => {
    setTutorData((prev) => ({ ...prev, tier: newTier }));
  };

  const handleStatusChange = (newStatus) => {
    setTutorData((prev) => ({ ...prev, status: newStatus }));
  };

  const handleViewNotes = (session) => {
    setSelectedSessionNotes(session);
    setShowNotesModal(true);
  };

  const closeNotesModal = () => {
    setSelectedSessionNotes(null);
    setShowNotesModal(false);
  };

  const handleViewBankingDetails = () => {
    setShowBankingModal(true);
  };

  const closeBankingModal = () => {
    setShowBankingModal(false);
  };

  const handleVerifyBanking = () => {
    setShowVerificationModal(true);
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationStatus("");
    setVerificationNotes("");
  };

  const handleVerificationSubmit = () => {
    // Update compliance data based on verification
    const updatedCompliance = {
      ...compliance,
      banking: {
        ...compliance.banking,
        verified: verificationStatus === "verified",
        verificationDate:
          verificationStatus === "verified"
            ? new Date().toISOString().split("T")[0]
            : null,
        verificationMethod:
          verificationStatus === "verified"
            ? "Admin manual verification"
            : "Rejected",
        verificationNotes: verificationNotes,
      },
    };

    // Update tutor data
    const updatedTutor = {
      ...tutorData,
      bankingVerified: verificationStatus === "verified",
    };

    onUpdate(updatedTutor);
    closeVerificationModal();
  };

  const getMonthMatrix = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const matrix = [];
    let week = [];
    let dayOfWeek = firstDay.getDay();

    for (let i = 0; i < dayOfWeek; i++) week.push(null);
    for (let date = 1; date <= lastDay.getDate(); date++) {
      week.push(new Date(year, month, date));
      if (week.length === 7) {
        matrix.push(week);
        week = [];
      }
    }

    if (week.length) {
      while (week.length < 7) week.push(null);
      matrix.push(week);
    }
    return matrix;
  };

  const getSessionsForDate = (date) => {
    if (!date) return [];
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const renderOverviewTab = () => (
    <div className="tutor-profile-overview">
      <div className="row">
        <div className="col-md-4">
          <div className="tutor-profile-card">
            <h6>Basic Information</h6>
            <div className="tutor-info-item">
              <strong>Name:</strong> {tutorData.name}
            </div>
            <div className="tutor-info-item">
              <strong>Email:</strong> {tutorData.email}
            </div>
            <div className="tutor-info-item">
              <strong>Phone:</strong> {tutorData.phone}
            </div>
            <div className="tutor-info-item">
              <strong>University:</strong> {tutorData.university}
            </div>
            <div className="tutor-info-item">
              <strong>ATAR:</strong> {tutorData.atar}
            </div>
            <div className="tutor-info-item">
              <strong>Joined:</strong>{" "}
              {new Date(tutorData.joinedDate).toLocaleDateString("en-AU")}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="tutor-profile-card">
            <h6>Status & Tier</h6>
            <div className="tutor-info-item">
              <strong>Status:</strong>
              <select
                className="form-select form-select-sm ms-2"
                value={tutorData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={!isEditing}
              >
                {Object.entries(TUTOR_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="tutor-info-item">
              <strong>Tier:</strong>
              <select
                className="form-select form-select-sm ms-2"
                value={tutorData.tier}
                onChange={(e) => handleTierChange(e.target.value)}
                disabled={!isEditing}
              >
                {Object.entries(TUTOR_TIER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="tutor-info-item">
              <strong>Total Sessions:</strong> {tutorData.totalSessions}
            </div>
            <div className="tutor-info-item">
              <strong>Rating:</strong>{" "}
              {tutorData.rating ? `${tutorData.rating}/5` : "No rating"}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="tutor-profile-card">
            <h6>Subjects</h6>
            <div className="tutor-subjects-list">
              {tutorData.subjects.map((subject, index) => (
                <span key={index} className="badge bg-primary me-1 mb-1">
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mock compliance data based on tutor - moved to component scope
  const complianceData = {
    1: {
      // Sarah Johnson
      wwcc: {
        number: "WWCC-123456789",
        expiryDate: "2025-12-31",
        status: "approved",
        documentUrl: "#",
      },
      banking: {
        bsb: "123-456",
        accountNumber: "****7890",
        verified: true,
      },
      contract: {
        signed: true,
        type: "E-signed",
        signedDate: "2024-01-15",
        contractUrl: "#",
      },
    },
    2: {
      // Michael Chen
      wwcc: {
        number: "WWCC-987654321",
        expiryDate: "2025-08-15",
        status: "pending",
        documentUrl: "#",
      },
      banking: {
        bsb: "456-789",
        accountNumber: "****1234",
        verified: false,
      },
      contract: {
        signed: false,
        type: "E-signed",
        signedDate: null,
        contractUrl: "#",
      },
    },
    3: {
      // Emma Thompson
      wwcc: {
        number: "WWCC-456789123",
        expiryDate: "2026-03-20",
        status: "approved",
        documentUrl: "#",
      },
      banking: {
        bsb: "789-012",
        accountNumber: "****5678",
        verified: true,
      },
      contract: {
        signed: true,
        type: "E-signed",
        signedDate: "2024-02-10",
        contractUrl: "#",
      },
    },
    4: {
      // James Wilson
      wwcc: {
        number: "WWCC-321654987",
        expiryDate: "2024-01-30",
        status: "expired",
        documentUrl: "#",
      },
      banking: {
        bsb: "012-345",
        accountNumber: "****9012",
        verified: true,
      },
      contract: {
        signed: true,
        type: "E-signed",
        signedDate: "2023-11-05",
        contractUrl: "#",
      },
    },
    5: {
      // Dr. Jennifer Davis
      wwcc: {
        number: "WWCC-654321987",
        expiryDate: "2026-06-30",
        status: "approved",
        documentUrl: "#",
      },
      banking: {
        bsb: "345-678",
        accountNumber: "****3456",
        verified: true,
      },
      contract: {
        signed: true,
        type: "E-signed",
        signedDate: "2023-08-20",
        contractUrl: "#",
      },
    },
  };

  const compliance = complianceData[tutorData.id] || complianceData[1];

  const renderComplianceTab = () => {
    return (
      <div className="tutor-profile-compliance">
        <div className="row">
          <div className="col-md-6">
            <div className="tutor-profile-card">
              <h6>Working With Children Check (WWCC)</h6>
              <div className="compliance-item">
                <strong>Status:</strong>
                <span
                  className={`badge bg-${
                    compliance.wwcc.status === "approved"
                      ? "success"
                      : compliance.wwcc.status === "pending"
                      ? "warning"
                      : "danger"
                  } ms-2`}
                >
                  {compliance.wwcc.status === "approved"
                    ? "Approved"
                    : compliance.wwcc.status === "pending"
                    ? "Pending"
                    : "Expired"}
                </span>
              </div>
              <div className="compliance-item">
                <strong>Number:</strong> {compliance.wwcc.number}
              </div>
              <div className="compliance-item">
                <strong>Expiry Date:</strong> {compliance.wwcc.expiryDate}
              </div>
              <div className="compliance-item">
                <strong>Document:</strong>
                <button className="btn btn-sm btn-outline-primary ms-2">
                  <i className="fas fa-download"></i> Download
                </button>
              </div>
              <div className="compliance-item">
                {compliance.wwcc.status === "pending" && (
                  <>
                    <button className="btn btn-sm btn-success me-2">
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button className="btn btn-sm btn-danger me-2">
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </>
                )}
                {compliance.wwcc.status === "expired" && (
                  <button className="btn btn-sm btn-warning">
                    <i className="fas fa-bell"></i> Send Renewal Reminder
                  </button>
                )}
                {compliance.wwcc.status === "approved" && (
                  <button className="btn btn-sm btn-info">
                    <i className="fas fa-bell"></i> Send Expiry Reminder
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="tutor-profile-card">
              <h6>ABN & Banking</h6>
              <div className="compliance-item">
                <strong>ABN Number:</strong>{" "}
                {tutorData.abnNumber || "Not provided"}
              </div>
              <div className="compliance-item">
                <strong>Banking Verified:</strong>
                <span
                  className={`badge bg-${
                    compliance.banking.verified ? "success" : "danger"
                  } ms-2`}
                >
                  {compliance.banking.verified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div className="compliance-item">
                <strong>BSB:</strong> {compliance.banking.bsb}
              </div>
              <div className="compliance-item">
                <strong>Account Number:</strong>{" "}
                {compliance.banking.accountNumber}
              </div>
              <div className="compliance-item">
                {!compliance.banking.verified ? (
                  <>
                    <button className="btn btn-sm btn-success me-2">
                      <i className="fas fa-check"></i> Verify Banking
                    </button>
                    <button className="btn btn-sm btn-danger me-2">
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-info"
                    onClick={handleVerifyBanking}
                  >
                    <i className="fas fa-sync"></i> Re-verify
                  </button>
                )}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleViewBankingDetails}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="tutor-profile-card">
              <h6>Contract Status</h6>
              <div className="compliance-item">
                <strong>Contract Signed:</strong>
                <span
                  className={`badge bg-${
                    compliance.contract.signed ? "success" : "danger"
                  } ms-2`}
                >
                  {compliance.contract.signed ? "Signed" : "Not Signed"}
                </span>
              </div>
              <div className="compliance-item">
                <strong>Contract Type:</strong> {compliance.contract.type}
              </div>
              <div className="compliance-item">
                <strong>Signed Date:</strong>{" "}
                {compliance.contract.signedDate || "Not signed"}
              </div>
              <div className="compliance-item">
                {compliance.contract.signed ? (
                  <button className="btn btn-sm btn-primary me-2">
                    <i className="fas fa-file-pdf"></i> View Contract
                  </button>
                ) : (
                  <button className="btn btn-sm btn-warning me-2">
                    <i className="fas fa-paper-plane"></i> Send for Signature
                  </button>
                )}
                <button className="btn btn-sm btn-info">
                  <i className="fas fa-history"></i> View History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChangeRequestsTab = () => (
    <div className="tutor-profile-change-requests">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Change Requests Queue</h6>
        <span className="badge bg-info">
          {changeRequests.filter((req) => req.status === "pending").length}{" "}
          Pending
        </span>
      </div>

      {changeRequests.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="fas fa-inbox fa-2x mb-2"></i>
          <p>No change requests</p>
        </div>
      ) : (
        <div className="change-requests-list">
          {changeRequests.map((request) => (
            <div key={request.id} className="change-request-card">
              <div className="change-request-header">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">
                      {request.field === "intro"
                        ? "Profile Introduction"
                        : request.field === "subjects"
                        ? "Subject Changes"
                        : "Profile Update"}
                    </h6>
                    <small className="text-muted">
                      Submitted:{" "}
                      {new Date(request.submittedDate).toLocaleDateString(
                        "en-AU"
                      )}
                    </small>
                  </div>
                  <span
                    className={`badge bg-${
                      request.status === "pending"
                        ? "warning"
                        : request.status === "approved"
                        ? "success"
                        : "danger"
                    }`}
                  >
                    {request.status === "pending"
                      ? "Pending"
                      : request.status === "approved"
                      ? "Approved"
                      : "Rejected"}
                  </span>
                </div>
              </div>

              <div className="change-request-content mt-3">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-danger">Current Value:</h6>
                    <div className="change-value-box">
                      {Array.isArray(request.oldValue)
                        ? request.oldValue.map((item, idx) => (
                            <span key={idx} className="badge bg-secondary me-1">
                              {item}
                            </span>
                          ))
                        : request.oldValue}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-success">Requested Change:</h6>
                    <div className="change-value-box">
                      {Array.isArray(request.newValue)
                        ? request.newValue.map((item, idx) => (
                            <span key={idx} className="badge bg-primary me-1">
                              {item}
                            </span>
                          ))
                        : request.newValue}
                    </div>
                  </div>
                </div>

                <div className="change-request-comments mt-3">
                  <strong>Comments:</strong> {request.comments}
                </div>

                {request.status === "pending" && (
                  <div className="change-request-actions mt-3">
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApproveChange(request.id)}
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleRejectChange(
                          request.id,
                          "Please provide more details"
                        )
                      }
                    >
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </div>
                )}

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="rejection-reason mt-2">
                    <strong className="text-danger">Rejection Reason:</strong>{" "}
                    {request.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSessionsTab = () => (
    <div className="tutor-profile-sessions">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Sessions & Completed Lessons</h6>
        <div className="session-stats">
          <span className="badge bg-success me-2">
            {
              sessions.filter((s) => s.status === SESSION_STATUS.COMPLETED)
                .length
            }{" "}
            Completed
          </span>
          <span className="badge bg-primary">
            {
              sessions.filter((s) => s.status === SESSION_STATUS.SCHEDULED)
                .length
            }{" "}
            Scheduled
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.studentName}</td>
                <td>{session.subject}</td>
                <td>
                  {session.date.toLocaleDateString("en-AU")} at{" "}
                  {session.date.toLocaleTimeString("en-AU")}
                </td>
                <td>{session.duration} min</td>
                <td>
                  <span
                    className={`badge bg-${
                      session.status === SESSION_STATUS.COMPLETED
                        ? "success"
                        : session.status === SESSION_STATUS.SCHEDULED
                        ? "primary"
                        : "danger"
                    }`}
                  >
                    {SESSION_STATUS_LABELS[session.status]}
                  </span>
                </td>
                <td>
                  {session.rating ? (
                    <div className="d-flex align-items-center">
                      <i className="fas fa-star text-warning me-1"></i>
                      {session.rating}
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {session.notes ? (
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleViewNotes(session)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  ) : (
                    <span className="text-muted">No notes</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCalendarTab = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const renderDayView = () => {
      const daySessions = getSessionsForDate(selectedDate);
      const dayName = selectedDate.toLocaleDateString("en-AU", {
        weekday: "long",
      });
      const dayNumber = selectedDate.getDate();
      const monthName = monthNames[month];

      return (
        <div className="calendar-day-view">
          <div className="calendar-day-header mb-3">
            <h5 className="mb-0">
              {dayName}, {monthName} {dayNumber}, {year}
            </h5>
          </div>
          <div className="calendar-day-sessions">
            {daySessions.length > 0 ? (
              daySessions.map((session, idx) => (
                <div key={idx} className="calendar-session-card mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{session.studentName}</h6>
                      <p className="text-muted mb-1">{session.subject}</p>
                      <small className="text-primary">
                        {session.date.toLocaleTimeString("en-AU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {session.duration} minutes
                      </small>
                    </div>
                    <span
                      className={`badge bg-${
                        session.status === "completed"
                          ? "success"
                          : session.status === "scheduled"
                          ? "primary"
                          : "secondary"
                      }`}
                    >
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-4">
                <i className="fas fa-calendar-times fa-2x mb-2"></i>
                <p>No sessions scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderWeekView = () => {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
      }

      return (
        <div className="calendar-week-view">
          <div className="calendar-week-header mb-3">
            <h5 className="mb-0">
              Week of{" "}
              {startOfWeek.toLocaleDateString("en-AU", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {weekDays[6].toLocaleDateString("en-AU", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h5>
          </div>
          <div className="table-responsive">
            <table className="table table-sm tutor-calendar-table">
              <thead>
                <tr>
                  {weekDays.map((day, idx) => (
                    <th key={idx} className="text-center">
                      <div>{daysShort[day.getDay()]}</div>
                      <div className="fw-bold">{day.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {weekDays.map((day, idx) => {
                    const daySessions = getSessionsForDate(day);
                    return (
                      <td
                        key={idx}
                        className="align-top"
                        style={{ height: "200px" }}
                      >
                        {daySessions.map((session, sessionIdx) => (
                          <div
                            key={sessionIdx}
                            className="session-indicator mb-1"
                          >
                            <small className="text-primary">
                              {session.date.toLocaleTimeString("en-AU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                            <div className="session-title">
                              {session.studentName} - {session.subject}
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    const renderMonthView = () => {
      const monthMatrix = getMonthMatrix(year, month);

      return (
        <div className="calendar-month-view">
          <div className="table-responsive">
            <table className="table table-sm tutor-calendar-table">
              <thead>
                <tr>
                  {daysShort.map((d) => (
                    <th key={d} className="text-center">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthMatrix.map((week, i) => (
                  <tr key={i}>
                    {week.map((date, j) => {
                      const daySessions = getSessionsForDate(date);
                      return (
                        <td
                          key={j}
                          className={`align-top ${date ? "" : "bg-light"}`}
                        >
                          {date && (
                            <div>
                              <div className="fw-bold">{date.getDate()}</div>
                              {daySessions.map((session, idx) => (
                                <div
                                  key={idx}
                                  className="session-indicator mt-1"
                                >
                                  <small className="text-primary">
                                    {session.date.toLocaleTimeString("en-AU", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </small>
                                  <div className="session-title">
                                    {session.studentName} - {session.subject}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div className="tutor-profile-calendar">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6>Tutor Calendar - Available Classes</h6>
          <div className="btn-group">
            {Object.values(CALENDAR_VIEWS).map((view) => (
              <button
                key={view}
                className={`btn btn-sm ${
                  calendarView === view ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setCalendarView(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="calendar-navigation mb-3">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                if (calendarView === CALENDAR_VIEWS.DAY) {
                  newDate.setDate(selectedDate.getDate() - 1);
                } else if (calendarView === CALENDAR_VIEWS.WEEK) {
                  newDate.setDate(selectedDate.getDate() - 7);
                } else {
                  newDate.setMonth(selectedDate.getMonth() - 1);
                }
                setSelectedDate(newDate);
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h5 className="mb-0">
              {calendarView === CALENDAR_VIEWS.DAY
                ? `${monthNames[month]} ${selectedDate.getDate()}, ${year}`
                : calendarView === CALENDAR_VIEWS.WEEK
                ? `Week of ${monthNames[month]} ${year}`
                : `${monthNames[month]} ${year}`}
            </h5>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                if (calendarView === CALENDAR_VIEWS.DAY) {
                  newDate.setDate(selectedDate.getDate() + 1);
                } else if (calendarView === CALENDAR_VIEWS.WEEK) {
                  newDate.setDate(selectedDate.getDate() + 7);
                } else {
                  newDate.setMonth(selectedDate.getMonth() + 1);
                }
                setSelectedDate(newDate);
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {calendarView === CALENDAR_VIEWS.DAY && renderDayView()}
        {calendarView === CALENDAR_VIEWS.WEEK && renderWeekView()}
        {calendarView === CALENDAR_VIEWS.MONTH && renderMonthView()}
      </div>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "fas fa-user" },
    {
      id: "compliance",
      label: "Compliance & Documents",
      icon: "fas fa-shield-alt",
    },
    { id: "changes", label: "Change Requests", icon: "fas fa-edit" },
    {
      id: "sessions",
      label: "Sessions & Lessons",
      icon: "fas fa-calendar-check",
    },
    { id: "calendar", label: "Calendar", icon: "fas fa-calendar-alt" },
  ];

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-user me-2"></i>
              Tutor Profile - {tutorData.name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-3">
              {tabs.map((tab) => (
                <li key={tab.id} className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`${tab.icon} me-1`}></i>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Tab Content */}
            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "compliance" && renderComplianceTab()}
            {activeTab === "changes" && renderChangeRequestsTab()}
            {activeTab === "sessions" && renderSessionsTab()}
            {activeTab === "calendar" && renderCalendarTab()}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className={`btn ${isEditing ? "btn-success" : "btn-primary"}`}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <i className="fas fa-save me-1"></i>
                  Save Changes
                </>
              ) : (
                <>
                  <i className="fas fa-edit me-1"></i>
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Banking Verification Modal */}
      {showVerificationModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-shield-alt me-2"></i>
                  Banking Verification - {tutorData.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeVerificationModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Verification Process:</strong> Review the banking
                      details and verify the account information is correct and
                      valid.
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="banking-details-section">
                      <h6>Account Details to Verify</h6>
                      <div className="banking-detail-item">
                        <strong>Account Holder:</strong>
                        <span className="banking-detail-value">
                          {tutorData.name}
                        </span>
                      </div>
                      <div className="banking-detail-item">
                        <strong>BSB:</strong>
                        <span className="banking-detail-value">
                          {compliance.banking.bsb}
                        </span>
                      </div>
                      <div className="banking-detail-item">
                        <strong>Account Number:</strong>
                        <span className="banking-detail-value">
                          {compliance.banking.accountNumber}
                        </span>
                      </div>
                      <div className="banking-detail-item">
                        <strong>ABN:</strong>
                        <span className="banking-detail-value">
                          {tutorData.abnNumber || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="banking-details-section">
                      <h6>Verification Checklist</h6>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="check1"
                        />
                        <label className="form-check-label" htmlFor="check1">
                          Account holder name matches tutor name
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="check2"
                        />
                        <label className="form-check-label" htmlFor="check2">
                          BSB number is valid Australian format
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="check3"
                        />
                        <label className="form-check-label" htmlFor="check3">
                          Account number format is correct
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="check4"
                        />
                        <label className="form-check-label" htmlFor="check4">
                          ABN is valid (if provided)
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="check5"
                        />
                        <label className="form-check-label" htmlFor="check5">
                          No suspicious activity detected
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <label htmlFor="verificationStatus" className="form-label">
                      <strong>Verification Decision</strong>
                    </label>
                    <select
                      className="form-select"
                      id="verificationStatus"
                      value={verificationStatus}
                      onChange={(e) => setVerificationStatus(e.target.value)}
                    >
                      <option value="">Select verification status...</option>
                      <option value="verified">
                        Approve - Banking Verified
                      </option>
                      <option value="rejected">
                        Reject - Banking Not Verified
                      </option>
                      <option value="pending">Request More Information</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <label htmlFor="verificationNotes" className="form-label">
                      <strong>Verification Notes</strong>
                    </label>
                    <textarea
                      className="form-control"
                      id="verificationNotes"
                      rows="4"
                      placeholder="Add notes about the verification process, any issues found, or additional requirements..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {verificationStatus === "rejected" && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Rejection Notice:</strong> The tutor will be
                        notified of the rejection and will need to provide
                        updated banking information.
                      </div>
                    </div>
                  </div>
                )}

                {verificationStatus === "verified" && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="alert alert-success">
                        <i className="fas fa-check-circle me-2"></i>
                        <strong>Verification Approved:</strong> The tutor's
                        banking details have been verified and they can now
                        receive payments.
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeVerificationModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleVerificationSubmit}
                  disabled={!verificationStatus}
                >
                  <i className="fas fa-save me-1"></i>
                  Submit Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banking Details Modal */}
      {showBankingModal && (
        <div
          className="modal fade show d-block banking-details-modal"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-university me-2"></i>
                  Banking Details - {tutorData.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeBankingModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="banking-details-section">
                  <h6>Account Information</h6>
                  <div className="banking-detail-item">
                    <strong>Account Holder Name:</strong>
                    <span className="banking-detail-value">
                      {tutorData.name}
                    </span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>BSB Number:</strong>
                    <span className="banking-detail-value">
                      {compliance.banking.bsb}
                    </span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Account Number:</strong>
                    <span className="banking-detail-value">
                      {compliance.banking.accountNumber}
                    </span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Account Type:</strong>
                    <span className="banking-detail-value">
                      Savings Account
                    </span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Bank Name:</strong>
                    <span className="banking-detail-value">
                      Commonwealth Bank of Australia
                    </span>
                  </div>
                </div>

                <div className="banking-details-section">
                  <h6>Verification Status</h6>
                  <div className="banking-detail-item">
                    <strong>Verification Status:</strong>
                    <span
                      className={`badge bg-${
                        compliance.banking.verified ? "success" : "danger"
                      }`}
                    >
                      {compliance.banking.verified
                        ? "Verified"
                        : "Not Verified"}
                    </span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Verification Date:</strong>
                    <span className="banking-detail-value">
                      {compliance.banking.verified
                        ? "2024-01-15"
                        : "Not verified"}
                    </span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Verification Method:</strong>
                    <span className="banking-detail-value">
                      {compliance.banking.verified
                        ? "Micro-deposit verification"
                        : "Pending"}
                    </span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Last Updated:</strong>
                    <span className="banking-detail-value">2024-03-20</span>
                  </div>
                </div>

                <div className="banking-details-section">
                  <h6>Payment Information</h6>
                  <div className="banking-detail-item">
                    <strong>Payment Frequency:</strong>
                    <span className="banking-detail-value">Weekly</span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Next Payment Date:</strong>
                    <span className="banking-detail-value">2024-03-27</span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Total Payments Made:</strong>
                    <span className="banking-detail-value">$2,450.00</span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Last Payment Amount:</strong>
                    <span className="banking-detail-value">$325.00</span>
                  </div>
                </div>

                <div className="banking-details-section">
                  <h6>Security & Compliance</h6>
                  <div className="banking-detail-item">
                    <strong>Account Status:</strong>
                    <span className="badge bg-success">Active</span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Fraud Protection:</strong>
                    <span className="badge bg-success">Enabled</span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Two-Factor Authentication:</strong>
                    <span className="badge bg-success">Enabled</span>
                  </div>
                  <div className="banking-detail-item">
                    <strong>Compliance Check:</strong>
                    <span className="badge bg-success">Passed</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeBankingModal}
                >
                  Close
                </button>
                <button type="button" className="btn btn-warning">
                  <i className="fas fa-edit me-1"></i>
                  Update Details
                </button>
                <button type="button" className="btn btn-info">
                  <i className="fas fa-download me-1"></i>
                  Export Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Notes Modal */}
      {showNotesModal && selectedSessionNotes && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-sticky-note me-2"></i>
                  Session Notes - {selectedSessionNotes.studentName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeNotesModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Student:</strong> {selectedSessionNotes.studentName}
                  </div>
                  <div className="col-md-6">
                    <strong>Subject:</strong> {selectedSessionNotes.subject}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Date:</strong>{" "}
                    {selectedSessionNotes.date.toLocaleDateString("en-AU")}
                  </div>
                  <div className="col-md-6">
                    <strong>Time:</strong>{" "}
                    {selectedSessionNotes.date.toLocaleTimeString("en-AU")}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Duration:</strong> {selectedSessionNotes.duration}{" "}
                    minutes
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong>
                    <span
                      className={`badge bg-${
                        selectedSessionNotes.status === SESSION_STATUS.COMPLETED
                          ? "success"
                          : selectedSessionNotes.status ===
                            SESSION_STATUS.SCHEDULED
                          ? "primary"
                          : "danger"
                      } ms-2`}
                    >
                      {SESSION_STATUS_LABELS[selectedSessionNotes.status]}
                    </span>
                  </div>
                </div>
                {selectedSessionNotes.rating && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>Rating:</strong>
                      <div className="d-flex align-items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${
                              i < selectedSessionNotes.rating
                                ? "text-warning"
                                : "text-muted"
                            } me-1`}
                          ></i>
                        ))}
                        <span className="ms-2">
                          {selectedSessionNotes.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="row">
                  <div className="col-12">
                    <strong>Session Notes:</strong>
                    <div className="mt-2 p-3 bg-light rounded">
                      {selectedSessionNotes.notes}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeNotesModal}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-edit me-1"></i>
                  Edit Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorProfileModal;
