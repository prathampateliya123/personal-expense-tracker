/**
 * redux/store.js
 * Configures the Redux store with the auth reducer.
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
