/**
 * pages/expenses/AddExpense.jsx
 * Full page to create a new expense.
 */

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "../../components/expenses/ExpenseForm";
import ExpensePageHeader from "../../components/expenses/ExpensePageHeader";
import useReduxErrorToast from "../../hooks/useReduxErrorToast";
import { showSuccessToast } from "../../hooks/useHandleError";
import { addExpense, clearExpenseError } from "../../redux/slices/expenseSlice";

const AddExpense = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving, error } = useSelector((state) => state.expenses);

  useReduxErrorToast(error, clearExpenseError);

  const handleSubmit = async (formData) => {
    const result = await dispatch(addExpense(formData));
    if (addExpense.fulfilled.match(result)) {
      showSuccessToast("Expense added successfully");
      navigate("/expenses");
    }
  };

  const handleCancel = () => navigate("/expenses");

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-24 lg:pb-6">
      <ExpensePageHeader
        title="Add expense"
        subtitle="Record a new transaction with amount, category, and payment details"
      />

      <div className="card w-full p-6 sm:p-8">
        <ExpenseForm
          variant="page"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
        />
      </div>
    </div>
  );
};

export default AddExpense;
