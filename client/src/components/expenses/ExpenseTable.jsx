import TransactionTable from "../transactions/TransactionTable";

const ExpenseTable = (props) => (
  <TransactionTable
    {...props}
    items={props.expenses}
    categoryType="expense"
    editBasePath="/expenses"
    columnLabel="Expense"
    entityName="expenses"
    deleteTitle="Delete expense?"
  />
);

export default ExpenseTable;
