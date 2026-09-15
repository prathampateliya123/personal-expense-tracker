import expenseService, { INITIAL_EXPENSE_FILTERS } from "../services/expenseService";
import { expenseKeys } from "../services/queryKeys";
import TransactionListPage from "../components/transactions/TransactionListPage";

const Expenses = () => (
  <TransactionListPage
    title="Expenses"
    subtitle="Track and manage your spending across all categories"
    addLabel="+ Add expense"
    addTo="/expenses/add"
    entitySingular="Expense"
    entityPlural="expenses"
    itemsKey="expenses"
    service={expenseService}
    queryKeys={expenseKeys}
    initialFilters={INITIAL_EXPENSE_FILTERS}
    tableProps={{
      categoryType: "expense",
      editBasePath: "/expenses",
      columnLabel: "Expense",
      entityName: "expenses",
      deleteTitle: "Delete expense?",
    }}
  />
);

export default Expenses;
