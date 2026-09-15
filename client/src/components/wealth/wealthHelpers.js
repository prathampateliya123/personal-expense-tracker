import { toDateInputValue } from "../../utils/wealthConstants";

export const TABS = [
  { key: "savings", label: "Savings" },
  { key: "investments", label: "Investments" },
];

export const labelClass = "mb-1.5 block text-sm font-medium text-textPrimary";

export const emptySavingForm = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  deadline: "",
  notes: "",
  status: "active",
};

export const emptyInvestmentForm = {
  name: "",
  type: "mutual_fund",
  amountInvested: "",
  currentValue: "",
  purchaseDate: toDateInputValue(new Date()),
  institution: "",
  notes: "",
};

export const savingToForm = (item) => ({
  name: item.name || "",
  targetAmount: String(item.targetAmount ?? ""),
  currentAmount: String(item.currentAmount ?? ""),
  deadline: toDateInputValue(item.deadline),
  notes: item.notes || "",
  status: item.status || "active",
});

export const investmentToForm = (item) => ({
  name: item.name || "",
  type: item.type || "other",
  amountInvested: String(item.amountInvested ?? ""),
  currentValue: String(item.currentValue ?? ""),
  purchaseDate:
    toDateInputValue(item.purchaseDate) || toDateInputValue(new Date()),
  institution: item.institution || "",
  notes: item.notes || "",
});
