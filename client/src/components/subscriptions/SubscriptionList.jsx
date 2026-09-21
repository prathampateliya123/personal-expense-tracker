import {
  PencilSquareIcon,
  TrashIcon,
} from "../ui/Icons";
import NoDataFound from "../ui/NoDataFound";
import TablePager, { TableLimit } from "../table/TablePager";
import TableSearch from "../table/TableSearch";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  BILLING_CYCLE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
  getBillingCycleLabel,
  getSubscriptionStatusLabel,
} from "../../utils/subscriptionConstants";
import { statusBadgeClass } from "./subscriptionHelpers";

const dueHint = (item) => {
  if (item.status !== "active") return null;
  if (item.isDue) return "Due now";
  if (item.isUpcomingReminder) {
    return `Due in ${item.daysUntilBilling} day${
      item.daysUntilBilling === 1 ? "" : "s"
    }`;
  }
  return null;
};

const SubscriptionList = ({
  items = [],
  loading = false,
  filters,
  onFiltersChange,
  searchInput,
  onSearchChange,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onCancel,
  actionLoading = false,
}) => {
  const hasFilters =
    filters.status || filters.billingCycle || filters.search;

  return (
    <div className="table-panel w-full overflow-hidden">
      <div className="border-b border-border bg-surfaceLight/50 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="table-toolbar">
          <div className="table-toolbar__row">
            <div className="table-toolbar__search">
              <div className="table-toolbar__search-field">
                <TableSearch value={searchInput} onChange={onSearchChange} />
              </div>
            </div>
            <div className="table-toolbar__controls">
              <div className="table-toolbar__control-row">
                <div className="table-toolbar__tools-wrap">
                  <div className="table-toolbar__tools table-toolbar__controls-start">
                    <Select
                      id="sub-filter-status"
                      value={filters.status}
                      onChange={(e) =>
                        onFiltersChange({ status: e.target.value, page: 1 })
                      }
                      placeholder="Status"
                      options={SUBSCRIPTION_STATUS_OPTIONS}
                      size="sm"
                      className="table-toolbar__type"
                    />
                    <Select
                      id="sub-filter-cycle"
                      value={filters.billingCycle}
                      onChange={(e) =>
                        onFiltersChange({
                          billingCycle: e.target.value,
                          page: 1,
                        })
                      }
                      placeholder="Cycle"
                      options={BILLING_CYCLE_OPTIONS}
                      size="sm"
                      className="table-toolbar__type"
                    />
                    <TableLimit
                      value={filters.limit}
                      onChange={(limit) =>
                        onFiltersChange({ limit, page: 1 })
                      }
                    />
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={() =>
                          onFiltersChange({
                            status: "",
                            billingCycle: "",
                            search: "",
                            page: 1,
                          })
                        }
                        className="shrink-0 text-sm font-medium text-accentGreen hover:text-primaryMid"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-surfaceGray"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <NoDataFound />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead className="bg-surfaceLight/95">
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-textSecondary">
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Cycle</th>
                  <th className="px-5 py-3.5">Next bill</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {items.map((item) => {
                  const hint = dueHint(item);
                  return (
                    <tr key={item._id} className="hover:bg-surfaceLight/60">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-textPrimary">
                          {item.serviceName}
                        </p>
                        <p className="mt-0.5 text-xs text-textSecondary">
                          {item.category} · {item.paymentMode}
                          {item.autoAddExpense ? " · Auto expense" : ""}
                        </p>
                        {hint ? (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            {hint}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 font-semibold tabular-nums">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-5 py-4 text-textSecondary">
                        {getBillingCycleLabel(item.billingCycle)}
                      </td>
                      <td className="px-5 py-4 text-textSecondary">
                        {formatDate(item.nextBillingDate)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                            item.status
                          )}`}
                        >
                          {getSubscriptionStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {item.status === "active" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={actionLoading}
                              onClick={() => onPause(item)}
                            >
                              Pause
                            </Button>
                          ) : null}
                          {item.status === "paused" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={actionLoading}
                              onClick={() => onResume(item)}
                            >
                              Resume
                            </Button>
                          ) : null}
                          {item.status !== "cancelled" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={actionLoading}
                              onClick={() => onCancel(item)}
                            >
                              Cancel
                            </Button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-accentGreen/30 hover:bg-successBg hover:text-primaryDark"
                            title="Edit"
                          >
                            <PencilSquareIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-textSecondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border md:hidden">
            {items.map((item) => {
              const hint = dueHint(item);
              return (
                <div key={item._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-textPrimary">
                        {item.serviceName}
                      </p>
                      <p className="mt-0.5 text-xs text-textSecondary">
                        {getBillingCycleLabel(item.billingCycle)} ·{" "}
                        {formatDate(item.nextBillingDate)}
                      </p>
                      {hint ? (
                        <p className="mt-1 text-xs font-medium text-amber-700">
                          {hint}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-bold tabular-nums text-textPrimary">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                        item.status
                      )}`}
                    >
                      {getSubscriptionStatusLabel(item.status)}
                    </span>
                    {item.status === "active" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={actionLoading}
                        onClick={() => onPause(item)}
                      >
                        Pause
                      </Button>
                    ) : null}
                    {item.status === "paused" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={actionLoading}
                        onClick={() => onResume(item)}
                      >
                        Resume
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <TablePager
        page={currentPage}
        totalPages={totalPages}
        totalRecords={totalCount}
        pageSize={filters.limit}
        entityName="subscriptions"
        onPageChange={onPageChange}
        disabled={loading}
      />
    </div>
  );
};

export default SubscriptionList;
