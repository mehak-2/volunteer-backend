import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnboardingData {
  step: number;
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
  };
  skillsAvailability: {
    skills: string[];
    availability: string[];
    cprTrained: boolean;
    firstAidTrained: boolean;
  };
  documents: {
    idDocument?: string;
  };
}

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  loading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  currentStep: 1,
  data: {
    step: 1,
    personalInfo: {
      fullname: "",
      age: 0,
      gender: "",
      photo: undefined,
    },
    contactInfo: {
      phone: "",
      email: "",
      address: "",
      location: undefined,
    },
    skillsAvailability: {
      skills: [],
      availability: [],
      cprTrained: false,
      firstAidTrained: false,
    },
    documents: {
      idDocument: undefined,
    },
  },
  loading: false,
  error: null,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updatePersonalInfo: (
      state,
      action: PayloadAction<Partial<OnboardingData["personalInfo"]>>
    ) => {
      state.data.personalInfo = {
        ...state.data.personalInfo,
        ...action.payload,
      };
    },
    updateContactInfo: (
      state,
      action: PayloadAction<Partial<OnboardingData["contactInfo"]>>
    ) => {
      state.data.contactInfo = { ...state.data.contactInfo, ...action.payload };
    },
    updateSkillsAvailability: (
      state,
      action: PayloadAction<Partial<OnboardingData["skillsAvailability"]>>
    ) => {
      state.data.skillsAvailability = {
        ...state.data.skillsAvailability,
        ...action.payload,
      };
    },
    updateDocuments: (
      state,
      action: PayloadAction<Partial<OnboardingData["documents"]>>
    ) => {
      state.data.documents = { ...state.data.documents, ...action.payload };
    },
    nextStep: (state) => {
      if (state.currentStep < 4) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    resetOnboarding: (state) => {
      state.currentStep = 1;
      state.data = initialState.data;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
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
  setCurrentStep,
  updatePersonalInfo,
  updateContactInfo,
  updateSkillsAvailability,
  updateDocuments,
  nextStep,
  prevStep,
  resetOnboarding,
  setLoading,
  setError,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
