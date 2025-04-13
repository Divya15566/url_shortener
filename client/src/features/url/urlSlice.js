import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks
export const getMyUrls = createAsyncThunk(
  'url/getMyUrls',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get('/api/url/myurls', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      return response.data?.data || [];
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch URLs');
      return rejectWithValue({
        error: err.response?.data?.error || 'Failed to fetch URLs',
        data: []
      });
    }
  }
);

export const shortenUrl = createAsyncThunk(
  'url/shortenUrl',
  async (urlData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post('/api/url/shorten', urlData, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to shorten URL');
      return rejectWithValue(err.response?.data);
    }
  }
);

export const getAnalytics = createAsyncThunk(
  'url/getAnalytics',
  async (urlCode, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`/api/analytics/${urlCode}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to get analytics');
      return rejectWithValue(err.response?.data);
    }
  }
);

// Slice
const urlSlice = createSlice({
  name: 'url',
  initialState: {
    urls: [],
    analytics: null,
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get My URLs
      .addCase(getMyUrls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyUrls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urls = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getMyUrls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
        state.urls = [];
      })
      
      // Shorten URL
      .addCase(shortenUrl.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shortenUrl.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urls.push(action.payload);
      })
      .addCase(shortenUrl.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      })
      
      // Get Analytics
      .addCase(getAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error;
      });
  }
});

export default urlSlice.reducer;
