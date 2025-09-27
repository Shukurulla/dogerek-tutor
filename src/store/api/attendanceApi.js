// src/store/api/attendanceApi.js
import { baseApi } from "./baseApi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

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

          // Transform attendance dates from "DD.MM.YYYY" string format to proper format
          if (data.attendance && Array.isArray(data.attendance)) {
            data.attendance = data.attendance.map((record) => {
              // Handle date format
              let formattedDate = record.date;

              // If date is in "DD.MM.YYYY" format (string from API)
              if (
                record.date &&
                typeof record.date === "string" &&
                record.date.includes(".")
              ) {
                // Keep the original format but also create a parseable version
                const parts = record.date.split(".");
                if (parts.length === 3) {
                  const [day, month, year] = parts;
                  // Create ISO format for parsing
                  const isoDate = `${year}-${month.padStart(
                    2,
                    "0"
                  )}-${day.padStart(2, "0")}`;

                  return {
                    ...record,
                    originalDate: record.date, // Keep original "DD.MM.YYYY" format
                    date: isoDate, // ISO format for dayjs parsing
                    formattedDate: record.date, // Display format
                  };
                }
              }

              return record;
            });

            // Sort attendance by date (newest first)
            data.attendance.sort((a, b) => {
              const dateA = a.date ? new Date(a.date) : new Date(0);
              const dateB = b.date ? new Date(b.date) : new Date(0);
              return dateB - dateA;
            });
          }

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
} = attendanceApi;
