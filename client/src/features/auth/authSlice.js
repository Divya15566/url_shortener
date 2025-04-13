import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://url-shortener-dx3x.onrender.com/api/login', credentials, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (err) {
      const error = err.response?.data?.error || err.message;
      toast.error(error);
      return rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      });
  }
});

// Export the logout action and reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;