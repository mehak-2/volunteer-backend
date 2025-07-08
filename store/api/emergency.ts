import { api } from "./baseApi";

interface Location {
  lat: number;
  lng: number;
}

interface ActiveVolunteer {
  _id: string;
  personalInfo: {
    fullname: string;
  };
  contactInfo: {
    location: Location;
  };
  emergency: {
    lastActive: string;
    responseTime: string;
  };
  skills: {
    certifications: {
      cprTrained: boolean;
      firstAidTrained: boolean;
    };
  };
}

interface EmergencyAlert {
  _id: string;
  type: string;
  location: {
    address: string;
    coordinates: Location;
  };
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "responded" | "completed" | "cancelled";
  createdAt: string;
}

export const emergencyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActiveVolunteers: builder.query<ActiveVolunteer[], void>({
      query: () => "emergency/active-volunteers",
      transformResponse: (response: {
        success: boolean;
        data: ActiveVolunteer[];
      }) => response.data,
    }),
    getEmergencyAlerts: builder.query<EmergencyAlert[], void>({
      query: () => "emergency/alerts",
      transformResponse: (response: {
        success: boolean;
        data: EmergencyAlert[];
      }) => response.data,
    }),
  }),
});

export const { useGetActiveVolunteersQuery, useGetEmergencyAlertsQuery } =
  emergencyApi;
