/**
 * redux/store.js
 * Configures the Redux store with the auth reducer.
 * Wrap the app with <Provider store={store}> in main.jsx.
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import expenseReducer from "./expenseSlice";
import incomeReducer from "./incomeSlice";
import dashboardReducer from "./dashboardSlice";
import notificationReducer from "./notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    incomes: incomeReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
  },
});

export default store;
