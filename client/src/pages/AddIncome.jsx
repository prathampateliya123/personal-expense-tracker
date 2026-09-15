import incomeService from "../services/incomeService";
import { incomeKeys } from "../services/queryKeys";
import TransactionEditor from "../components/transactions/TransactionEditor";

const AddIncome = () => (
  <TransactionEditor
    mode="add"
    listPath="/incomes"
    backLabel="Back to incomes"
    entityLabel="Income"
    detailKey="income"
    service={incomeService}
    queryKeys={incomeKeys}
    categoryType="income"
    addTitle="Add income"
    addSubtitle="Record salary, freelance, or other money received"
  />
);

export default AddIncome;
