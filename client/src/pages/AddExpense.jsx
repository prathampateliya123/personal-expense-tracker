/**
 * pages/AddExpense.jsx
 * Full page to create a new expense.
 */

import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpensePageHeader from "../components/expenses/ExpensePageHeader";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import expenseService from "../services/expenseService";
import { expenseKeys } from "../services/queryKeys";

const AddExpense = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload) => expenseService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Expense added successfully");
      await queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      navigate("/expenses");
    },
    onError: handleApiError,
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const handleCancel = () => navigate("/expenses");

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <ExpensePageHeader
        title="Add expense"
        subtitle="Record a new transaction with amount, category, and payment details"
      />

      <div className="card w-full p-6 sm:p-8">
        <ExpenseForm
          variant="page"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={createMutation.isPending}
        />
      </div>
    </div>
  );
};

export default AddExpense;
