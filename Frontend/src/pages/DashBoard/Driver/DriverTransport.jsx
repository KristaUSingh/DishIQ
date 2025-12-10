import React, { useEffect, useState } from "react";
import "./DriverTransport.css";
import { supabase } from "../../../api/supabaseClient";

const DriverTransport = () => {
  const [tab, setTab] = useState("active");

  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [driverId, setDriverId] = useState(null);

  // ----------------------------------------------------
  // GET LOGGED-IN DRIVER
  // ----------------------------------------------------
  useEffect(() => {
    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDriverId(data.user.id);
    };
    loadDriver();
  }, []);

  // ----------------------------------------------------
  // FETCH WHEN DRIVER OR TAB CHANGES
  // ----------------------------------------------------
  useEffect(() => {
    if (!driverId) return;

    if (tab === "active") fetchActive();
    if (tab === "completed") fetchCompleted();
  }, [driverId, tab]);

  // ----------------------------------------------------
  // FETCH ACTIVE DELIVERIES
  // ----------------------------------------------------
  const fetchActive = async () => {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("deliver_id", driverId)
      .in("status", ["accepted", "picked_up", "in_transit"])
      .order("created_at", { ascending: false });

    if (error) return console.error("Fetch Active Error:", error);

    // Attach customer names
    const enriched = await Promise.all(
      orders.map(async (o) => {
        const { data: user } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("user_id", o.customer_id)
          .single();

        return {
          ...o,
          customer_name: user ? `${user.first_name} ${user.last_name}` : "Unknown",
        };
      })
    );

    setActiveDeliveries(enriched);
  };

  // ----------------------------------------------------
  // FETCH COMPLETED DELIVERIES
  // ----------------------------------------------------
  const fetchCompleted = async () => {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("deliver_id", driverId)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });

    if (error) return console.error("Fetch Completed Error:", error);

    const enriched = await Promise.all(
      orders.map(async (o) => {
        const { data: user } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("user_id", o.customer_id)
          .single();

        return {
          ...o,
          customer_name: user ? `${user.first_name} ${user.last_name}` : "Unknown",
        };
      })
    );

    setCompletedDeliveries(enriched);
  };

  // ----------------------------------------------------
  // UPDATE STATUS LOGIC
  // ----------------------------------------------------
  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", orderId);

    if (error) {
      console.error("Status Update Error:", error);
      return;
    }

    // Refresh lists
    fetchActive();
    fetchCompleted();
  };

  // ----------------------------------------------------
  // ACTION BUTTONS
  // ----------------------------------------------------
  const renderActionButton = (o) => {
    switch (o.status) {
      case "accepted":
        return (
          <button
            className="action-btn pickedup"
            onClick={() => updateStatus(o.order_id, "picked_up")}
          >
            Mark Picked Up
          </button>
        );
      case "picked_up":
        return (
          <button
            className="action-btn transit"
            onClick={() => updateStatus(o.order_id, "in_transit")}
          >
            Mark In Transit
          </button>
        );
      case "in_transit":
        return (
          <button
            className="action-btn delivered"
            onClick={() => updateStatus(o.order_id, "delivered")}
          >
            Mark Delivered
          </button>
        );
      default:
        return null;
    }
  };

  // ----------------------------------------------------
  // RENDER ACTIVE DELIVERIES
  // ----------------------------------------------------
  const renderActive = () => (
    <>
      {activeDeliveries.length === 0 ? (
        <p className="empty-state-message">No active deliveries.</p>
      ) : (
        activeDeliveries.map((o) => (
          <div key={o.order_id} className="transport-card">
            <div className="transport-header">
              <span className="transport-order">
                Order #{o.order_id} — {o.customer_name}
              </span>
              <span className="transport-status">{o.status.replace("_", " ")}</span>
            </div>

            <p><strong>Pay:</strong> ${Number(o.total_price).toFixed(2)}</p>
            <p><strong>Address:</strong> {o.delivery_address}</p>
            <p><strong>Restaurant:</strong> {o.restaurant_name}</p>

            {renderActionButton(o)}
          </div>
        ))
      )}
    </>
  );

  // ----------------------------------------------------
  // RENDER COMPLETED DELIVERIES
  // ----------------------------------------------------
  const renderCompleted = () => (
    <>
      {completedDeliveries.length === 0 ? (
        <p className="empty-state-message">No completed deliveries yet.</p>
      ) : (
        completedDeliveries.map((o) => (
          <div key={o.order_id} className="transport-card completed">
            <div className="transport-header">
              <span className="transport-order">
                Order #{o.order_id} — {o.customer_name}
              </span>
              <span className="transport-status delivered">Delivered</span>
            </div>

            <p><strong>Pay:</strong> ${Number(o.total_price).toFixed(2)}</p>
            <p><strong>Address:</strong> {o.delivery_address}</p>
            <p><strong>Restaurant:</strong> {o.restaurant_name}</p>
          </div>
        ))
      )}
    </>
  );

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="driver-transport-dashboard">
      <h2>Transport Orders</h2>

      {/* ---------- TABS ---------- */}
      <div className="transport-tabs">
        <button
          className={tab === "active" ? "active" : ""}
          onClick={() => setTab("active")}
        >
          Active Deliveries
        </button>

        <button
          className={tab === "completed" ? "active" : ""}
          onClick={() => setTab("completed")}
        >
          Completed Deliveries
        </button>
      </div>

      {/* ---------- TAB CONTENT ---------- */}
      {tab === "active" && renderActive()}
      {tab === "completed" && renderCompleted()}
    </div>
  );
};

export default DriverTransport;
