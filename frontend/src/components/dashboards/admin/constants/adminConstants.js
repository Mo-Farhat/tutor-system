// Admin Dashboard Constants and Enums
// Reusing existing patterns from Student/Tutor modules

// Admin Navigation Links
export const ADMIN_NAV_LINKS = [
  {
    name: "Dashboard",
    path: "/dashboard/admin/home",
    icon: "fas fa-tachometer-alt",
  },
  {
    name: "Tutors",
    path: "/dashboard/admin/tutors",
    icon: "fas fa-chalkboard-teacher",
  },
  {
    name: "Students",
    path: "/dashboard/admin/students",
    icon: "fas fa-user-graduate",
  },
  {
    name: "Assignments",
    path: "/dashboard/admin/assignments",
    icon: "fas fa-user-friends",
  },
  {
    name: "Calendar",
    path: "/dashboard/admin/calendar",
    icon: "fas fa-calendar-alt",
  },
  {
    name: "Finance",
    path: "/dashboard/admin/finance",
    icon: "fas fa-dollar-sign",
  },
  {
    name: "Packages",
    path: "/dashboard/admin/packages",
    icon: "fas fa-box-open",
  },
  {
    name: "Referral Program",
    path: "/dashboard/admin/referral",
    icon: "fas fa-gift",
  },
  { name: "Blog Posting", path: "/dashboard/admin/blog", icon: "fas fa-blog" },
  {
    name: "Notifications Centre",
    path: "/dashboard/admin/notifications",
    icon: "fas fa-bell",
  },
  {
    name: "Contact Us",
    path: "/dashboard/admin/support",
    icon: "fas fa-headset",
  },
  { name: "Settings", path: "/dashboard/admin/settings", icon: "fas fa-cog" },
];

// Tutor Status Options
export const TUTOR_STATUS = {
  PENDING_REVIEW: "pending_review",
  LIVE: "live",
  SUSPENDED: "suspended",
  CHANGES_REQUESTED: "changes_requested",
};

export const TUTOR_STATUS_LABELS = {
  [TUTOR_STATUS.PENDING_REVIEW]: "Pending Review",
  [TUTOR_STATUS.LIVE]: "Live",
  [TUTOR_STATUS.SUSPENDED]: "Suspended",
  [TUTOR_STATUS.CHANGES_REQUESTED]: "Changes Requested",
};

export const TUTOR_STATUS_COLORS = {
  [TUTOR_STATUS.PENDING_REVIEW]: "warning",
  [TUTOR_STATUS.LIVE]: "success",
  [TUTOR_STATUS.SUSPENDED]: "danger",
  [TUTOR_STATUS.CHANGES_REQUESTED]: "info",
};

// Tutor Tier Options
export const TUTOR_TIERS = {
  GOLD: "gold",
  PREMIUM: "premium",
  ELITE: "elite",
};

export const TUTOR_TIER_LABELS = {
  [TUTOR_TIERS.GOLD]: "Gold",
  [TUTOR_TIERS.PREMIUM]: "Premium",
  [TUTOR_TIERS.ELITE]: "Elite",
};

export const TUTOR_TIER_COLORS = {
  [TUTOR_TIERS.GOLD]: "warning",
  [TUTOR_TIERS.PREMIUM]: "primary",
  [TUTOR_TIERS.ELITE]: "dark",
};

// Student Status Options
export const STUDENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  CONSULTATION_PENDING: "consultation_pending",
};

export const STUDENT_STATUS_LABELS = {
  [STUDENT_STATUS.ACTIVE]: "Active",
  [STUDENT_STATUS.INACTIVE]: "Inactive",
  [STUDENT_STATUS.SUSPENDED]: "Suspended",
  [STUDENT_STATUS.CONSULTATION_PENDING]: "Consultation Pending",
};

// Session Status Options
export const SESSION_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

export const SESSION_STATUS_LABELS = {
  [SESSION_STATUS.SCHEDULED]: "Scheduled",
  [SESSION_STATUS.COMPLETED]: "Completed",
  [SESSION_STATUS.CANCELLED]: "Cancelled",
  [SESSION_STATUS.NO_SHOW]: "No Show",
};

// Year Levels (from existing patterns)
export const YEAR_LEVELS = ["Year 1-10", "Year 11/12"];

