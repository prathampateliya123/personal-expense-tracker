import PageBackHeader from "../common/PageBackHeader";

const ExpensePageHeader = ({ title, subtitle }) => (
  <PageBackHeader
    backTo="/expenses"
    backLabel="Back to expenses"
    title={title}
    subtitle={subtitle}
  />
);

export default ExpensePageHeader;
