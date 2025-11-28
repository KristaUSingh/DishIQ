import React, { useEffect, useState } from "react";
import "./DriverTransport.css";
import { supabase } from "../../../api/supabaseClient";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const DriverTransport = () => {
  const [transports, setTransports] = useState([]);
  const [driverId, setDriverId] = useState(null);

  // Get logged-in driver ID
  useEffect(() => {
    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDriverId(data.user.id);
    };
    loadDriver();
  }, []);

  // Load active deliveries
  useEffect(() => {
    if (!driverId) return;

    const fetchTransports = async () => {
      try {
        const res = await fetch(`${BACKEND}/driver/transports/${driverId}`);
        const data = await res.json();
        setTransports(data.deliveries || []);
      } catch (err) {
        console.error("Error fetching transports:", err);
      }
    };

    fetchTransports();
  }, [driverId]);

  // Mark delivered
  const handleMarkDelivered = async (orderId) => {
    try {
      await fetch(`${BACKEND}/driver/transports/delivered`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: "Delivered" }),
      });

      setTransports((prev) => prev.filter((t) => t.order_id !== orderId));
      alert(`Order ${orderId} marked as delivered.`);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="driver-transport-dashboard">
      <h2>Active Deliveries</h2>

      {transports.length === 0 ? (
        <p className="empty-state-message">No active deliveries.</p>
      ) : (
        <div className="transport-cards">
          {transports.map((t) => (
            <div key={t.order_id} className="transport-card">
              <div className="transport-header">
                <span className="transport-order">Order #{t.order_id}</span>
                <span className="transport-status">{t.status}</span>
              </div>

              <p><strong>Total Price:</strong> ${Number(t.total_price).toFixed(2)}</p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(t.created_at).toLocaleString()}
              </p>

              <button
                className="delivered-btn"
                onClick={() => handleMarkDelivered(t.order_id)}
              >
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
