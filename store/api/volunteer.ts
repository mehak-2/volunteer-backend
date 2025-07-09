import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface VolunteerProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  personalInfo: {
    fullname: string;
    age: number;
    gender: string;
    photo?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    location?: {
      lat: number;
      lng: number;
    };
    contactPreference: string;
  };
  skills: {
    certifications: {
      cprTrained: boolean;
      firstAidTrained: boolean;
    };
    skillsList: string[];
    availability: string[];
  };
  documents: {
    idDocument?: string;
    termsAccepted: boolean;
    backgroundCheckConsent: boolean;
  };
  status: "pending" | "approved" | "rejected" | "suspended";
  emergency: {
    isAvailable: boolean;
    responseTime: string;
    totalResponses: number;
    lastActive: string;
  };
  training: {
    nextTraining?: string;
    completedTrainings: string[];
  };
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  _id: string;
  volunteer: string;
  type: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "responded" | "completed" | "cancelled";
  responseTime?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Update the interface to match the actual API response
export interface ApiResponse {
  success: boolean;
  data: DashboardData;
}

export interface DashboardData {
  volunteer: VolunteerProfile;
  recentAlerts: Alert[];
  stats: {
    totalResponses: number;
    responseTime: string;
    profileCompletion: number;
  };
}

export const volunteerApi = createApi({
  reducerPath: "volunteerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Volunteer", "Alert"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, string>({
      query: (userId) => ({
        url: `/volunteer/profile/${userId}`,
        method: "GET",
      }),
      // Transform the response to extract the data property
      transformResponse: (response: ApiResponse) => response.data,
      transformErrorResponse: (response, meta, arg) => {
        console.error("API Error:", response);
        return response;
      },
      providesTags: ["Volunteer", "Alert"],
    }),

    toggleEmergencyStatus: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/emergency-status/${userId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Volunteer"],
    }),

    updateProfile: builder.mutation<
      any,
      { userId: string; updateData: Partial<VolunteerProfile> }
    >({
      query: ({ userId, updateData }) => ({
        url: `/volunteer/profile/${userId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Volunteer"],
    }),

    submitCompleteApplication: builder.mutation({
      query: (data) => ({
        url: "/onboarding/submit",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useToggleEmergencyStatusMutation,
  useUpdateProfileMutation,
  useSubmitCompleteApplicationMutation,
} = volunteerApi;
