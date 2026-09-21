import { useParams } from "react-router-dom";
import SimulatorEditor from "../components/simulator/SimulatorEditor";

const EditSimulation = () => {
  const { id } = useParams();
  return <SimulatorEditor mode="edit" simulationId={id} />;
};

export default EditSimulation;
