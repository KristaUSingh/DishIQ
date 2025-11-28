import React from "react";
import './DriverDashboard.css';

const DriverDashboard = () => {
  return (
    <div className="driver-dashboard-container">
      <h2 className="dashboard-title">Driver Dashboard</h2>

      <div className="dashboard-section">
        <p>Welcome to the Driver Dashboard!</p>
        <p>This is the default view. Features like Bids, Transport Orders, and Delivery Ratings will appear here once implemented.</p>
      </div>
    </div>
  );
};

export default DriverDashboard;
