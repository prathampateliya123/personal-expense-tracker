/**
 * utils/walletConstants.js
 * Shared wallet type labels and styles for UI.
 */

export const WALLET_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank" },
  { value: "card", label: "Card" },
];

export const WALLET_TYPE_STYLES = {
  cash: { bg: "bg-green-50", text: "text-green-700" },
  upi: { bg: "bg-purple-50", text: "text-purple-700" },
  bank: { bg: "bg-blue-50", text: "text-blue-700" },
  card: { bg: "bg-orange-50", text: "text-orange-700" },
};
