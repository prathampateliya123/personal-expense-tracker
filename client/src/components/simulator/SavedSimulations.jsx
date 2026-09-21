import { TrashIcon } from "../ui/Icons";
import NoDataFound from "../ui/NoDataFound";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  getBillTypeLabel,
  isEmiBillType,
} from "../../utils/billSimulator";

const SavedSimulations = ({ items = [], loading = false, onDelete, deleting = false }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-surfaceGray" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="card">
        <NoDataFound />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-textPrimary">
          Saved scenarios
        </h2>
        <p className="text-xs text-textSecondary">
          Compare EMI and bill estimates you saved
        </p>
      </div>

      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <p className="font-semibold text-textPrimary">{item.title}</p>
              <p className="mt-0.5 text-xs text-textSecondary">
                {getBillTypeLabel(item.billType)} ·{" "}
                {formatDate(item.createdAt)}
              </p>
              <p className="mt-2 text-sm text-textSecondary">
                {isEmiBillType(item.billType) ? (
                  <>
                    EMI {formatCurrency(item.monthlyEmi)} · Interest{" "}
                    {formatCurrency(item.totalInterest)} · Total{" "}
                    {formatCurrency(item.totalPayment)}
                  </>
                ) : (
                  <>
                    Monthly {formatCurrency(item.monthlyEquivalent)} · Yearly{" "}
                    {formatCurrency(item.yearlyCost)}
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              disabled={deleting}
              onClick={() => onDelete(item)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 sm:self-auto"
              title="Delete"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedSimulations;
