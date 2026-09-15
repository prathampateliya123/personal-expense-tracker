import Button from "../ui/Button";
import { formatCurrency } from "../../utils/formatters";
import { labelClass } from "./wealthHelpers";

const MoneyFormModal = ({
  target,
  mode,
  amount,
  onAmountChange,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-textPrimary/30 p-4 backdrop-blur-[2px]">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-5">
        <h3 className="text-lg font-semibold text-textPrimary">
          {mode === "contribute" ? "Add money" : "Withdraw"} — {target.name}
        </h3>
        <p className="text-sm text-textSecondary">
          Current saved: {formatCurrency(target.currentAmount)}
        </p>
        <div>
          <label htmlFor="money-amount" className={labelClass}>
            Amount (₹)
          </label>
          <input
            id="money-amount"
            type="number"
            min="0"
            step="0.01"
            className="fintech-input"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MoneyFormModal;
