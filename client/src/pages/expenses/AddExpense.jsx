/**
 * pages/expenses/AddExpense.jsx
 * Full page to create a new expense.
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ExpenseForm from "../../components/expenses/ExpenseForm";
import ExpensePageHeader from "../../components/expenses/ExpensePageHeader";
import {
  addExpense,
  clearExpenseError,
} from "../../redux/slices/expenseSlice";

const AddExpense = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving, error } = useSelector((state) => state.expenses);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearExpenseError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (formData) => {
    const result = await dispatch(addExpense(formData));
    if (addExpense.fulfilled.match(result)) {
      toast.success("Expense added successfully");
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
