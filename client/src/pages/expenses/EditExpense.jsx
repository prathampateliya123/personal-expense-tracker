/**
 * pages/expenses/EditExpense.jsx
 * Full page to update an existing expense.
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ExpenseForm from "../../components/expenses/ExpenseForm";
import ExpensePageHeader from "../../components/expenses/ExpensePageHeader";
import { showErrorToast, showSuccessToast } from "../../hooks/useHandleError";
import {
  fetchExpenseById,
  updateExpense,
  clearExpenseError,
  clearCurrentExpense,
} from "../../redux/slices/expenseSlice";

const EditExpense = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentExpense, detailLoading, saving, error } = useSelector(
    (state) => state.expenses
  );

  useEffect(() => {
    dispatch(fetchExpenseById(id));
    return () => {
      dispatch(clearCurrentExpense());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!error) return;

    showErrorToast(error);
    dispatch(clearExpenseError());

    if (!currentExpense && !detailLoading) {
      navigate("/expenses", { replace: true });
    }
  }, [error, dispatch, currentExpense, detailLoading, navigate]);

  const handleSubmit = async (formData) => {
    const result = await dispatch(updateExpense({ id, data: formData }));
    if (updateExpense.fulfilled.match(result)) {
      showSuccessToast("Expense updated successfully");
      navigate("/expenses");
    }
  };

  const handleCancel = () => navigate("/expenses");

  if (detailLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentGreen border-t-transparent" />
      </div>
    );
  }

  if (!currentExpense) {
    return null;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-24 lg:pb-6">
      <ExpensePageHeader
        title="Edit expense"
        subtitle={`Update details for "${currentExpense.title}"`}
      />

      <div className="card w-full p-6 sm:p-8">
        <ExpenseForm
          variant="page"
          initialData={currentExpense}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
        />
      </div>
    </div>
  );
};

export default EditExpense;
