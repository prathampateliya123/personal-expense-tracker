import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import IncomeTable from "../components/incomes/IncomeTable";
import StatCard from "../components/common/StatCard";
import { formatCurrency } from "../utils/formatters";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import incomeService, { INITIAL_INCOME_FILTERS } from "../services/incomeService";
import { incomeKeys } from "../services/queryKeys";

const Incomes = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ...INITIAL_INCOME_FILTERS });

  const handleFiltersChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const listQuery = useQuery({
    queryKey: incomeKeys.list(filters),
    queryFn: () => incomeService.list(filters),
    placeholderData: (previous) => previous,
  });

  const statsQuery = useQuery({
    queryKey: incomeKeys.stats(),
    queryFn: async () => {
      const data = await incomeService.getStats();
      return data.stats;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => incomeService.remove(id),
    onSuccess: async () => {
      showSuccessToast("Income deleted successfully");
      await queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    },
    onError: handleApiError,
  });

  const listData = listQuery.data;
  const incomes = listData?.incomes ?? [];
  const totalCount = listData?.totalCount ?? 0;
  const totalPages = listData?.totalPages ?? 1;
  const currentPage = listData?.currentPage ?? filters.page;
  const totalAmount = listData?.totalAmount ?? 0;
  const stats = statsQuery.data;
  const loading = listQuery.isLoading || listQuery.isFetching;

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
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
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Incomes
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Track salary, freelance, and other money you receive
          </p>
        </div>
        <Link
          to="/incomes/add"
          className="btn-primary shrink-0 self-start sm:self-auto"
        >
          + Add income
        </Link>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Filtered total"
          value={formatCurrency(totalAmount)}
          hint={`${totalCount} income${totalCount !== 1 ? "s" : ""} in current view`}
          hero
        />
        <StatCard
          label="Showing"
          value={incomes.length}
          hint={`Page ${currentPage} of ${totalPages}`}
        />
        <StatCard
          label={`${monthLabel} total`}
          value={formatCurrency(stats?.totalAmount)}
          hint="All income this month"
        />
        <StatCard
          label={`${monthLabel} count`}
          value={stats?.count ?? 0}
          hint="Transactions this month"
        />
      </div>

      <IncomeTable
        filters={filters}
        onFiltersChange={handleFiltersChange}
        incomes={incomes}
        loading={loading && !deleteMutation.isPending}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page < 1 || page > totalPages) return;
          setFilters((prev) => ({ ...prev, page }));
        }}
        onDelete={handleDelete}
        deleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default Incomes;
