import { baseApi } from "./baseApi";

export const tutorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getTutorDashboard: builder.query({
      query: () => "/tutor/dashboard",
      providesTags: ["Dashboard"],
    }),

    // My Clubs
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
      query: ({ clubId, startDate, endDate, page = 1, limit = 10 }) => ({
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
} = tutorApi;
