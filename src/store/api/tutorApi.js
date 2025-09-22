// src/store/api/tutorApi.js - Studentni chiqarish uchun yangi endpoint
import { baseApi } from "./baseApi";

export const tutorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getTutorDashboard: builder.query({
      query: () => "/tutor/dashboard",
      providesTags: ["Dashboard"],
    }),

    // My Clubs - O'zgartirish: Barcha kurslar uchun
    getMyClubs: builder.query({
      query: () => "/tutor/clubs",
      providesTags: ["Club"],
    }),

    // Applications
    getApplications: builder.query({
      query: (status = "pending") => `/tutor/applications?status=${status}`,
      providesTags: ["Application"],
    }),

    processApplication: builder.mutation({
      query: ({ id, action, rejectionReason }) => ({
        url: `/tutor/application/${id}/process`,
        method: "POST",
        body: { action, rejectionReason },
      }),
      invalidatesTags: ["Application", "Club", "Dashboard"],
    }),

    // Attendance
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/tutor/attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),

    getAttendanceHistory: builder.query({
      query: ({ clubId, startDate, endDate, page = 1, limit = 20 }) => ({
        url: `/tutor/attendance/${clubId}`,
        params: { startDate, endDate, page, limit },
      }),
      providesTags: ["Attendance"],
    }),

    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tutor/attendance/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    addTelegramPost: builder.mutation({
      query: ({ id, telegramPostLink }) => ({
        url: `/tutor/attendance/${id}/telegram-post`,
        method: "POST",
        body: { telegramPostLink },
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Get attendance by specific date - O'zgartirish: Mavjudlikni tekshirish
    getAttendanceByDate: builder.query({
      query: ({ date, clubId }) => ({
        url: "/tutor/attendance/by-date",
        params: { date, clubId },
      }),
      providesTags: ["Attendance"],
    }),

    // Get students for a specific club - O'zgartirish: "all" uchun barcha studentlar
    getClubStudents: builder.query({
      query: (clubId) => {
        if (clubId === "all" || !clubId) {
          return "/tutor/all-students"; // Barcha studentlar uchun yangi endpoint
        }
        return `/clubs/${clubId}/students`;
      },
      providesTags: (result, error, clubId) => [
        { type: "Club", id: `students-${clubId}` },
      ],
    }),

    // Yangi: Studentni kursdan chiqarish
    removeStudentFromClub: builder.mutation({
      query: ({ studentId, clubId }) => ({
        url: `/tutor/club/${clubId}/remove-student`,
        method: "POST",
        body: { studentId },
      }),
      invalidatesTags: (result, error, { clubId }) => [
        { type: "Club", id: `students-${clubId}` },
        { type: "Club", id: clubId },
        "Dashboard",
      ],
    }),

    // Get club details
    getClubDetails: builder.query({
      query: (clubId) => `/clubs/${clubId}`,
      providesTags: (result, error, clubId) => [{ type: "Club", id: clubId }],
    }),

    // Get attendance statistics for dashboard
    getAttendanceStatistics: builder.query({
      query: ({ clubId, startDate, endDate, groupBy = "day" }) => ({
        url: "/attendance/statistics",
        params: { clubId, startDate, endDate, groupBy },
      }),
      providesTags: ["Attendance"],
    }),

    // Get student attendance summary
    getStudentAttendanceSummary: builder.query({
      query: ({ studentId, clubId, period = "month" }) => ({
        url: `/attendance/student/${studentId}/summary`,
        params: { clubId, period },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `summary-${studentId}` },
      ],
    }),

    // Bulk mark attendance for multiple sessions
    bulkMarkAttendance: builder.mutation({
      query: (data) => ({
        url: "/tutor/attendance/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),

    // Get absent students for a specific date/club
    getAbsentStudents: builder.query({
      query: ({ date, clubId, limit = 20 }) => ({
        url: "/attendance/absent-students",
        params: { date, clubId, limit },
      }),
      providesTags: ["Attendance"],
    }),

    // Send attendance notification
    sendAttendanceNotification: builder.mutation({
      query: ({ attendanceId, type = "telegram" }) => ({
        url: `/attendance/${attendanceId}/notify`,
        method: "POST",
        body: { type },
      }),
    }),

    // Get attendance comparison between clubs
    getAttendanceComparison: builder.query({
      query: ({ clubIds, startDate, endDate }) => ({
        url: "/attendance/compare",
        params: { clubIds: clubIds.join(","), startDate, endDate },
      }),
      providesTags: ["Attendance"],
    }),

    // Export attendance report
    exportAttendanceReport: builder.mutation({
      query: ({ format, ...params }) => ({
        url: `/attendance/export/${format}`,
        method: "POST",
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get attendance trends
    getAttendanceTrends: builder.query({
      query: ({ clubId, period = "month" }) => ({
        url: "/attendance/trends",
        params: { clubId, period },
      }),
      providesTags: ["Attendance"],
    }),

    // Update club information (for o'qituvchis with permission)
    updateClub: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tutor/club/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Club", id },
        "Dashboard",
      ],
    }),

    // Get club announcements
    getClubAnnouncements: builder.query({
      query: (clubId) => `/clubs/${clubId}/announcements`,
      providesTags: (result, error, clubId) => [
        { type: "Club", id: `announcements-${clubId}` },
      ],
    }),

    // Add club announcement
    addClubAnnouncement: builder.mutation({
      query: ({ clubId, ...data }) => ({
        url: `/tutor/club/${clubId}/announcement`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { clubId }) => [
        { type: "Club", id: `announcements-${clubId}` },
      ],
    }),

    // Get attendance warnings (low attendance students)
    getAttendanceWarnings: builder.query({
      query: ({ threshold = 75, clubId }) => ({
        url: "/attendance/warnings",
        params: { threshold, clubId },
      }),
      providesTags: ["Attendance"],
    }),

    // Generate QR code for attendance
    generateAttendanceQR: builder.mutation({
      query: ({ clubId, date }) => ({
        url: "/attendance/generate-qr",
        method: "POST",
        body: { clubId, date },
      }),
    }),

    // Verify attendance with QR code
    verifyAttendanceQR: builder.mutation({
      query: ({ qrCode, studentId }) => ({
        url: "/attendance/verify-qr",
        method: "POST",
        body: { qrCode, studentId },
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Add note to attendance
    addAttendanceNote: builder.mutation({
      query: ({ attendanceId, note }) => ({
        url: `/attendance/${attendanceId}/note`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (result, error, { attendanceId }) => [
        { type: "Attendance", id: attendanceId },
      ],
    }),

    // Get all students from all clubs (for "Barcha kurslar" option)
    getAllStudents: builder.query({
      query: () => "/tutor/all-students",
      providesTags: ["Student"],
    }),
  }),
});

export const {
  useGetTutorDashboardQuery,
  useGetMyClubsQuery,
  useGetApplicationsQuery,
  useProcessApplicationMutation,
  useMarkAttendanceMutation,
  useGetAttendanceHistoryQuery,
  useUpdateAttendanceMutation,
  useAddTelegramPostMutation,
  useGetAttendanceByDateQuery,
  useGetClubStudentsQuery,
  useRemoveStudentFromClubMutation, // Yangi hook
  useGetClubDetailsQuery,
  useGetAttendanceStatisticsQuery,
  useGetStudentAttendanceSummaryQuery,
  useBulkMarkAttendanceMutation,
  useGetAbsentStudentsQuery,
  useSendAttendanceNotificationMutation,
  useGetAttendanceComparisonQuery,
  useExportAttendanceReportMutation,
  useGetAttendanceTrendsQuery,
  useUpdateClubMutation,
  useGetClubAnnouncementsQuery,
  useAddClubAnnouncementMutation,
  useGetAttendanceWarningsQuery,
  useGenerateAttendanceQRMutation,
  useVerifyAttendanceQRMutation,
  useAddAttendanceNoteMutation,
  useGetAllStudentsQuery, // Yangi hook
} = tutorApi;