// Curricula/States for Year 11/12
export const YEAR_11_12_CURRICULA = [
  "VCE",
  "QCE",
  "SACE",
  "HSC",
  "WACE",
  "NTCET",
  "BSSS",
  "IB",
  "Medical Entrance",
];

// States for Year 1-10
export const YEAR_1_10_STATES = [
  "VIC",
  "QLD",
  "SA",
  "NSW",
  "WA",
  "NT",
  "ACT",
  "TAS",
  "IB",
];

// Common Subjects (from existing data)
export const COMMON_SUBJECTS = {
  VCE: [
    "Physics",
    "Chemistry",
    "Biology",
    "General Maths",
    "Mathematical Methods",
    "Specialist Mathematics",
    "Further Mathematics",
    "Legal Studies",
    "Business",
    "Psychology",
    "Economics",
    "English Literature",
    "English Language",
    "Health and Human Development",
    "English as an Additional Language (EAL)",
    "Accounting",
    "Ancient History",
    "Geography",
    "History Revolutions",
    "French",
    "Latin",
    "Japanese",
    "Environmental Science",
    "UCAT",
    "Physical Education",
    "Music Performance",
    "Philosophy",
    "Engineering",
    "Politics",
  ],
  QCE: [
    "English",
    "Chemistry",
    "Biology",
    "Physics",
    "General Maths",
    "Mathematical Methods",
    "Specialist Mathematics",
    "UCAT",
    "Legal Studies",
    "Business",
    "Economics",
    "English Literature",
    "English as an Additional Language (EAL)",
    "Accounting",
    "Modern History",
    "Ancient History",
    "English Literature and Extension 1",
    "Study of Religion",
    "French",
    "Japanese",
    "Physical Education",
    "Music Performance",
    "Philosophy",
    "Engineering",
  ],
  HSC: [
    "Chemistry",
    "Biology",
    "Physics",
    "Advanced Mathematics",
    "UCAT",
    "Legal Studies",
    "Business",
    "Psychology",
    "Economics",
    "English Literature",
    "English Advanced",
    "Extension 1 Mathematics",
    "English Standard",
    "English as an Additional Language (EAL)",
    "Accounting",
    "Standard Maths",
    "Extension 2 Mathematics",
    "Modern History",
    "Personal Development, Health and Physical Education",
    "Ancient History",
    "English Literature and Extension 1",
    "English Extension 2",
    "Geography",
    "Study of Religion",
    "French",
    "Latin",
    "Japanese",
    "Society and Culture",
    "Music Performance",
    "Philosophy",
    "Engineering",
  ],
};

// Australian States (from existing patterns)
export const AUSTRALIAN_STATES = [
  "Australian Capital Territory",
  "New South Wales",
  "Northern Territory",
  "Queensland",
  "South Australia",
  "Tasmania",
  "Victoria",
  "Western Australia",
];

// Package Types
export const PACKAGE_TYPES = {
  STANDARD: "standard",
  PREMIUM: "premium",
  CUSTOM: "custom",
};

// Badge Categories (from existing tutor system)
export const BADGE_CATEGORIES = {
  ATTENDANCE: "Attendance",
  MILESTONES: "Milestones",
  STREAKS: "Streaks",
  ACADEMIC: "Academic",
  BEHAVIOR: "Behavior",
};

// Priority Levels for Support Tickets
export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.LOW]: "Low",
  [PRIORITY_LEVELS.MEDIUM]: "Medium",
  [PRIORITY_LEVELS.HIGH]: "High",
  [PRIORITY_LEVELS.URGENT]: "Urgent",
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: "secondary",
  [PRIORITY_LEVELS.MEDIUM]: "info",
  [PRIORITY_LEVELS.HIGH]: "warning",
  [PRIORITY_LEVELS.URGENT]: "danger",
};

// Calendar View Types
export const CALENDAR_VIEWS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Document Status
export const DOCUMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

// Compliance Alert Types
export const COMPLIANCE_ALERT_TYPES = {
  WWCC_EXPIRING: "wwcc_expiring",
  WWCC_EXPIRED: "wwcc_expired",
  ABN_MISSING: "abn_missing",
  CONTRACT_MISSING: "contract_missing",
  DOCUMENTS_INCOMPLETE: "documents_incomplete",
};

// Referral Credit Amount (configurable constant)
export const REFERRAL_CREDIT_AMOUNT = 20;

// Default package discount for 10-hour packages
export const DEFAULT_PACKAGE_DISCOUNT = 50;
