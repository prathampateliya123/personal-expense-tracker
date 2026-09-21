import { useParams } from "react-router-dom";
import SubscriptionEditor from "../components/subscriptions/SubscriptionEditor";

const EditSubscription = () => {
  const { id } = useParams();
  return <SubscriptionEditor mode="edit" subscriptionId={id} />;
};

export default EditSubscription;
