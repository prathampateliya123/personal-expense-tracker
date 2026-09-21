import { useParams } from "react-router-dom";
import SavingEditor from "../components/wealth/SavingEditor";

const EditSaving = () => {
  const { id } = useParams();
  return <SavingEditor mode="edit" savingId={id} />;
};

export default EditSaving;
