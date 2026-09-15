import Select from "../ui/Select";
import TableSearch from "../table/TableSearch";
import TablePager, { TableLimit } from "../table/TablePager";
import NoDataFound from "../ui/NoDataFound";
import { PencilSquareIcon, TrashIcon } from "../ui/Icons";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  INVESTMENT_TYPE_OPTIONS,
  getInvestmentTypeLabel,
} from "../../utils/wealthConstants";

const InvestmentsSection = ({
  investments,
  loading,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  listMeta,
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
            placeholder="Search investments..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            id="inv-filter-type"
            value={filters.type}
            onChange={(e) =>
              onFiltersChange({ type: e.target.value, page: 1 })
            }
            placeholder="Type"
            options={INVESTMENT_TYPE_OPTIONS}
            size="sm"
          />
          <TableLimit
            value={filters.limit}
            onChange={(limit) => onFiltersChange({ limit, page: 1 })}
          />
        </div>
      </div>
    </div>

    {loading && investments.length === 0 ? (
      <div className="space-y-3 p-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surfaceGray" />
        ))}
      </div>
    ) : investments.length === 0 ? (
      <NoDataFound />
    ) : (
      <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surfaceLight/60 text-xs font-semibold uppercase tracking-wide text-textSecondary">
                <th className="px-5 py-3">Investment</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Invested</th>
                <th className="px-5 py-3">Current</th>
                <th className="px-5 py-3">Return</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-border last:border-0 hover:bg-surfaceLight/70"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-textPrimary">{item.name}</p>
                    <p className="text-xs text-textSecondary">
                      {item.institution || formatDate(item.purchaseDate)}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-textSecondary">
                    {getInvestmentTypeLabel(item.type)}
                  </td>
                  <td className="px-5 py-4">
                    {formatCurrency(item.amountInvested)}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {formatCurrency(item.currentValue)}
                  </td>
                  <td
                    className={`px-5 py-4 font-medium ${
                      (item.gainLoss || 0) >= 0
                        ? "text-accentGreen"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(item.gainLoss)} ({item.returnPercent}
                    %)
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-textSecondary hover:bg-successBg"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border md:hidden">
          {investments.map((item) => (
            <div key={item._id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-textPrimary">{item.name}</p>
                  <p className="text-xs text-textSecondary">
                    {getInvestmentTypeLabel(item.type)}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    (item.gainLoss || 0) >= 0
                      ? "text-accentGreen"
                      : "text-red-500"
                  }`}
                >
                  {item.returnPercent}%
                </p>
              </div>
              <p className="text-sm text-textSecondary">
                {formatCurrency(item.amountInvested)} →{" "}
                {formatCurrency(item.currentValue)}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                >
                  <PencilSquareIcon />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    <TablePager
      page={listMeta?.currentPage || filters.page}
      totalPages={listMeta?.totalPages || 1}
      totalRecords={listMeta?.totalCount || 0}
      pageSize={filters.limit}
      entityName="investments"
      disabled={loading}
      onPageChange={(page) => onFiltersChange({ page })}
    />
  </div>
);

export default InvestmentsSection;
