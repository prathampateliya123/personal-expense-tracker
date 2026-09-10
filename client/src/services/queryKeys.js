export const queryKeys = {
  user: ["user"],
  expenses: ["expenses"],
  categories: ["categories"],
  paymentMethods: ["paymentMethods"],
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

export const categoryKeys = {
  all: queryKeys.categories,
  lists: () => [...categoryKeys.all, "list"],
  list: (filters = {}) => [...categoryKeys.lists(), filters],
  options: () => [...categoryKeys.all, "options"],
};

export const paymentMethodKeys = {
  all: queryKeys.paymentMethods,
  lists: () => [...paymentMethodKeys.all, "list"],
  list: (filters = {}) => [...paymentMethodKeys.lists(), filters],
  options: () => [...paymentMethodKeys.all, "options"],
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
