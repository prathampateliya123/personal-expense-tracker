import TransactionTable from "../transactions/TransactionTable";

const IncomeTable = (props) => (
  <TransactionTable
    {...props}
    items={props.incomes}
    categoryType="income"
    editBasePath="/incomes"
    columnLabel="Income"
    entityName="incomes"
    deleteTitle="Delete income?"
  />
);

export default IncomeTable;
