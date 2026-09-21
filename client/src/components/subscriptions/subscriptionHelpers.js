import { toDateInputValue } from "../../utils/formatters";

export const labelClass = "mb-1.5 block text-sm font-medium text-textPrimary";

export const emptySubscriptionForm = () => ({
  serviceName: "",
  amount: "",
  billingCycle: "monthly",
  nextBillingDate: toDateInputValue(null, { fallbackToday: true }),
  category: "",
  paymentMode: "",
  reminderDaysBefore: "3",
  status: "active",
  autoAddExpense: true,
  notes: "",
});

export const subscriptionToForm = (item) => ({
  serviceName: item.serviceName || "",
  amount: String(item.amount ?? ""),
  billingCycle: item.billingCycle || "monthly",
  nextBillingDate: toDateInputValue(item.nextBillingDate, {
    fallbackToday: true,
  }),
  category: item.category || "",
  paymentMode: item.paymentMode || "",
  reminderDaysBefore: String(item.reminderDaysBefore ?? 3),
  status: item.status || "active",
  autoAddExpense: item.autoAddExpense !== false,
  notes: item.notes || "",
});

export const statusBadgeClass = (status) => {
  if (status === "active") return "bg-successBg text-successText";
  if (status === "paused") return "bg-amber-50 text-amber-700";
  return "bg-surfaceGray text-textSecondary";
};
