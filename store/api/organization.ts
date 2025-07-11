import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Organization {
  id: string;
  name: string;
  email: string;
  description: string;
  website?: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  logo?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  registrationNumber?: string;
  contact: {
    primaryContactName?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
  };
  role?: "organization"; // Add this line
}

export interface Program {
  id: string;
  title: string;
  description: string;
  organization: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  startDate: string;
  endDate: string;
  duration: string;
  volunteerRequirements: {
    minAge?: number;
    maxAge?: number;
    requiredSkills: string[];
    requiredCertifications: string[];
    experienceLevel: "beginner" | "intermediate" | "advanced" | "any";
  };
  maxVolunteers: number;
  currentVolunteers: number;
  status: "draft" | "published" | "in-progress" | "completed" | "cancelled";
  category:
    | "healthcare"
    | "education"
    | "environment"
    | "community"
    | "disaster-relief"
    | "elderly-care"
    | "children"
    | "other";
  urgency: "low" | "medium" | "high" | "urgent";
  appliedVolunteers: Array<{
    volunteer: any;
    appliedAt: string;
    status: "applied" | "accepted" | "rejected";
  }>;
  selectedVolunteers: any[];
  images?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

export interface DashboardStats {
  totalPrograms: number;
  activePrograms: number;
  completedPrograms: number;
  totalApplications: number;
  selectedVolunteers: number;
}

export const organizationApi = createApi({
  reducerPath: "organizationApi", 
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/organization`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("organizationToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Organization", "Program"],
  endpoints: (builder) => ({
    register: builder.mutation<
      { success: boolean; data: any; message: string },
      {
        name: string;
        email: string;
        password: string;
        description: string;
        website?: string;
        phone: string;
        address: any;
        registrationNumber?: string;
        contact: any;
      }
    >({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
    }),

    login: builder.mutation<
      { success: boolean; data: { organization: Organization; token: string } },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getDashboard: builder.query<
      {
        success: boolean;
        data: {
          organization: Organization;
          programs: Program[];
          stats: DashboardStats;
        };
      },
      void
    >({
      query: () => "/dashboard",
      providesTags: ["Organization", "Program"],
    }),

    createProgram: builder.mutation<
      { success: boolean; data: Program; message: string },
      Partial<Program>
    >({
      query: (programData) => ({
        url: "/programs",
        method: "POST",
        body: programData,
      }),
      invalidatesTags: ["Program"],
    }),

    getPrograms: builder.query<
      { success: boolean; data: Program[] },
      { status?: string; category?: string }
    >({
      query: (params) => ({
        url: "/programs",
        params,
      }),
      providesTags: ["Program"],
    }),

    getVolunteersForProgram: builder.query<
      {
        success: boolean;
        data: {
          program: { id: string; title: string; appliedVolunteers: any[] };
        };
      },
      string
    >({
      query: (programId) => `/programs/${programId}/volunteers`,
      providesTags: ["Program"],
    }),

    selectVolunteersForProgram: builder.mutation<
      { success: boolean; data: Program; message: string },
      { programId: string; volunteerIds: string[] }
    >({
      query: ({ programId, volunteerIds }) => ({
        url: `/programs/${programId}/select-volunteers`,
        method: "POST",
        body: { volunteerIds },
      }),
      invalidatesTags: ["Program"],
    }),

    updateProgram: builder.mutation<
      { success: boolean; data: Program; message: string },
      { programId: string; updateData: Partial<Program> }
    >({
      query: ({ programId, updateData }) => ({
        url: `/programs/${programId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Program"],
    }),

    deleteProgram: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (programId) => ({
        url: `/programs/${programId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Program"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetDashboardQuery,
  useCreateProgramMutation,
  useGetProgramsQuery,
  useGetVolunteersForProgramQuery,
  useSelectVolunteersForProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = organizationApi;
