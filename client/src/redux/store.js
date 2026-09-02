/**
 * redux/store.js
 * Configures the Redux store with feature reducers.
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
