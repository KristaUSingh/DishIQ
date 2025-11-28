import React, { useState, useEffect } from "react";
import "./DriverBid.css";
import { supabase } from "../../../api/supabaseClient";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const DriverBids = () => {
  const [bids, setBids] = useState([]);
  const [driverId, setDriverId] = useState(null);

  // Get logged-in driver ID
  useEffect(() => {
    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDriverId(data.user.id);
    };
    loadDriver();
  }, []);

  // Fetch all bids after driverId loads
  useEffect(() => {
    if (!driverId) return;

    const fetchBids = async () => {
      try {
        const res = await fetch(`${BACKEND}/driver/bids`);
        const data = await res.json();
        setBids(data.bids || []);
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    fetchBids();
  }, [driverId]);

  // Accept bid → calls backend
  const handleAcceptBid = async (bid) => {
    try {
      await fetch(`${BACKEND}/driver/bids/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bid_id: bid.bid_id,
          order_id: bid.order_id,
          deliver_id: driverId,
        }),
      });

      // Remove from screen
      setBids((prev) => prev.filter((b) => b.bid_id !== bid.bid_id));

      alert(`Bid accepted for order ${bid.order_id}!`);
    } catch (err) {
      console.error("Error accepting bid:", err);
    }
  };

  return (
    <div className="driver-bids-dashboard">
      <h2>Available Delivery Bids</h2>

      {bids.length === 0 ? (
        <p className="empty-state-message">No available bids.</p>
      ) : (
        <div className="bid-cards">
          {bids.map((bid) => (
            <div key={bid.bid_id} className="bid-card">
              <div className="bid-header">
                <span className="bid-order">Order #{bid.order_id}</span>
                <span className="bid-payment">${Number(bid.bid_price).toFixed(2)}</span>
              </div>

              <p><strong>Delivery Address:</strong> {bid.delivery_address}</p>
              {bid.memo && <p><strong>Notes:</strong> {bid.memo}</p>}
              <p><strong>Status:</strong> {bid.status}</p>

              <button className="accept-btn" onClick={() => handleAcceptBid(bid)}>
                Accept Bid
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverBids;
