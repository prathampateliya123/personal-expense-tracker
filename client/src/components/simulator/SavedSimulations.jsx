import { PencilSquareIcon, TrashIcon } from "../ui/Icons";
import NoDataFound from "../ui/NoDataFound";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  getBillTypeLabel,
  isEmiBillType,
} from "../../utils/billSimulator";

const dueHint = (item) => {
  if (!item.reminderEnabled) return null;
  if (item.isDue) return "Due now";
  if (item.isUpcomingReminder) {
    return `Due in ${item.daysUntilDue} day${
      item.daysUntilDue === 1 ? "" : "s"
    }`;
  }
  if (item.nextDueDate) return formatDate(item.nextDueDate);
  return null;
};

const dueBadgeClass = (item) => {
  if (item.isDue) return "bg-red-50 text-red-600";
  if (item.isUpcomingReminder) return "bg-amber-50 text-amber-700";
  return "bg-surfaceGray text-textSecondary";
};

const ActionButtons = ({ item, onEdit, onDelete, deleting }) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      type="button"
      onClick={() => onEdit(item)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
      aria-label={`Edit ${item.title}`}
      title="Edit"
    >
      <PencilSquareIcon />
    </button>
    <button
      type="button"
      disabled={deleting}
      onClick={() => onDelete(item)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      aria-label={`Delete ${item.title}`}
      title="Delete"
    >
      <TrashIcon />
    </button>
  </div>
);

const amountSummary = (item) => {
  if (isEmiBillType(item.billType)) {
    return {
      primary: formatCurrency(item.monthlyEmi),
      secondary: formatCurrency(
        item.outstandingPrincipal ?? item.loanAmount
      ),
      secondaryLabel: "Outstanding",
    };
  }
  return {
    primary: formatCurrency(item.monthlyEquivalent),
    secondary: formatCurrency(item.yearlyCost),
    secondaryLabel: "Yearly",
  };
};

const SavedSimulations = ({
  items = [],
  loading = false,
  onEdit,
  onDelete,
  deleting = false,
}) => {
  if (loading) {
    return (
      <div className="table-panel overflow-hidden">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <div className="h-5 w-40 animate-pulse rounded bg-surfaceGray" />
        </div>
        <div className="space-y-0">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse border-b border-border bg-surfaceLight/40"
            />
          ))}
        </div>
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
    <div className="table-panel w-full overflow-hidden">
      <div className="border-b border-border bg-surfaceLight/50 px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-textPrimary">
          Saved scenarios
        </h2>
        <p className="text-xs text-textSecondary">
          Edit, track reminders, and compare EMI / bill estimates
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-surfaceLight/80 text-xs uppercase tracking-wide text-textSecondary">
            <tr>
              <th className="px-4 py-3 sm:px-5">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Monthly</th>
              <th className="px-4 py-3">Balance / yearly</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Reminder</th>
              <th className="px-4 py-3 text-right sm:px-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
              const amounts = amountSummary(item);
              const hint = dueHint(item);

              return (
                <tr key={item._id} className="hover:bg-surfaceLight/40">
                  <td className="px-4 py-3.5 sm:px-5">
                    <p className="font-semibold text-textPrimary">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-textSecondary">
                      Saved {formatDate(item.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-textSecondary">
                    {getBillTypeLabel(item.billType)}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums font-medium text-textPrimary">
                    {amounts.primary}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="tabular-nums text-textPrimary">
                      {amounts.secondary}
                    </p>
                    <p className="text-xs text-textSecondary">
                      {amounts.secondaryLabel}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-textSecondary">
                    {isEmiBillType(item.billType) ? (
                      <>
                        {item.paidEmis || 0} paid
                        {item.remainingEmis != null
                          ? ` · ${item.remainingEmis} left`
                          : ""}
                      </>
                    ) : (
                      item.frequency || "—"
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {hint ? (
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${dueBadgeClass(
                          item
                        )}`}
                      >
                        {hint}
                      </span>
                    ) : (
                      <span className="text-xs text-textSecondary">Off</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <ActionButtons
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      deleting={deleting}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavedSimulations;
