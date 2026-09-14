/**
 * pages/EditIncome.jsx
 * Full page to update an existing income.
 */

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import IncomeForm from "../components/incomes/IncomeForm";
import IncomePageHeader from "../components/incomes/IncomePageHeader";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import incomeService from "../services/incomeService";
import { incomeKeys } from "../services/queryKeys";

const EditIncome = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: incomeKeys.detail(id),
    queryFn: async () => {
      const data = await incomeService.getById(id);
      return data.income;
    },
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => incomeService.update(id, formData),
    onSuccess: async () => {
      showSuccessToast("Income updated successfully");
      await queryClient.invalidateQueries({ queryKey: incomeKeys.all });
      navigate("/incomes");
    },
    onError: handleApiError,
  });

  useEffect(() => {
    if (!detailQuery.isError) return;
    handleApiError(detailQuery.error, "Failed to load income");
    navigate("/incomes", { replace: true });
  }, [detailQuery.isError, detailQuery.error, navigate]);

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (!detailQuery.data) return null;

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <IncomePageHeader
        title="Edit income"
        subtitle={`Update details for "${detailQuery.data.title}"`}
      />

      <div className="card w-full p-6 sm:p-8">
        <IncomeForm
          variant="page"
          initialData={detailQuery.data}
          onSubmit={(formData) => updateMutation.mutate(formData)}
          onCancel={() => navigate("/incomes")}
          loading={updateMutation.isPending}
        />
      </div>
    </div>
  );
};

export default EditIncome;
