import Button from "../ui/Button";
import Select from "../ui/Select";
import TableSearch from "../table/TableSearch";
import TablePager, { TableLimit } from "../table/TablePager";
import NoDataFound from "../ui/NoDataFound";
import ProgressBar from "../common/ProgressBar";
import { PencilSquareIcon, TrashIcon } from "../ui/Icons";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  SAVING_STATUS_OPTIONS,
  getSavingStatusLabel,
} from "../../utils/wealthConstants";

const SavingsSection = ({
  savings,
  loading,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  listMeta,
  onContribute,
  onWithdraw,
  onEdit,
  onDelete,
}) => (
  <div className="table-panel w-full overflow-hidden">
    <div className="border-b border-border bg-surfaceLight/50 px-3 py-2.5 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <TableSearch
            value={search}
            onChange={onSearchChange}
            placeholder="Search goals..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            id="saving-filter-status"
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ status: e.target.value, page: 1 })
            }
            placeholder="Status"
            options={SAVING_STATUS_OPTIONS}
            size="sm"
          />
          <TableLimit
            value={filters.limit}
            onChange={(limit) => onFiltersChange({ limit, page: 1 })}
          />
        </div>
      </div>
    </div>

    {loading && savings.length === 0 ? (
      <div className="space-y-3 p-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-surfaceGray" />
        ))}
      </div>
    ) : savings.length === 0 ? (
      <NoDataFound />
    ) : (
      <div className="divide-y divide-border">
        {savings.map((item) => (
          <div
            key={item._id}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-textPrimary">{item.name}</p>
                <span className="rounded-md bg-surfaceGray px-2 py-0.5 text-xs font-medium text-textSecondary">
                  {getSavingStatusLabel(item.status)}
                </span>
              </div>
              <p className="text-sm text-textSecondary">
                {formatCurrency(item.currentAmount)} of{" "}
                {formatCurrency(item.targetAmount)}
                {item.deadline ? ` · due ${formatDate(item.deadline)}` : ""}
              </p>
              <ProgressBar percent={item.percentComplete || 0} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onContribute(item)}
              >
                Add money
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onWithdraw(item)}
              >
                Withdraw
              </Button>
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary hover:bg-successBg hover:text-primaryDark"
                aria-label={`Edit ${item.name}`}
              >
                <PencilSquareIcon />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary hover:bg-red-50 hover:text-red-500"
                aria-label={`Delete ${item.name}`}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    <TablePager
      page={listMeta?.currentPage || filters.page}
      totalPages={listMeta?.totalPages || 1}
      totalRecords={listMeta?.totalCount || 0}
      pageSize={filters.limit}
      entityName="goals"
      disabled={loading}
      onPageChange={(page) => onFiltersChange({ page })}
    />
  </div>
);

export default SavingsSection;
