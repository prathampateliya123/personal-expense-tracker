import expenseService from "../services/expenseService";
import { expenseKeys } from "../services/queryKeys";
import TransactionEditor from "../components/transactions/TransactionEditor";

const AddExpense = () => (
  <TransactionEditor
    mode="add"
    listPath="/expenses"
    backLabel="Back to expenses"
    entityLabel="Expense"
    detailKey="expense"
    service={expenseService}
    queryKeys={expenseKeys}
    categoryType="expense"
    addTitle="Add expense"
    addSubtitle="Record a new transaction with amount, category, and payment details"
  />
);

export default AddExpense;
