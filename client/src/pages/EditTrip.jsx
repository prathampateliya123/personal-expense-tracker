import { useParams } from "react-router-dom";
import TripEditor from "../components/trips/TripEditor";

const EditTrip = () => {
  const { id } = useParams();
  return <TripEditor mode="edit" tripId={id} />;
};

export default EditTrip;
