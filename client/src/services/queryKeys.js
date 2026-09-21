export const queryKeys = {
  user: ["user"],
  expenses: ["expenses"],
  incomes: ["incomes"],
  categories: ["categories"],
  paymentMethods: ["paymentMethods"],
  budgets: ["budgets"],
  savings: ["savings"],
  investments: ["investments"],
  subscriptions: ["subscriptions"],
  billSimulations: ["billSimulations"],
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

export const incomeKeys = {
  all: queryKeys.incomes,
  lists: () => [...incomeKeys.all, "list"],
  list: (filters = {}) => [...incomeKeys.lists(), filters],
  details: () => [...incomeKeys.all, "detail"],
  detail: (id) => [...incomeKeys.details(), String(id || "")],
  stats: () => [...incomeKeys.all, "stats"],
};

export const categoryKeys = {
  all: queryKeys.categories,
  lists: () => [...categoryKeys.all, "list"],
  list: (filters = {}) => [...categoryKeys.lists(), filters],
  options: (type = "all") => [...categoryKeys.all, "options", type],
};

export const paymentMethodKeys = {
  all: queryKeys.paymentMethods,
  lists: () => [...paymentMethodKeys.all, "list"],
  list: (filters = {}) => [...paymentMethodKeys.lists(), filters],
  options: () => [...paymentMethodKeys.all, "options"],
};

export const budgetKeys = {
  all: queryKeys.budgets,
  lists: () => [...budgetKeys.all, "list"],
  list: (year) => [...budgetKeys.lists(), year ?? "all"],
  current: (year, month) => [
    ...budgetKeys.all,
    "current",
    Number(year),
    Number(month),
  ],
};

export const savingKeys = {
  all: queryKeys.savings,
  lists: () => [...savingKeys.all, "list"],
  list: (filters = {}) => [...savingKeys.lists(), filters],
  details: () => [...savingKeys.all, "detail"],
  detail: (id) => [...savingKeys.details(), String(id || "")],
  stats: () => [...savingKeys.all, "stats"],
};

export const investmentKeys = {
  all: queryKeys.investments,
  lists: () => [...investmentKeys.all, "list"],
  list: (filters = {}) => [...investmentKeys.lists(), filters],
  details: () => [...investmentKeys.all, "detail"],
  detail: (id) => [...investmentKeys.details(), String(id || "")],
  stats: () => [...investmentKeys.all, "stats"],
};

export const subscriptionKeys = {
  all: queryKeys.subscriptions,
  lists: () => [...subscriptionKeys.all, "list"],
  list: (filters = {}) => [...subscriptionKeys.lists(), filters],
  details: () => [...subscriptionKeys.all, "detail"],
  detail: (id) => [...subscriptionKeys.details(), String(id || "")],
  stats: () => [...subscriptionKeys.all, "stats"],
};

export const billSimulationKeys = {
  all: queryKeys.billSimulations,
  lists: () => [...billSimulationKeys.all, "list"],
  list: (filters = {}) => [...billSimulationKeys.lists(), filters],
  stats: () => [...billSimulationKeys.all, "stats"],
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
