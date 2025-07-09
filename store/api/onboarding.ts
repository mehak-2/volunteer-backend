import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${baseUrl}/api`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    onboarding: builder.mutation<
      { id: string; fullname: string; age: number; gender: string },
      { fullname: string; age: number; gender: string }
    >({
      query: (data) => ({
        url: "/onboarding/personalInfo",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const contactStepApi = createApi({
  reducerPath: "contactStepApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    contactStep: builder.mutation<
      {
        id: string;
        phone: string;
        email: string;
        address: string;
        location: string;
        contactPreference: string;
      },
      {
        phone: string;
        email: string;
        address: string;
        location: string;
        contactPreference: string;
      }
    >({
      query: (data) => ({
        url: "/contactstep/contactStep",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const skillsStepApi = createApi({
  reducerPath: "skillsStepApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    skillsStep: builder.mutation<
      {
        id: string;
        message: string;
        user: {
          certificate: {
            cprTrained: boolean;
            firstAidTrained: boolean;
          };
          skills: string[];
          schedule: string[];
        };
      },
      {
        user: {
          certificate: {
            cprTrained: boolean;
            firstAidTrained: boolean;
          };
          skills: string[];
          schedule: string[];
        };
      }
    >({
      query: (data) => ({
        url: "/skillsstep/skillsStep",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const documentStepApi = createApi({
  reducerPath: "documentStepApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    documentStep: builder.mutation<
      {
        id: string;
        documents: { document: string }[];
        termsAndConditions: boolean;
        user: string;
      },
      {
        documents: { document: string }[];
        termsAndConditions: boolean;
        user: string;
      }
    >({
      query: (data) => ({
        url: "/documentstep", // Updated to match the backend route
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useOnboardingMutation } = onboardingApi;
export const { useContactStepMutation } = contactStepApi;
export const { useSkillsStepMutation } = skillsStepApi;
export const { useDocumentStepMutation } = documentStepApi;
