import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VolunteerProfile, Alert } from "../api/volunteer";

interface VolunteerState {
  profile: VolunteerProfile | null;
  loading: boolean;
  error: string | null;
  emergencyAlerts: Alert[];
  dashboardData: any;
}

const initialState: VolunteerState = {
  profile: null,
  loading: false,
  error: null,
  emergencyAlerts: [],
  dashboardData: null,
};

const volunteerSlice = createSlice({
  name: "volunteer",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProfile: (state, action: PayloadAction<VolunteerProfile>) => {
      state.profile = action.payload;
    },
    updateProfile: (
      state,
      action: PayloadAction<Partial<VolunteerProfile>>
    ) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    toggleEmergencyStatus: (state) => {
      if (state.profile) {
        state.profile.emergency.isAvailable =
          !state.profile.emergency.isAvailable;
        state.profile.emergency.lastActive = new Date().toISOString();
      }
    },
    addEmergencyAlert: (state, action: PayloadAction<Alert>) => {
      state.emergencyAlerts.push(action.payload);
    },
    setDashboardData: (state, action: PayloadAction<any>) => {
      state.dashboardData = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setProfile,
  updateProfile,
  toggleEmergencyStatus,
  addEmergencyAlert,
  setDashboardData,
  setError,
  clearError,
} = volunteerSlice.actions;

export default volunteerSlice.reducer;
