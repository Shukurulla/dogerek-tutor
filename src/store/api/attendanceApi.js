// src/store/api/attendanceApi.js
import { baseApi } from "./baseApi";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get attendance report
    getAttendanceReport: builder.query({
      query: ({ startDate, endDate, facultyId }) => ({
        url: "/attendance/report",
        params: { startDate, endDate, facultyId },
      }),
      providesTags: ["Attendance"],
    }),

    // Get student attendance - UPDATED FOR MODAL
    getStudentAttendance: builder.query({
      query: ({ studentId, clubId, startDate, endDate }) => ({
        url: `/attendance/student/${studentId}`,
        params: { clubId, startDate, endDate },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `student-${studentId}` },
      ],
      transformResponse: (response) => {
        // Format the response for better usage in modal
        if (response?.success && response?.data) {
          const data = response.data;

          // Calculate additional statistics if not present
          if (!data.statistics && data.attendance) {
            const totalClasses = data.attendance.length;
            const presentCount = data.attendance.filter(
              (a) => a.present
            ).length;
            const absentCount = totalClasses - presentCount;
            const attendancePercentage =
              totalClasses > 0
                ? ((presentCount / totalClasses) * 100).toFixed(1)
                : 0;

            data.statistics = {
              totalClasses,
              presentCount,
              absentCount,
              attendancePercentage,
            };
          }

          // Sort attendance by date (newest first)
          if (data.attendance) {
            data.attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
          }

          return response;
        }
        return response;
      },
    }),

    // Get club attendance report
    getClubAttendanceReport: builder.query({
      query: ({ clubId, startDate, endDate }) => ({
        url: `/attendance/club/${clubId}/report`,
        params: { startDate, endDate },
      }),
      providesTags: (result, error, { clubId }) => [
        { type: "Attendance", id: `club-${clubId}` },
      ],
    }),

    // Mark attendance (for tutor)
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/tutor/attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),

    // Update attendance (for tutor)
    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tutor/attendance/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Attendance", id },
        "Dashboard",
      ],
    }),

    // Get attendance by date
    getAttendanceByDate: builder.query({
      query: ({ date, clubId }) => ({
        url: "/attendance/by-date",
        params: { date, clubId },
      }),
      providesTags: ["Attendance"],
    }),

    // Get attendance statistics
    getAttendanceStatistics: builder.query({
      query: ({ clubId, startDate, endDate, groupBy = "day" }) => ({
        url: "/attendance/statistics",
        params: { clubId, startDate, endDate, groupBy },
      }),
      providesTags: ["Attendance"],
    }),

    // Get student attendance summary with detailed info
    getStudentAttendanceSummary: builder.query({
      query: ({ studentId, clubId, period = "all" }) => ({
        url: `/attendance/student/${studentId}/summary`,
        params: { clubId, period },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `summary-${studentId}` },
      ],
    }),

    // Get attendance patterns for a student
    getStudentAttendancePatterns: builder.query({
      query: ({ studentId, clubId }) => ({
        url: `/attendance/student/${studentId}/patterns`,
        params: { clubId },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `patterns-${studentId}` },
      ],
    }),

    // Get absent reasons for student
    getStudentAbsentReasons: builder.query({
      query: ({ studentId, clubId }) => ({
        url: `/attendance/student/${studentId}/absent-reasons`,
        params: { clubId },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `reasons-${studentId}` },
      ],
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

    // Get absent students
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

    // Get attendance trends
    getAttendanceTrends: builder.query({
      query: ({ clubId, period = "month" }) => ({
        url: "/attendance/trends",
        params: { clubId, period },
      }),
      providesTags: ["Attendance"],
    }),

    // Bulk mark attendance
    bulkMarkAttendance: builder.mutation({
      query: (data) => ({
        url: "/attendance/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),

    // Get club attendance patterns
    getClubAttendancePatterns: builder.query({
      query: ({ clubId }) => ({
        url: `/attendance/club/${clubId}/patterns`,
      }),
      providesTags: (result, error, { clubId }) => [
        { type: "Attendance", id: `patterns-${clubId}` },
      ],
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

    // Get attendance warnings (students with low attendance)
    getAttendanceWarnings: builder.query({
      query: ({ threshold = 75, clubId }) => ({
        url: "/attendance/warnings",
        params: { threshold, clubId },
      }),
      providesTags: ["Attendance"],
    }),

    // Add attendance note
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

    // Get attendance comparison
    getAttendanceComparison: builder.query({
      query: ({ clubIds, startDate, endDate }) => ({
        url: "/attendance/compare",
        params: { clubIds: clubIds.join(","), startDate, endDate },
      }),
      providesTags: ["Attendance"],
    }),

    // Get attendance by week type
    getAttendanceByWeekType: builder.query({
      query: ({ clubId, weekType }) => ({
        url: "/attendance/by-week-type",
        params: { clubId, weekType },
      }),
      providesTags: ["Attendance"],
    }),

    // Generate attendance certificate
    generateAttendanceCertificate: builder.mutation({
      query: ({ studentId, clubId, period }) => ({
        url: "/attendance/certificate",
        method: "POST",
        body: { studentId, clubId, period },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get detailed student attendance history
    getStudentAttendanceHistory: builder.query({
      query: ({ studentId, clubId, page = 1, limit = 20 }) => ({
        url: `/attendance/student/${studentId}/history`,
        params: { clubId, page, limit },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `history-${studentId}` },
      ],
    }),
  }),
});

export const {
  useGetAttendanceReportQuery,
  useGetStudentAttendanceQuery,
  useGetClubAttendanceReportQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useGetAttendanceByDateQuery,
  useGetAttendanceStatisticsQuery,
  useGetStudentAttendanceSummaryQuery,
  useGetStudentAttendancePatternsQuery,
  useGetStudentAbsentReasonsQuery,
  useExportAttendanceReportMutation,
  useGetAbsentStudentsQuery,
  useSendAttendanceNotificationMutation,
  useGetAttendanceTrendsQuery,
  useBulkMarkAttendanceMutation,
  useGetClubAttendancePatternsQuery,
  useVerifyAttendanceQRMutation,
  useGetAttendanceWarningsQuery,
  useAddAttendanceNoteMutation,
  useGetAttendanceComparisonQuery,
  useGetAttendanceByWeekTypeQuery,
  useGenerateAttendanceCertificateMutation,
  useGetStudentAttendanceHistoryQuery,
} = attendanceApi;
