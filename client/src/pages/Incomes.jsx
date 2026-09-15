import incomeService, { INITIAL_INCOME_FILTERS } from "../services/incomeService";
import { incomeKeys } from "../services/queryKeys";
import TransactionListPage from "../components/transactions/TransactionListPage";

const Incomes = () => (
  <TransactionListPage
    title="Incomes"
    subtitle="Track salary, freelance, and other money you receive"
    addLabel="+ Add income"
    addTo="/incomes/add"
    entitySingular="Income"
    entityPlural="incomes"
    itemsKey="incomes"
    service={incomeService}
    queryKeys={incomeKeys}
    initialFilters={INITIAL_INCOME_FILTERS}
    tableProps={{
      categoryType: "income",
      editBasePath: "/incomes",
      columnLabel: "Income",
      entityName: "incomes",
      deleteTitle: "Delete income?",
    }}
  />
);

export default Incomes;
