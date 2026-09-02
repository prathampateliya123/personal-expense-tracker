/**
 * pages/EditExpense.jsx
 * Full page to update an existing expense.
 */

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpensePageHeader from "../components/expenses/ExpensePageHeader";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import expenseService from "../services/expenseService";
import { expenseKeys } from "../services/queryKeys";

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: async () => {
      const data = await expenseService.getById(id);
      return data.expense;
    },
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => expenseService.update(id, formData),
    onSuccess: async () => {
      showSuccessToast("Expense updated successfully");
      await queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      navigate("/expenses");
    },
    onError: handleApiError,
  });

  const handleSubmit = (formData) => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => navigate("/expenses");

  useEffect(() => {
    if (!detailQuery.isError) return;
    handleApiError(detailQuery.error, "Failed to load expense");
    navigate("/expenses", { replace: true });
  }, [detailQuery.isError, detailQuery.error, navigate]);

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (!detailQuery.data) {
    return null;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-24 lg:pb-6">
      <ExpensePageHeader
        title="Edit expense"
        subtitle={`Update details for "${detailQuery.data.title}"`}
      />

      <div className="card w-full p-6 sm:p-8">
        <ExpenseForm
          variant="page"
          initialData={detailQuery.data}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updateMutation.isPending}
        />
      </div>
    </div>
  );
};

export default EditExpense;
