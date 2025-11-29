import React, { useEffect, useState } from "react";
import "./DriverBid.css";
import { supabase } from "../../../api/supabaseClient";

export default function DriverBids() {
  const [driverId, setDriverId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [bidInputs, setBidInputs] = useState({});

  // Load driver
  useEffect(() => {
    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDriverId(data.user.id);
    };
    loadDriver();
  }, []);

  // Fetch open delivery requests
  useEffect(() => {
    if (!driverId) return;

    const fetchRequests = async () => {
      const { data } = await supabase
        .from("delivery_requests")
        .select("*")
        .eq("status", "open");

      setRequests(data || []);
    };

    fetchRequests();
  }, [driverId]);

  // Submit bid
  const submitBid = async (req) => {
    const price = bidInputs[req.request_id];

    if (!price || price <= 0) {
      alert("Please enter a valid bid price.");
      return;
    }

    const { error } = await supabase.from("bids").insert({
      request_id: req.request_id,
      restaurant_name: req.restaurant_name,
      deliver_id: driverId, // ✔ STORE DRIVER ID
      bid_price: Number(price),
      status: "pending",
    });

    if (error) {
      console.error("Bid Error:", error);
      alert("Failed to submit bid.");
      return;
    }

    alert("Bid submitted!");
    setBidInputs({ ...bidInputs, [req.request_id]: "" });
  };

  return (
    <div className="driver-bids-dashboard">
      <h2>Bid Deliveries</h2>

      {requests.length === 0 ? (
        <p>No delivery requests available.</p>
      ) : (
        requests.map((req) => (
          <div key={req.request_id} className="driver-bid-card">
            <h3>Request #{req.request_id}</h3>

            <p><strong>Deliver To:</strong> {req.delivery_address}</p>

            <input
              type="number"
              placeholder="Enter bid price"
              className="bid-input"
              value={bidInputs[req.request_id] || ""}
              onChange={(e) =>
                setBidInputs({ ...bidInputs, [req.request_id]: e.target.value })
              }
            />

            <button
              className="submit-bid-btn"
              onClick={() => submitBid(req)}
            >
              Submit Bid
            </button>
          </div>
        ))
      )}
    </div>
  );
}
