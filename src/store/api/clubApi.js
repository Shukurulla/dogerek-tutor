import { baseApi } from "./baseApi";

export const clubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all clubs
    getAllClubs: builder.query({
      query: ({ facultyId, search, page = 1, limit = 20 }) => ({
        url: "/clubs",
        params: { facultyId, search, page, limit },
      }),
      providesTags: ["Club"],
    }),

    // Get club by ID
    getClubById: builder.query({
      query: (id) => `/clubs/${id}`,
      providesTags: (result, error, id) => [{ type: "Club", id }],
    }),

    // Get club students
    getClubStudents: builder.query({
      query: (id, status = "active") => ({
        url: `/clubs/${id}/students`,
        params: { status },
      }),
      providesTags: (result, error, id) => [
        { type: "Club", id: `students-${id}` },
      ],
    }),

    // Get club attendance
    getClubAttendance: builder.query({
      query: ({ id, startDate, endDate, page = 1, limit = 20 }) => ({
        url: `/clubs/${id}/attendance`,
        params: { startDate, endDate, page, limit },
      }),
      providesTags: ["Attendance"],
    }),

    // Create club (for faculty admin)
    createClub: builder.mutation({
      query: (data) => ({
        url: "/faculty/club",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Club", "Dashboard"],
    }),

    // Update club
    updateClub: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/faculty/club/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Club", id },
        "Dashboard",
      ],
    }),

    // Delete club
    deleteClub: builder.mutation({
      query: (id) => ({
        url: `/faculty/club/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Club", "Dashboard"],
    }),

    // Apply to club (for students)
    applyToClub: builder.mutation({
      query: (clubId) => ({
        url: `/student/club/${clubId}/apply`,
        method: "POST",
      }),
      invalidatesTags: ["Application", "Club"],
    }),

    // Leave club (for students)
    leaveClub: builder.mutation({
      query: (clubId) => ({
        url: `/student/club/${clubId}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["Club", "Student"],
    }),

    // Get club schedule
    getClubSchedule: builder.query({
      query: (clubId) => `/clubs/${clubId}/schedule`,
      providesTags: (result, error, clubId) => [
        { type: "Club", id: `schedule-${clubId}` },
      ],
    }),

    // Get club statistics
    getClubStatistics: builder.query({
      query: (clubId) => `/clubs/${clubId}/statistics`,
      providesTags: (result, error, clubId) => [
        { type: "Club", id: `stats-${clubId}` },
      ],
    }),

    // Search clubs
    searchClubs: builder.query({
      query: (searchTerm) => `/clubs/search?q=${searchTerm}`,
      providesTags: ["Club"],
    }),

    // Get recommended clubs (for students)
    getRecommendedClubs: builder.query({
      query: () => "/student/clubs/recommended",
      providesTags: ["Club"],
    }),

    // Get club announcements
    getClubAnnouncements: builder.query({
      query: (clubId) => `/clubs/${clubId}/announcements`,
      providesTags: (result, error, clubId) => [
        { type: "Club", id: `announcements-${clubId}` },
      ],
    }),

    // Add club announcement (for tutors)
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

    // Get club details for tutor
    getClubDetails: builder.query({
      query: (clubId) => `/clubs/${clubId}`,
      providesTags: (result, error, clubId) => [{ type: "Club", id: clubId }],
    }),

    // Get club enrollment requests
    getClubEnrollmentRequests: builder.query({
      query: (clubId) => `/clubs/${clubId}/enrollment-requests`,
      providesTags: (result, error, clubId) => [
        { type: "Club", id: `requests-${clubId}` },
      ],
    }),

    // Process enrollment request
    processEnrollmentRequest: builder.mutation({
      query: ({ clubId, studentId, action, reason }) => ({
        url: `/clubs/${clubId}/enrollment-requests/${studentId}`,
        method: "POST",
        body: { action, reason },
      }),
      invalidatesTags: (result, error, { clubId }) => [
        { type: "Club", id: `requests-${clubId}` },
        { type: "Club", id: `students-${clubId}` },
        "Application",
      ],
    }),

    // Get club attendance summary
    getClubAttendanceSummary: builder.query({
      query: ({ clubId, period = "month" }) => ({
        url: `/clubs/${clubId}/attendance-summary`,
        params: { period },
      }),
      providesTags: (result, error, { clubId }) => [
        { type: "Club", id: `attendance-summary-${clubId}` },
      ],
    }),

    // Export club student list
    exportClubStudents: builder.mutation({
      query: ({ clubId, format = "xlsx" }) => ({
        url: `/clubs/${clubId}/export-students`,
        method: "POST",
        body: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get club performance metrics
    getClubPerformanceMetrics: builder.query({
      query: ({ clubId, startDate, endDate }) => ({
        url: `/clubs/${clubId}/performance`,
        params: { startDate, endDate },
      }),
      providesTags: (result, error, { clubId }) => [
        { type: "Club", id: `performance-${clubId}` },
      ],
    }),

    // Update club settings (for tutors)
    updateClubSettings: builder.mutation({
      query: ({ clubId, ...settings }) => ({
        url: `/tutor/club/${clubId}/settings`,
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: (result, error, { clubId }) => [
        { type: "Club", id: clubId },
      ],
    }),
  }),
});

export const {
  useGetAllClubsQuery,
  useGetClubByIdQuery,
  useGetClubStudentsQuery,
  useGetClubAttendanceQuery,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useApplyToClubMutation,
  useLeaveClubMutation,
  useGetClubScheduleQuery,
  useGetClubStatisticsQuery,
  useSearchClubsQuery,
  useGetRecommendedClubsQuery,
  useGetClubAnnouncementsQuery,
  useAddClubAnnouncementMutation,
  useGetClubDetailsQuery,
  useGetClubEnrollmentRequestsQuery,
  useProcessEnrollmentRequestMutation,
  useGetClubAttendanceSummaryQuery,
  useExportClubStudentsMutation,
  useGetClubPerformanceMetricsQuery,
  useUpdateClubSettingsMutation,
} = clubApi;
