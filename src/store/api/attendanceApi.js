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

    // Get student attendance
    getStudentAttendance: builder.query({
      query: ({ studentId, clubId, startDate, endDate }) => ({
        url: `/attendance/student/${studentId}`,
        params: { clubId, startDate, endDate },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `student-${studentId}` },
      ],
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

    // Delete attendance record (for admin)
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/admin/attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
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

    // Get student attendance summary
    getStudentAttendanceSummary: builder.query({
      query: ({ studentId, period = "month" }) => ({
        url: `/attendance/student/${studentId}/summary`,
        params: { period },
      }),
      providesTags: (result, error, { studentId }) => [
        { type: "Attendance", id: `summary-${studentId}` },
      ],
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
  }),
});

export const {
  useGetAttendanceReportQuery,
  useGetStudentAttendanceQuery,
  useGetClubAttendanceReportQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAttendanceByDateQuery,
  useGetAttendanceStatisticsQuery,
  useExportAttendanceReportMutation,
  useGetAbsentStudentsQuery,
  useSendAttendanceNotificationMutation,
  useGetAttendanceTrendsQuery,
  useBulkMarkAttendanceMutation,
  useGetStudentAttendanceSummaryQuery,
  useGetClubAttendancePatternsQuery,
  useVerifyAttendanceQRMutation,
  useGetAttendanceWarningsQuery,
  useAddAttendanceNoteMutation,
  useGetAttendanceComparisonQuery,
  useGetAttendanceByWeekTypeQuery,
  useGenerateAttendanceCertificateMutation,
} = attendanceApi;
