/**
 * pages/Dashboard.jsx
 */

import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex min-h-[50vh] items-center">
     
    </div>
  );
};

export default Dashboard;
