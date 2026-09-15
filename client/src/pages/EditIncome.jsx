import incomeService from "../services/incomeService";
import { incomeKeys } from "../services/queryKeys";
import TransactionEditor from "../components/transactions/TransactionEditor";

const EditIncome = () => (
  <TransactionEditor
    mode="edit"
    listPath="/incomes"
    backLabel="Back to incomes"
    entityLabel="Income"
    detailKey="income"
    service={incomeService}
    queryKeys={incomeKeys}
    categoryType="income"
  />
);

export default EditIncome;
