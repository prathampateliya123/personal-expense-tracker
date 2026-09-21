export const BILLING_CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

export const getBillingCycleLabel = (cycle) =>
  BILLING_CYCLE_OPTIONS.find((opt) => opt.value === cycle)?.label || cycle;

export const getSubscriptionStatusLabel = (status) =>
  SUBSCRIPTION_STATUS_OPTIONS.find((opt) => opt.value === status)?.label ||
  status;
