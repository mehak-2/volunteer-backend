import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  volunteers: any[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    location: string;
    skills: string[];
  };
  stats: {
    total: number;
    pending: number;
    approved: number;
    active: number;
  };
}

const initialState: AdminState = {
  volunteers: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    location: '',
    skills: [],
  },
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    active: 0,
  },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setVolunteers: (state, action: PayloadAction<any[]>) => {
      state.volunteers = action.payload;
    },
    approveVolunteer: (state, action: PayloadAction<string>) => {
      const volunteer = state.volunteers.find(v => v.id === action.payload);
      if (volunteer) {
        volunteer.status = 'approved';
      }
    },
    rejectVolunteer: (state, action: PayloadAction<string>) => {
      const volunteer = state.volunteers.find(v => v.id === action.payload);
      if (volunteer) {
        volunteer.status = 'rejected';
      }
    },
    setFilters: (state, action: PayloadAction<Partial<AdminState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setStats: (state, action: PayloadAction<AdminState['stats']>) => {
      state.stats = action.payload;
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
  setVolunteers,
  approveVolunteer,
  rejectVolunteer,
  setFilters,
  setStats,
  setError,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;