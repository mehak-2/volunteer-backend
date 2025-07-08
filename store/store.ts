import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import onboardingReducer from "./slices/onboardingSlice";
import volunteerReducer from "./slices/volunteerSlice";
import adminReducer from "./slices/adminSlice";
import organizationReducer from "./slices/organizationSlice";
import {
  onboardingApi,
  contactStepApi,
  skillsStepApi,
  documentStepApi,
} from "./api/onboarding";
import { volunteerApi } from "./api/volunteer";
import { authApi } from "./api/auth";
import { adminApi } from "./api/admin";
import { organizationApi } from "./api/organization";
import { api } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    volunteer: volunteerReducer,
    admin: adminReducer,
    organization: organizationReducer,
    [authApi.reducerPath]: authApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [contactStepApi.reducerPath]: contactStepApi.reducer,
    [skillsStepApi.reducerPath]: skillsStepApi.reducer,
    [documentStepApi.reducerPath]: documentStepApi.reducer,
    [volunteerApi.reducerPath]: volunteerApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [organizationApi.reducerPath]: organizationApi.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      authApi.middleware,
      onboardingApi.middleware,
      contactStepApi.middleware,
      skillsStepApi.middleware,
      documentStepApi.middleware,
      volunteerApi.middleware,
      adminApi.middleware,
      organizationApi.middleware,
      api.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
