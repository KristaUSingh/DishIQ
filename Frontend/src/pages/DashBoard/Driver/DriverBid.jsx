import React, { useState, useEffect } from "react";
import "./DriverBid.css";
import { supabase } from "../../../api/supabaseClient";

const DriverBids = () => {
  const [tab, setTab] = useState("available");
  const [driverId, setDriverId] = useState(null);

  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [pendingBids, setPendingBids] = useState([]);
  const [approvedBids, setApprovedBids] = useState([]);
  const [rejectedBids, setRejectedBids] = useState([]);

  const [bidInputs, setBidInputs] = useState({});

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

    if (tab === "available") fetchAvailableDeliveries();
    if (tab === "pending") fetchPendingBids();
    if (tab === "approved") fetchApprovedBids();
    if (tab === "rejected") fetchRejectedBids();
  }, [driverId, tab]);

  // ----------------------------------------------------
  // FETCH AVAILABLE DELIVERY REQUESTS + OTHER BIDS
  // ----------------------------------------------------
  const fetchAvailableDeliveries = async () => {
    const { data, error } = await supabase
      .from("delivery_requests")
      .select(`
        *,
        bids (
          bid_id,
          deliver_id,
          bid_price,
          status
        )
      `)
      .eq("status", "open");

    if (error) {
      console.error("Fetch Available Error:", error);
      return;
    }

    // Attach ONLY this driver's bid if exists
    const processed = data.map((delivery) => {
      const myBid = delivery.bids?.find((b) => b.deliver_id === driverId);
      return { ...delivery, myBid };
    });

    setAvailableDeliveries(processed || []);
  };

  // ----------------------------------------------------
  // FETCH PENDING
  // ----------------------------------------------------
  const fetchPendingBids = async () => {
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("deliver_id", driverId)
      .eq("status", "pending");

    if (error) console.error("Fetch Pending Error:", error);
    setPendingBids(data || []);
  };

  // ----------------------------------------------------
  // FETCH APPROVED
  // ----------------------------------------------------
  const fetchApprovedBids = async () => {
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("deliver_id", driverId)
      .eq("status", "accepted");

    if (error) console.error("Fetch Approved Error:", error);
    setApprovedBids(data || []);
  };

  // ----------------------------------------------------
  // FETCH REJECTED
  // ----------------------------------------------------
  const fetchRejectedBids = async () => {
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("deliver_id", driverId)
      .eq("status", "rejected");

    if (error) console.error("Fetch Rejected Error:", error);
    setRejectedBids(data || []);
  };

  // ----------------------------------------------------
  // SUBMIT A NEW BID
  // ----------------------------------------------------
  const submitBid = async (delivery) => {
    const price = parseFloat(bidInputs[delivery.request_id]);
    if (!price || price <= 0) {
      alert("Enter a valid bid price.");
      return;
    }

    const { error } = await supabase.from("bids").insert({
      deliver_id: driverId,
      bid_price: price,
      status: "pending",
      delivery_address: delivery.delivery_address,
      restaurant_name: delivery.restaurant_name,
      request_id: delivery.request_id,
    });

    if (error) {
      console.error("Submit Bid Error:", error);
      alert("Failed to submit bid.");
      return;
    }

    alert("Bid submitted — waiting manager approval!");
    fetchAvailableDeliveries();

    setBidInputs((prev) => ({ ...prev, [delivery.request_id]: "" }));
  };

  // ----------------------------------------------------
  // RENDER TABS
  // ----------------------------------------------------
  const renderAvailable = () => (
    <>
      {availableDeliveries.length === 0 ? (
        <p className="empty-state-message">No available deliveries right now.</p>
      ) : (
        availableDeliveries.map((delivery) => (
          <div className="bid-card" key={delivery.request_id}>
            <h3>Order Request #{delivery.request_id}</h3>
            <p><strong>Restaurant:</strong> {delivery.restaurant_name}</p>
            <p><strong>Deliver To:</strong> {delivery.delivery_address}</p>

            {/* OTHER DRIVERS’ BIDS */}
            {delivery.bids && delivery.bids.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <p><strong>Other Driver Bids:</strong></p>
                {delivery.bids.map((b, i) => (
                  <p key={i}>Driver #{i + 1}: ${b.bid_price}</p>
                ))}
              </div>
            )}

            {/* DRIVER ALREADY BID */}
            {delivery.myBid ? (
              <p className="pending-text" style={{ marginTop: "10px" }}>
                You already submitted a bid for this order (${delivery.myBid.bid_price}).
              </p>
            ) : (
              <div className="bid-input-row">
                <input
                  type="number"
                  className="bid-input"
                  placeholder="Enter your bid price"
                  value={bidInputs[delivery.request_id] || ""}
                  onChange={(e) =>
                    setBidInputs({
                      ...bidInputs,
                      [delivery.request_id]: e.target.value,
                    })
                  }
                />

                <button
                  className="submit-bid-btn"
                  onClick={() => submitBid(delivery)}
                >
                  Submit Bid
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </>
  );

  const renderPending = () => (
    pendingBids.length === 0 ? (
      <p className="empty-state-message">No pending bids.</p>
    ) : (
      pendingBids.map((bid) => (
        <div className="bid-card" key={bid.bid_id}>
          <h3>Bid for Request #{bid.request_id}</h3>
          <p><strong>Your Bid:</strong> ${bid.bid_price}</p>
          <p><strong>Status:</strong> Waiting for manager approval</p>
        </div>
      ))
    )
  );

  const renderApproved = () => (
    approvedBids.length === 0 ? (
      <p className="empty-state-message">No approved bids yet.</p>
    ) : (
      approvedBids.map((bid) => (
        <div className="bid-card" key={bid.bid_id}>
          <h3>Approved Delivery #{bid.request_id}</h3>
          <p><strong>Pay:</strong> ${bid.bid_price}</p>
          <p><strong>Address:</strong> {bid.delivery_address}</p>
        </div>
      ))
    )
  );

  const renderRejected = () => (
    rejectedBids.length === 0 ? (
      <p className="empty-state-message">No rejected bids.</p>
    ) : (
      rejectedBids.map((bid) => (
        <div className="bid-card rejected" key={bid.bid_id}>
          <h3>Rejected Bid #{bid.request_id}</h3>
          <p><strong>Your Bid:</strong> ${bid.bid_price}</p>
          <p><strong>Status:</strong> Rejected</p>
        </div>
      ))
    )
  );

  return (
    <div className="driver-bids-dashboard">
      <h2>Driver Delivery Dashboard</h2>

      {/* -------------------- TABS -------------------- */}
      <div className="driver-tabs">
        <button className={tab === "available" ? "active" : ""} onClick={() => setTab("available")}>Available Deliveries</button>
        <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>Pending Approval</button>
        <button className={tab === "approved" ? "active" : ""} onClick={() => setTab("approved")}>Approved</button>
        <button className={tab === "rejected" ? "active" : ""} onClick={() => setTab("rejected")}>Rejected</button>
      </div>

      {/* -------------------- TAB CONTENT -------------------- */}
      {tab === "available" && renderAvailable()}
      {tab === "pending" && renderPending()}
      {tab === "approved" && renderApproved()}
      {tab === "rejected" && renderRejected()}
    </div>
  );
};

export default DriverBids;