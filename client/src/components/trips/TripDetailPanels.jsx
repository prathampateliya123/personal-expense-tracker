import { formatCurrency } from "../../utils/formatters";
import { memberNameById } from "../../utils/tripConstants";
import { TrashIcon } from "../ui/Icons";
import Button from "../ui/Button";
import NoDataFound from "../ui/NoDataFound";

const balanceTone = (balance) => {
  if (balance > 0.009) return "text-accentGreen";
  if (balance < -0.009) return "text-red-500";
  return "text-textSecondary";
};

const balanceHint = (balance) => {
  if (balance > 0.009) return `is owed ${formatCurrency(balance)}`;
  if (balance < -0.009) return `owes ${formatCurrency(Math.abs(balance))}`;
  return "settled up";
};

const TripDetailPanels = ({
  trip,
  expenses = [],
  summary,
  onDeleteExpense,
  onRecordSettlement,
  onDeleteSettlement,
  actionLoading = false,
}) => {
  const members = trip?.members || [];
  const breakdown = summary?.breakdown || [];
  const balances = summary?.balances || [];
  const suggestions = summary?.suggestedSettlements || [];
  const settlements = trip?.settlements || [];
  const total = summary?.total || 0;
  const maxCat = Math.max(1, ...breakdown.map((b) => b.total));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
            <h2 className="text-base font-semibold text-textPrimary">
              Category breakdown
            </h2>
            <p className="text-xs text-textSecondary">
              Total {formatCurrency(total)}
            </p>
          </div>
          <div className="space-y-4 p-5">
            {breakdown.length ? (
              breakdown.map((row) => (
                <div key={row.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-textPrimary">
                      {row.category}
                    </span>
                    <span className="font-bold tabular-nums text-primaryDark">
                      {formatCurrency(row.total)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surfaceGray">
                    <div
                      className="h-full rounded-full bg-accentGreen"
                      style={{
                        width: `${Math.round((row.total / maxCat) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-textSecondary">
                No expenses yet — add one to see the split by category.
              </p>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
            <h2 className="text-base font-semibold text-textPrimary">
              Who owes whom
            </h2>
            <p className="text-xs text-textSecondary">
              Net balances after expenses & settlements
            </p>
          </div>
          <ul className="divide-y divide-border">
            {balances.map((row) => (
              <li
                key={row.memberId}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div>
                  <p className="font-medium text-textPrimary">
                    {row.name}
                    {row.isSelf ? (
                      <span className="ml-1.5 text-xs text-textSecondary">
                        (you)
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-textSecondary">
                    {balanceHint(row.balance)}
                  </p>
                </div>
                <p
                  className={`text-base font-bold tabular-nums ${balanceTone(
                    row.balance
                  )}`}
                >
                  {row.balance > 0 ? "+" : ""}
                  {formatCurrency(row.balance)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
            <h2 className="text-base font-semibold text-textPrimary">
              Suggested settlements
            </h2>
            <p className="text-xs text-textSecondary">
              Minimal payments to clear the trip
            </p>
          </div>
          <div className="space-y-3 p-5">
            {suggestions.length ? (
              suggestions.map((s, idx) => (
                <div
                  key={`${s.fromMemberId}-${s.toMemberId}-${idx}`}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-textPrimary">
                    <span className="font-semibold">{s.fromName}</span>
                    {" pays "}
                    <span className="font-semibold">{s.toName}</span>
                    {" · "}
                    <span className="font-bold text-accentGreen">
                      {formatCurrency(s.amount)}
                    </span>
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() =>
                      onRecordSettlement({
                        fromMemberId: s.fromMemberId,
                        toMemberId: s.toMemberId,
                        amount: s.amount,
                      })
                    }
                  >
                    Mark settled
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-accentGreen">
                All settled — nobody owes anyone.
              </p>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
            <h2 className="text-base font-semibold text-textPrimary">
              Settlement history
            </h2>
            <p className="text-xs text-textSecondary">
              Recorded paybacks on this trip
            </p>
          </div>
          {settlements.length ? (
            <ul className="divide-y divide-border">
              {[...settlements].reverse().map((s) => (
                <li
                  key={s._id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <p className="text-sm text-textPrimary">
                    {memberNameById(members, s.fromMemberId)} →{" "}
                    {memberNameById(members, s.toMemberId)} ·{" "}
                    <span className="font-semibold">
                      {formatCurrency(s.amount)}
                    </span>
                  </p>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onDeleteSettlement(s._id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-textSecondary hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    title="Undo settlement"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6">
              <p className="text-sm text-textSecondary">
                No settlements recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border bg-surfaceLight/50 px-5 py-4">
          <h2 className="text-base font-semibold text-textPrimary">
            Expenses
          </h2>
          <p className="text-xs text-textSecondary">
            Who paid and how it was split
          </p>
        </div>
        {expenses.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surfaceLight/80 text-xs uppercase tracking-wide text-textSecondary">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Paid by</th>
                  <th className="px-4 py-3">Split</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-surfaceLight/30">
                    <td className="px-5 py-3 font-medium text-textPrimary">
                      {expense.title}
                    </td>
                    <td className="px-4 py-3 text-textSecondary">
                      {expense.category}
                    </td>
                    <td className="px-4 py-3 text-textSecondary">
                      {memberNameById(members, expense.paidBy)}
                    </td>
                    <td className="px-4 py-3 text-textSecondary">
                      {(expense.splitAmong || [])
                        .map((id) => memberNameById(members, id))
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-primaryDark">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => onDeleteExpense(expense)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-textSecondary hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        title="Delete expense"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <NoDataFound className="py-10" />
        )}
      </div>
    </div>
  );
};

export default TripDetailPanels;
