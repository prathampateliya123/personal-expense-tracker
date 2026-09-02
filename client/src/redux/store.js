/**
 * redux/store.js
 * Configures the Redux store with the auth reducer.
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import expenseReducer from "./slices/expenseSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
  },
});

export default store;
