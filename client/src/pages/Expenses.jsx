/**
 * pages/Expenses.jsx
 * Full-width expenses list — TanStack Query for data fetching.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ExpenseList from "../components/expenses/ExpenseList";
import ExpenseFilters from "../components/expenses/ExpenseFilters";
import { formatCurrency } from "../utils/expenseConstants";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import expenseService, { INITIAL_EXPENSE_FILTERS } from "../services/expenseService";
import { expenseKeys } from "../services/queryKeys";

const StatCard = ({ label, value, hint, hero = false }) => (
  <div className={`card flex min-h-[100px] w-full flex-col justify-center p-5 sm:p-6 ${hero ? "gradient-green-card text-white" : ""}`}>
    <p className={`text-xs font-medium uppercase tracking-wide ${hero ? "text-white/80" : "text-textSecondary"}`}>
      {label}
    </p>
    <p className={`mt-1 text-3xl font-bold sm:text-4xl ${hero ? "text-white" : "text-primaryDark"}`}>
      {value}
    </p>
    {hint && (
      <p className={`mt-1 text-xs ${hero ? "text-white/70" : "text-textSecondary"}`}>
        {hint}
      </p>
    )}
  </div>
);

const Expenses = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ...INITIAL_EXPENSE_FILTERS });

  const handleFiltersChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const listQuery = useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expenseService.list(filters),
    placeholderData: (previous) => previous,
  });

  const statsQuery = useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: async () => {
      const data = await expenseService.getStats();
      return data.stats;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expenseService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Expense deleted successfully");
      await queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
    onError: handleApiError,
  });

  const listData = listQuery.data;
  const expenses = listData?.expenses ?? [];
  const totalCount = listData?.totalCount ?? 0;
  const totalPages = listData?.totalPages ?? 1;
  const currentPage = listData?.currentPage ?? filters.page;
  const totalAmount = listData?.totalAmount ?? 0;
  const stats = statsQuery.data;
  const loading = listQuery.isLoading || listQuery.isFetching;

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setFilters((prev) => ({ ...prev, page }));
  };

  const monthLabel = useMemo(
    () =>
      stats
        ? new Date(stats.year, stats.month - 1).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })
        : "This month",
    [stats]
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-24 lg:pb-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Track and manage your spending across all categories
          </p>
        </div>
        <Link to="/expenses/add" className="btn-primary shrink-0 self-start sm:self-auto">
          + Add expense
        </Link>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Filtered total"
          value={formatCurrency(totalAmount)}
          hint={`${totalCount} expense${totalCount !== 1 ? "s" : ""} in current view`}
          hero
        />
        <StatCard
          label="Showing"
          value={expenses.length}
          hint={`Page ${currentPage} of ${totalPages}`}
        />
        <StatCard
          label={`${monthLabel} total`}
          value={formatCurrency(stats?.totalAmount)}
          hint="All expenses this month"
        />
        <StatCard
          label={`${monthLabel} count`}
          value={stats?.count ?? 0}
          hint="Transactions this month"
        />
      </div>

      <ExpenseFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <ExpenseList
        expenses={expenses}
        loading={loading && !deleteMutation.isPending}
        onDelete={handleDelete}
        deleting={deleteMutation.isPending}
      />

      <div className="card flex w-full flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-textSecondary">
          {totalCount > 0
            ? `Showing ${expenses.length} of ${totalCount} expenses`
            : "No expenses to display"}
          {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="rounded-2xl bg-surfaceGray px-4 py-2 text-sm font-medium text-textPrimary transition hover:bg-surfaceLight disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="rounded-2xl bg-surfaceGray px-4 py-2 text-sm font-medium text-textPrimary transition hover:bg-surfaceLight disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
