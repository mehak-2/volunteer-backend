import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setStats, setVolunteers } from "../slices/adminSlice";
import { Activity } from "../types";

interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  active: number;
  responseTime: string;
  todayResponses: number;
}

interface Volunteer {
  _id: string; // Changed from id: number
  name: string;
  email: string;
  phone: string;
  status: string;
  location: string;
  skills: string[];
  joinDate: string;
  lastActive: string;
  emergencyAvailable: boolean;
  responseCount: number;
  avatar?: string;
}

export interface Organization {
  _id: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status: "pending" | "approved" | "rejected" | "suspended";
  contact: {
    primaryContactName?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
  };
  createdAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/admin`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`); // Note the capital A in Authorization
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Volunteer", "Organization"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<
      { success: boolean; data: DashboardStats },
      void
    >({
      query: () => "/stats",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            dispatch(setStats(data.data));
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      },
    }),
    getVolunteers: builder.query<
      { success: boolean; data: Volunteer[] },
      { status?: string; search?: string }
    >({
      query: (params) => ({
        url: "/volunteers",
        params,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            dispatch(setVolunteers(data.data));
          }
        } catch (error) {
          console.error("Error fetching volunteers:", error);
        }
      },
    }),
    updateVolunteerStatus: builder.mutation<
      { success: boolean; data: Volunteer[] },
      {
        volunteerId: string; // Change from number to string
        status: "approved" | "rejected" | "pending";
      }
    >({
      query: ({ volunteerId, status }) => ({
        url: `/volunteers/${volunteerId}/status`,
        method: "PATCH", // Changed from PUT to PATCH
        body: { status },
      }),
      // Optimistic update for the cache
      async onQueryStarted(
        { volunteerId, status },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled;
          // Update the volunteers cache optimistically
          dispatch(
            adminApi.util.updateQueryData(
              "getVolunteers",
              { status: "all" },
              (draft) => {
                if (draft.success && Array.isArray(draft.data)) {
                  const volunteer = draft.data.find(
                    (v) => v._id === volunteerId
                  );
                  if (volunteer) {
                    volunteer.status = status;
                  }
                }
              }
            )
          );
        } catch {
          console.error("Failed to update volunteer status in cache");
        }
      },
    }),
    getRecentActivities: builder.query<Activity[], number>({
      query: (limit = 10) => ({
        url: `/activities/recent?limit=${limit}`, // Remove the duplicate /api prefix
        method: "GET",
      }),
    }),
    sendEmergencyAlert: builder.mutation<
      { success: boolean },
      { message: string; severity: "low" | "medium" | "high" }
    >({
      query: (data) => ({
        url: "/alert", // Changed from '/alerts/emergency' to '/alert'
        method: "POST",
        body: data,
      }),
    }),

    bulkApproveVolunteers: builder.mutation<
      { success: boolean },
      { volunteerIds: string[] } // Changed from number[] to string[]
    >({
      query: (data) => ({
        url: "/volunteers/bulk-approve",
        method: "POST",
        body: data,
      }),
    }),

    generateReport: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/reports/generate",
        method: "POST",
      }),
    }),

    getOrganizations: builder.query<
      { success: boolean; data: Organization[] },
      { status?: string; search?: string }
    >({
      query: (params) => ({
        url: "/organizations",
        params,
      }),
      providesTags: ["Organization"],
    }),

    updateOrganizationStatus: builder.mutation<
      { success: boolean; data: Organization },
      { organizationId: string; status: string }
    >({
      query: (data) => ({
        url: "/organizations/status",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetVolunteersQuery,
  useUpdateVolunteerStatusMutation,
  useGetRecentActivitiesQuery,
  useSendEmergencyAlertMutation,
  useBulkApproveVolunteersMutation,
  useGenerateReportMutation,
  useGetOrganizationsQuery,
  useUpdateOrganizationStatusMutation,
} = adminApi;
