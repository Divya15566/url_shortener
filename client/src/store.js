import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import urlReducer from './features/url/urlSlice';

// Create the store
const store = configureStore({
  reducer: {
    auth: authReducer,
    url: urlReducer
  }
});

export default store;