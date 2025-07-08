import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  role: "volunteer" | "admin";
  name: string;
  onboardingComplete?: boolean;
  profileCompletion?: number;
  personalInfo?: {
    fullname?: string;
    age?: number;
    gender?: string;
    photo?: string;
  };
  contactInfo?: {
    phone?: string;
    address?: string;
    location?: { lat: number; lng: number };
    contactPreference?: string;
  };
  skills?: {
    certifications?: {
      cprTrained?: boolean;
      firstAidTrained?: boolean;
    };
    skillsList?: string[];
    availability?: string[];
  };
  documents?: {
    idDocument?: string;
    termsAccepted?: boolean;
    backgroundCheckConsent?: boolean;
  };
  status?: string;
  emergency?: {
    isAvailable?: boolean;
    responseTime?: string;
    totalResponses?: number;
    lastActive?: Date;
  };
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: null | string;
}

// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Update the action payload type
type LoginSuccessPayload = {
  user: User;
  token?: string; // Make token optional
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as User | null,
    token: getLocalStorage("token"),
    isAuthenticated: !!getLocalStorage("token"),
    loading: false,
    error: null as string | null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.loading = false;
      state.user = action.payload.user;
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      state.isAuthenticated = true;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token || "");
        localStorage.setItem("userId", action.payload.user.id);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
