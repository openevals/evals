import { createSlice } from '@reduxjs/toolkit';
import { IUserProfile } from '@/app/lib/types';

const initialState: {
  token?: string;
  refresh?: string;
  profile?: IUserProfile;
  isAuthenticated: boolean;
} = {
  token: undefined,
  refresh: undefined,
  profile: undefined,
  isAuthenticated: false,
};

// Ensure the storage initialization is called on the client side
if (typeof window !== 'undefined') {
  initialState.token = localStorage.getItem('token') ?? undefined;
  initialState.refresh = localStorage.getItem('refresh') ?? undefined;
  initialState.isAuthenticated = !!initialState.token && initialState.token.length > 0 && !!initialState.refresh && initialState.refresh.length > 0;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser(state) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      state.token = undefined;
      state.refresh = undefined;
      state.profile = undefined;
      state.isAuthenticated = false;
    },
    setAuthParams(state, action) {
      state.token = action.payload.token;
      state.refresh = action.payload.refresh;
      localStorage.setItem('token', state.token ?? '');
      localStorage.setItem('refresh', state.refresh ?? '');
      state.isAuthenticated = !!state.token && state.token.length > 0 && !!state.refresh && state.refresh.length > 0;
    },
    setUserProfile(state, action) {
      state.profile = action.payload;
    },
  },
});

export const {
  logoutUser, setAuthParams, setUserProfile
} = authSlice.actions;
export default authSlice.reducer;
