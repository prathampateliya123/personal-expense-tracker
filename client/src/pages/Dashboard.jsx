/**
 * pages/Dashboard.jsx
 * Default dashboard placeholder.
 */

import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500">
        Welcome{user?.name ? `, ${user.name}` : ""}! Your expense tracker is
        ready — start adding modules from here.
      </p>
    </div>
  );
};

export default Dashboard;
