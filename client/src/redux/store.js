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
import budgetReducer from "./budgetSlice";
import goalReducer from "./goalSlice";
import walletReducer from "./walletSlice";
import subscriptionReducer from "./subscriptionSlice";
import investmentReducer from "./investmentSlice";
import tripReducer from "./tripSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    incomes: incomeReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    budgets: budgetReducer,
    goals: goalReducer,
    wallets: walletReducer,
    subscriptions: subscriptionReducer,
    investments: investmentReducer,
    trips: tripReducer,
  },
});

export default store;
