import { Link } from "react-router-dom";
import NoDataFound from "../ui/NoDataFound";
import { IconPlus } from "../ui/Icons";
import ProgressBar from "../common/ProgressBar";
import {
  getCategoryAvatarClass,
  getCategoryChipClass,
} from "../../utils/categoryColors";
import { formatCurrency } from "../../utils/formatters";

const BudgetAllocations = ({
  categories,
  allocationRows,
  allocationDraft,
  setAllocationDraft,
  colorMap,
}) => (
  <div className="border-t border-border pt-5">
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-textPrimary">
          Category allocations
        </h3>
        <p className="text-xs text-textSecondary">
          Optional limits per expense category
        </p>
      </div>
      {categories.length === 0 ? (
        <Link
          to="/categories"
          className="inline-flex items-center gap-1 text-sm font-medium text-accentGreen hover:text-primaryMid"
        >
          <IconPlus className="h-4 w-4" />
          Add expense categories
        </Link>
      ) : null}
    </div>

    {categories.length === 0 ? (
      <NoDataFound className="py-10" />
    ) : (
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surfaceLight/60 text-xs font-semibold uppercase tracking-wide text-textSecondary">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Spent</th>
                <th className="px-4 py-3">Progress</th>
              </tr>
            </thead>
            <tbody>
              {allocationRows.map((row) => (
                <tr
                  key={row.category}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(
                          colorMap[row.category] || row
                        )}`}
                      >
                        {row.category?.[0] || "?"}
                      </div>
                      <span
                        className={`category-chip ${getCategoryChipClass(
                          colorMap[row.category] || row
                        )}`}
                      >
                        {row.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={allocationDraft[row.category] ?? ""}
                      onChange={(e) =>
                        setAllocationDraft((prev) => ({
                          ...prev,
                          [row.category]: e.target.value,
                        }))
                      }
                      className="fintech-input max-w-[140px]"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-textPrimary">
                    {formatCurrency(row.spent)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-[120px] space-y-1">
                      <ProgressBar
                        percent={
                          row.amount > 0
                            ? Math.round((row.spent / row.amount) * 100)
                            : 0
                        }
                        over={row.amount > 0 && row.spent > row.amount}
                      />
                      <p className="text-xs text-textSecondary">
                        {row.amount > 0
                          ? `${Math.min(
                              100,
                              Math.round((row.spent / row.amount) * 100)
                            )}%`
                          : "No limit"}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border md:hidden">
          {allocationRows.map((row) => (
            <div key={row.category} className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${getCategoryAvatarClass(
                    colorMap[row.category] || row
                  )}`}
                >
                  {row.category?.[0] || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-textPrimary">
                    {row.category}
                  </p>
                  <p className="text-xs text-textSecondary">
                    Spent {formatCurrency(row.spent)}
                  </p>
                </div>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={allocationDraft[row.category] ?? ""}
                onChange={(e) =>
                  setAllocationDraft((prev) => ({
                    ...prev,
                    [row.category]: e.target.value,
                  }))
                }
                className="fintech-input"
                placeholder="Budget amount"
              />
              <ProgressBar
                percent={
                  row.amount > 0
                    ? Math.round((row.spent / row.amount) * 100)
                    : 0
                }
                over={row.amount > 0 && row.spent > row.amount}
              />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default BudgetAllocations;
