// API endpoints
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Application routes
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  MY_CLUBS: "/my-clubs",
  APPLICATIONS: "/applications",
  ATTENDANCE: "/attendance",
  STUDENTS: "/students",
  PROFILE: "/profile",
};

// User roles
export const ROLES = {
  UNIVERSITY_ADMIN: "university_admin",
  FACULTY_ADMIN: "faculty_admin",
  TUTOR: "tutor",
  STUDENT: "student",
};

// Application status
export const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  EXCUSED: "excused",
};

// Week types
export const WEEK_TYPES = {
  ODD: "odd",
  EVEN: "even",
  BOTH: "both",
};

// Week days
export const WEEK_DAYS = {
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
  7: "Yakshanba",
};

// Status colors for Ant Design tags
export const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  active: "success",
  inactive: "default",
  present: "success",
  absent: "error",
  excused: "warning",
};

// Status texts in Uzbek
export const STATUS_TEXTS = {
  pending: "Kutilmoqda",
  approved: "Qabul qilingan",
  rejected: "Rad etilgan",
  active: "Faol",
  inactive: "Faol emas",
  present: "Kelgan",
  absent: "Kelmagan",
  excused: "Sababli",
};

// Pagination settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ["10", "20", "50", "100"],
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "DD.MM.YYYY",
  DISPLAY_WITH_TIME: "DD.MM.YYYY HH:mm",
  API: "YYYY-MM-DD",
  TIME_ONLY: "HH:mm",
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: "Muvaffaqiyatli kirish!",
    LOGOUT: "Tizimdan chiqdingiz",
    APPLICATION_APPROVED: "Ariza qabul qilindi",
    APPLICATION_REJECTED: "Ariza rad etildi",
    ATTENDANCE_MARKED: "Davomat muvaffaqiyatli saqlandi",
    PROFILE_UPDATED: "Profil ma'lumotlari yangilandi",
    PASSWORD_CHANGED: "Parol muvaffaqiyatli o'zgartirildi",
    DATA_SAVED: "Ma'lumotlar saqlandi",
  },
  ERROR: {
    LOGIN_FAILED: "Login yoki parol xato",
    PERMISSION_DENIED: "Ruxsat berilmagan",
    NETWORK_ERROR: "Tarmoq xatosi",
    SERVER_ERROR: "Server xatosi",
    NOT_FOUND: "Ma'lumot topilmadi",
    VALIDATION_ERROR: "Ma'lumotlarni tekshirishda xatolik",
    SESSION_EXPIRED: "Sessiya muddati tugadi",
  },
  WARNING: {
    FILL_REQUIRED: "Barcha majburiy maydonlarni to'ldiring",
    SELECT_CLUB: "Avval to'garakni tanlang",
    SELECT_DATE: "Sanani tanlang",
    NO_DATA: "Ma'lumot mavjud emas",
  },
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: "#722ed1",
  SECONDARY: "#eb2f96",
  SUCCESS: "#52c41a",
  WARNING: "#fa8c16",
  ERROR: "#f5222d",
  INFO: "#1890ff",
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
};

// Validation rules
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_PATTERN: /^\+998[0-9]{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// File upload settings
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif"],
  ACCEPTED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

// Notification settings
export const NOTIFICATION = {
  DURATION: 4.5,
  PLACEMENT: "topRight",
};

// Table settings
export const TABLE = {
  SCROLL_Y: 400,
  DEFAULT_PAGE_SIZE: 10,
  BORDERED: false,
  SIZE: "middle",
};

// Form settings
export const FORM = {
  LAYOUT: "vertical",
  SIZE: "large",
  VALIDATE_TRIGGER: "onBlur",
};

// Export formats
export const EXPORT_FORMATS = {
  EXCEL: "xlsx",
  PDF: "pdf",
  CSV: "csv",
};

// Time slots for scheduling
export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

// Default values
export const DEFAULTS = {
  AVATAR_URL: "/default-avatar.png",
  CLUB_CAPACITY: 30,
  ATTENDANCE_WARNING_THRESHOLD: 75, // percentage
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
};
