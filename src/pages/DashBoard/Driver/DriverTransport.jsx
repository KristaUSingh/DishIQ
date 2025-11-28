import React, { useState } from "react";
import './DriverTransport.css';

const sampleTransports = [
  {
    id: 1,
    orderNumber: "ORD-101",
    pickup: "Pizza Palace, Downtown",
    dropoff: "John Doe, Elm Street",
    payment: 12.5,
    distance: "5 km",
    status: "In Progress"
  },
  {
    id: 2,
    orderNumber: "ORD-104",
    pickup: "Sushi Express, Midtown",
    dropoff: "Anna Smith, Oak Avenue",
    payment: 15.0,
    distance: "7 km",
    status: "In Progress"
  }
];

const DriverTransport = () => {
  const [transports, setTransports] = useState(sampleTransports);

  const handleMarkDelivered = (transportId) => {
    alert(`Order ${transportId} marked as delivered!`);
    // Remove or update transport
    setTransports(prev => prev.filter(t => t.id !== transportId));
  };

  return (
    <div className="driver-transport-dashboard">
      <h2>Active Deliveries</h2>

      {transports.length === 0 ? (
        <p className="empty-state-message">No active deliveries.</p>
      ) : (
        <div className="transport-cards">
          {transports.map(t => (
            <div key={t.id} className="transport-card">
              <div className="transport-header">
                <span className="transport-order">{t.orderNumber}</span>
                <span className="transport-status">{t.status}</span>
              </div>
              <p className="transport-details"><strong>Pickup:</strong> {t.pickup}</p>
              <p className="transport-details"><strong>Dropoff:</strong> {t.dropoff}</p>
              <p className="transport-details"><strong>Distance:</strong> {t.distance}</p>
              <p className="transport-details"><strong>Payment:</strong> ${t.payment.toFixed(2)}</p>
              <button className="delivered-btn" onClick={() => handleMarkDelivered(t.id)}>
                Mark Delivered
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverTransport;
