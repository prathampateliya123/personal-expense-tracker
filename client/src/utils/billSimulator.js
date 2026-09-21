import { toDateInputValue } from "./formatters";

export const BILL_TYPE_OPTIONS = [
  { value: "electricity", label: "Electricity bill", kind: "bill" },
  { value: "rent", label: "Rent", kind: "bill" },
  { value: "credit_card_emi", label: "Credit-card EMI", kind: "emi" },
  { value: "loan_emi", label: "Loan EMI", kind: "emi" },
  { value: "insurance", label: "Insurance", kind: "bill" },
  { value: "internet_mobile", label: "Internet / mobile", kind: "bill" },
];

export const BILL_FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export const isEmiBillType = (type) =>
  type === "loan_emi" || type === "credit_card_emi";

export const getBillTypeLabel = (type) =>
  BILL_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type;

export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const calculateEmi = ({
  loanAmount,
  interestRate,
  tenureMonths,
  paidEmis = 0,
}) => {
  const P = Number(loanAmount);
  const annualRate = Number(interestRate);
  const n = parseInt(tenureMonths, 10);
  const paid = Math.max(0, parseInt(paidEmis, 10) || 0);

  if (!P || P <= 0 || Number.isNaN(P)) {
    return { error: "Enter a valid loan amount" };
  }
  if (!n || n <= 0 || Number.isNaN(n)) {
    return { error: "Enter a valid tenure in months" };
  }
  if (Number.isNaN(annualRate) || annualRate < 0) {
    return { error: "Interest rate cannot be negative" };
  }
  if (n > 600) {
    return { error: "Tenure cannot exceed 600 months" };
  }
  if (paid > n) {
    return { error: "Paid EMIs cannot exceed total tenure" };
  }
  if (paid === n) {
    return { error: "All EMIs are already paid for this loan" };
  }

  let emi;
  if (annualRate === 0) {
    emi = P / n;
  } else {
    const r = annualRate / 12 / 100;
    const factor = (1 + r) ** n;
    emi = (P * r * factor) / (factor - 1);
  }

  const schedule = [];
  let balance = P;
  const r = annualRate === 0 ? 0 : annualRate / 12 / 100;

  for (let month = 1; month <= n; month += 1) {
    const interest = balance * r;
    let principal = emi - interest;
    let payment = emi;

    if (month === n) {
      principal = balance;
      payment = principal + interest;
    }

    balance = Math.max(0, round2(balance - principal));
    schedule.push({
      month,
      emi: round2(payment),
      principal: round2(principal),
      interest: round2(interest),
      balance,
      status: month <= paid ? "paid" : "upcoming",
    });
  }

  const paidRows = schedule.filter((row) => row.status === "paid");
  const upcomingRows = schedule.filter((row) => row.status === "upcoming");

  const paidPrincipal = round2(
    paidRows.reduce((sum, row) => sum + row.principal, 0)
  );
  const paidInterest = round2(
    paidRows.reduce((sum, row) => sum + row.interest, 0)
  );
  const paidAmount = round2(paidPrincipal + paidInterest);

  const remainingInterest = round2(
    upcomingRows.reduce((sum, row) => sum + row.interest, 0)
  );
  const remainingPrincipal = round2(
    upcomingRows.reduce((sum, row) => sum + row.principal, 0)
  );
  const remainingPayment = round2(remainingPrincipal + remainingInterest);
  const outstandingPrincipal =
    paid > 0 ? schedule[paid - 1].balance : round2(P);

  const totalPayment = round2(emi * n);
  const totalInterest = round2(totalPayment - P);

  return {
    monthlyEmi: round2(emi),
    totalInterest,
    totalPayment,
    paidEmis: paid,
    remainingEmis: n - paid,
    tenureMonths: n,
    outstandingPrincipal,
    paidPrincipal,
    paidInterest,
    paidAmount,
    remainingPrincipal,
    remainingInterest,
    remainingPayment,
    schedule: upcomingRows,
    fullSchedule: schedule,
  };
};

export const calculateBillProjection = ({
  billAmount,
  frequency = "monthly",
}) => {
  const amount = Number(billAmount);
  if (!amount || amount <= 0 || Number.isNaN(amount)) {
    return { error: "Enter a valid bill amount" };
  }

  let monthlyEquivalent = amount;
  let yearlyCost = amount * 12;

  if (frequency === "quarterly") {
    monthlyEquivalent = amount / 3;
    yearlyCost = amount * 4;
  } else if (frequency === "yearly") {
    monthlyEquivalent = amount / 12;
    yearlyCost = amount;
  }

  return {
    monthlyEquivalent: round2(monthlyEquivalent),
    yearlyCost: round2(yearlyCost),
  };
};

export const emptyEmiForm = () => ({
  loanAmount: "",
  interestRate: "",
  tenureMonths: "",
  paidEmis: "0",
});

export const emptyBillForm = () => ({
  billAmount: "",
  frequency: "monthly",
});

export const emptyReminderForm = () => ({
  reminderEnabled: false,
  nextDueDate: "",
  reminderDaysBefore: "3",
});

export const simulationToForms = (item) => {
  const isEmi = isEmiBillType(item.billType);

  return {
    billType: item.billType,
    title: item.title || "",
    notes: item.notes || "",
    emiForm: isEmi
      ? {
          loanAmount: String(item.loanAmount ?? ""),
          interestRate: String(item.interestRate ?? ""),
          tenureMonths: String(item.tenureMonths ?? ""),
          paidEmis: String(item.paidEmis ?? 0),
        }
      : emptyEmiForm(),
    billForm: isEmi
      ? emptyBillForm()
      : {
          billAmount: String(item.billAmount ?? ""),
          frequency: item.frequency || "monthly",
        },
    reminderForm: {
      reminderEnabled: Boolean(item.reminderEnabled),
      nextDueDate: toDateInputValue(item.nextDueDate),
      reminderDaysBefore: String(item.reminderDaysBefore ?? 3),
    },
  };
};
