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

export const calculateEmi = ({ loanAmount, interestRate, tenureMonths }) => {
  const P = Number(loanAmount);
  const annualRate = Number(interestRate);
  const n = parseInt(tenureMonths, 10);

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

  let emi;
  if (annualRate === 0) {
    emi = P / n;
  } else {
    const r = annualRate / 12 / 100;
    const factor = (1 + r) ** n;
    emi = (P * r * factor) / (factor - 1);
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

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
    });
  }

  return {
    monthlyEmi: round2(emi),
    totalInterest: round2(totalInterest),
    totalPayment: round2(totalPayment),
    schedule,
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
});

export const emptyBillForm = () => ({
  billAmount: "",
  frequency: "monthly",
});
