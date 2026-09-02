export const queryKeys = {
  user: ["user"],
  expenses: ["expenses"],
  auth: ["auth"],
};

export const userKeys = {
  all: queryKeys.user,
  profile: () => [...userKeys.all, "profile"],
};

export const expenseKeys = {
  all: queryKeys.expenses,
  lists: () => [...expenseKeys.all, "list"],
  list: (filters = {}) => [...expenseKeys.lists(), filters],
  details: () => [...expenseKeys.all, "detail"],
  detail: (id) => [...expenseKeys.details(), String(id || "")],
  stats: () => [...expenseKeys.all, "stats"],
};

export const authKeys = {
  all: queryKeys.auth,
  login: () => [...authKeys.all, "login"],
  register: () => [...authKeys.all, "register"],
  verifyOtp: () => [...authKeys.all, "verify-otp"],
  resendOtp: () => [...authKeys.all, "resend-otp"],
  forgotPassword: () => [...authKeys.all, "forgot-password"],
  resetPassword: () => [...authKeys.all, "reset-password"],
  logout: () => [...authKeys.all, "logout"],
};
