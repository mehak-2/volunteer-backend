import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Organization {
  id: string;
  email: string;
  name: string;
  role: "organization";
  description?: string;
  website?: string;
  phone?: string;
  status?: string;
}

interface OrganizationState {
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: null | string;
}

const getLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const organizationSlice = createSlice({
  name: "organization",
  initialState: {
    organization: null as Organization | null,
    token: getLocalStorage("organizationToken"),
    isAuthenticated: !!getLocalStorage("organizationToken"),
    loading: false,
    error: null as string | null,
  },
  reducers: {
    organizationLoginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    organizationLoginSuccess: (
      state,
      action: PayloadAction<{ organization: Organization; token: string }>
    ) => {
      state.loading = false;
      state.organization = action.payload.organization;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.setItem("organizationToken", action.payload.token);
        localStorage.setItem("organizationId", action.payload.organization.id);
        localStorage.setItem(
          "organization",
          JSON.stringify(action.payload.organization)
        );
      }
    },
    organizationLoginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    organizationLogout: (state) => {
      state.organization = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("organizationToken");
        localStorage.removeItem("organizationId");
        localStorage.removeItem("organization");
      }
    },
    clearOrganizationError: (state) => {
      state.error = null;
    },
  },
});

export const {
  organizationLoginStart,
  organizationLoginSuccess,
  organizationLoginFailure,
  organizationLogout,
  clearOrganizationError,
} = organizationSlice.actions;

export default organizationSlice.reducer;
