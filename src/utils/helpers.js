import dayjs from "dayjs";
import { message } from "antd";
import {
  STATUS_COLORS,
  STATUS_TEXTS,
  WEEK_DAYS,
  DATE_FORMATS,
} from "./constants";

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Add country code if missing
  const withCode = cleaned.startsWith("998") ? cleaned : `998${cleaned}`;

  // Format for display: +998 90 123-45-67
  if (withCode.length === 12) {
    return `+${withCode.slice(0, 3)} ${withCode.slice(3, 5)} ${withCode.slice(
      5,
      8
    )}-${withCode.slice(8, 10)}-${withCode.slice(10, 12)}`;
  }

  return phone;
};

// Parse phone number for API
export const parsePhoneNumber = (phone) => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");
  const withCode = cleaned.startsWith("998") ? cleaned : `998${cleaned}`;

  return `+${withCode}`;
};

// Format date
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return "";
  return dayjs(date).format(format);
};

// Parse date for API
export const parseDate = (date) => {
  if (!date) return null;
  return dayjs(date).format(DATE_FORMATS.API);
};

// Get status color
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || "default";
};

// Get status text
export const getStatusText = (status) => {
  return STATUS_TEXTS[status] || status;
};

// Format week days
export const formatWeekDays = (days) => {
  if (!days || !Array.isArray(days)) return "";
  return days.map((day) => WEEK_DAYS[day]).join(", ");
};

// Get week day name
export const getWeekDayName = (dayNumber) => {
  return WEEK_DAYS[dayNumber] || "";
};

// Calculate attendance percentage
export const calculateAttendancePercentage = (present, total) => {
  if (!total || total === 0) return 0;
  return ((present / total) * 100).toFixed(1);
};

// Get attendance status color
export const getAttendanceStatusColor = (percentage) => {
  const value = parseFloat(percentage);
  if (value >= 90) return "success";
  if (value >= 75) return "warning";
  return "error";
};

// Format time range
export const formatTimeRange = (start, end) => {
  if (!start || !end) return "";
  return `${start} - ${end}`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Validate email
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate phone number
export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 9 || cleaned.length === 12;
};

// Validate Uzbek student ID
export const validateStudentId = (id) => {
  // Assuming student ID is numeric and 6-8 digits
  const regex = /^\d{6,8}$/;
  return regex.test(id);
};

// Show success message
export const showSuccess = (msg) => {
  message.success(msg);
};

// Show error message
export const showError = (msg) => {
  message.error(msg);
};

// Show warning message
export const showWarning = (msg) => {
  message.warning(msg);
};

// Show info message
export const showInfo = (msg) => {
  message.info(msg);
};

// Handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || "Server xatosi";
    showError(message);
  } else if (error.request) {
    // Request made but no response
    showError("Serverga ulanib bo'lmadi");
  } else {
    // Something else happened
    showError("Xatolik yuz berdi");
  }

  console.error("API Error:", error);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Sort array of objects by key
export const sortByKey = (array, key, order = "asc") => {
  return array.sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (order === "asc") {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

// Filter unique values
export const getUniqueValues = (array, key) => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Calculate age from birth date
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;

  const birth = dayjs(birthDate);
  const today = dayjs();

  return today.diff(birth, "year");
};

// Get current academic year
export const getCurrentAcademicYear = () => {
  const now = dayjs();
  const year = now.year();
  const month = now.month() + 1; // 0-indexed

  // Academic year starts in September
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

// Get current semester
export const getCurrentSemester = () => {
  const month = dayjs().month() + 1; // 0-indexed

  // Fall semester: September - January
  // Spring semester: February - June
  if (month >= 9 || month <= 1) {
    return "Kuzgi semestr";
  } else {
    return "Bahorgi semestr";
  }
};

// Check if date is today
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), "day");
};

// Check if date is past
export const isPastDate = (date) => {
  return dayjs(date).isBefore(dayjs(), "day");
};

// Check if date is future
export const isFutureDate = (date) => {
  return dayjs(date).isAfter(dayjs(), "day");
};

// Get week type (odd/even)
export const getWeekType = (date = dayjs()) => {
  const startOfYear = dayjs(date).startOf("year");
  const weekNumber = Math.ceil(dayjs(date).diff(startOfYear, "day") / 7);
  return weekNumber % 2 === 0 ? "even" : "odd";
};

// Format duration
export const formatDuration = (minutes) => {
  if (!minutes) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours} soat ${mins > 0 ? `${mins} daqiqa` : ""}`.trim();
  }

  return `${mins} daqiqa`;
};

// Download file
export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showSuccess("Nusxalandi");
    return true;
  } catch (error) {
    showError("Nusxalashda xatolik");
    return false;
  }
};

// Export default
export default {
  formatPhoneNumber,
  parsePhoneNumber,
  formatDate,
  parseDate,
  getStatusColor,
  getStatusText,
  formatWeekDays,
  getWeekDayName,
  calculateAttendancePercentage,
  getAttendanceStatusColor,
  formatTimeRange,
  formatFileSize,
  validateEmail,
  validatePhoneNumber,
  validateStudentId,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  handleApiError,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  generateId,
  sortByKey,
  groupBy,
  getUniqueValues,
  calculateAge,
  getCurrentAcademicYear,
  getCurrentSemester,
  isToday,
  isPastDate,
  isFutureDate,
  getWeekType,
  formatDuration,
  downloadFile,
  copyToClipboard,
};
