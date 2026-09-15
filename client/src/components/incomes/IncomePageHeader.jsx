import PageBackHeader from "../common/PageBackHeader";

const IncomePageHeader = ({ title, subtitle }) => (
  <PageBackHeader
    backTo="/incomes"
    backLabel="Back to incomes"
    title={title}
    subtitle={subtitle}
  />
);

export default IncomePageHeader;
