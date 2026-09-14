/**
 * pages/AddIncome.jsx
 * Full page to create a new income.
 */

import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import IncomeForm from "../components/incomes/IncomeForm";
import IncomePageHeader from "../components/incomes/IncomePageHeader";
import { handleApiError, showSuccessToast } from "../hooks/useHandleError";
import incomeService from "../services/incomeService";
import { incomeKeys } from "../services/queryKeys";

const AddIncome = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload) => incomeService.create(payload),
    onSuccess: async () => {
      showSuccessToast("Income added successfully");
      await queryClient.invalidateQueries({ queryKey: incomeKeys.all });
      navigate("/incomes");
    },
    onError: handleApiError,
  });

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-6">
      <IncomePageHeader
        title="Add income"
        subtitle="Record salary, freelance, or other money received"
      />

      <div className="card w-full p-6 sm:p-8">
        <IncomeForm
          variant="page"
          onSubmit={(formData) => createMutation.mutate(formData)}
          onCancel={() => navigate("/incomes")}
          loading={createMutation.isPending}
        />
      </div>
    </div>
  );
};

export default AddIncome;
