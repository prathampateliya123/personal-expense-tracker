import { useParams } from "react-router-dom";
import InvestmentEditor from "../components/wealth/InvestmentEditor";

const EditInvestment = () => {
  const { id } = useParams();
  return <InvestmentEditor mode="edit" investmentId={id} />;
};

export default EditInvestment;
