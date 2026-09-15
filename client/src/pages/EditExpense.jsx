import expenseService from "../services/expenseService";
import { expenseKeys } from "../services/queryKeys";
import TransactionEditor from "../components/transactions/TransactionEditor";

const EditExpense = () => (
  <TransactionEditor
    mode="edit"
    listPath="/expenses"
    backLabel="Back to expenses"
    entityLabel="Expense"
    detailKey="expense"
    service={expenseService}
    queryKeys={expenseKeys}
    categoryType="expense"
  />
);

export default EditExpense;
