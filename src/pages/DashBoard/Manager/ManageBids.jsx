// FULL MANAGEBIDS.JSX FIXED
import React, { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import "./ManageBids.css";

export default function ManageBids() {
  const [managerId, setManagerId] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);

  const [requests, setRequests] = useState([]);
  const [bidsByRequest, setBidsByRequest] = useState({});
  const [memoInputs, setMemoInputs] = useState({});

  // Load manager
  useEffect(() => {
    const loadManager = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        setManagerId(user.id);

        const { data: profile } = await supabase
          .from("users")
          .select("restaurant_name")
          .eq("user_id", user.id)
          .single();

        setRestaurantName(profile?.restaurant_name);
      }
    };
    loadManager();
  }, []);

  // Fetch open requests
  useEffect(() => {
    if (restaurantName) fetchRequests();
  }, [restaurantName]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("delivery_requests")
      .select("*")
      .eq("restaurant_name", restaurantName)
      .eq("status", "open");

    if (error) return console.error("Request Fetch Error:", error);

    setRequests(data || []);
    fetchAllBids(data);
  };

  // Fetch bids for each request
  const fetchAllBids = async (requestList) => {
    let temp = {};

    for (let req of requestList) {
      const { data } = await supabase
        .from("bids")
        .select(
          `
          *,
          users:deliver_id (
            first_name,
            last_name
          )
        `
        )
        .eq("request_id", req.request_id)
        .eq("restaurant_name", restaurantName)
        .in("status", ["pending", "rejected"]);

      temp[req.request_id] = data || [];
    }

    setBidsByRequest(temp);
  };

  // Reject a bid
  const rejectBid = async (req, bid) => {
    await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("bid_id", bid.bid_id);

    alert(`Bid from ${bid.users.first_name} ${bid.users.last_name} rejected.`);
    fetchRequests();
  };

  // Approve a bid
  const approveBid = async (req, bid) => {
    const request_id = req.request_id;
    const bids = bidsByRequest[request_id];
  
    // ---------------------------
    // Check if memo required
    // ---------------------------
    const lowestPrice = Math.min(...bids.map((b) => b.bid_price));
    const memoRequired = bid.bid_price !== lowestPrice;
    const memo = memoInputs[request_id] || "";
  
    if (memoRequired && memo.trim().length === 0) {
      alert("Please provide a memo explaining why you didn’t choose the lowest bid.");
      return;
    }
  
    // ---------------------------
    // STEP 1 — Accept chosen bid
    // ---------------------------
    const { error: acceptErr } = await supabase
      .from("bids")
      .update({
        status: "accepted",
        memo: memoRequired ? memo : null,
      })
      .eq("bid_id", bid.bid_id);
  
    if (acceptErr) {
      console.error("Accept Bid Error:", acceptErr);
      return;
    }
  
    // ---------------------------
    // STEP 2 — Reject other pending bids
    // ---------------------------
    const pendingOthers = bids.filter(
      (b) => b.bid_id !== bid.bid_id && b.status === "pending"
    );
  
    if (pendingOthers.length > 0) {
      await supabase
        .from("bids")
        .update({ status: "rejected" })
        .in(
          "bid_id",
          pendingOthers.map((b) => b.bid_id)
        );
    }
  
    // ---------------------------
    // STEP 3 — Update delivery_requests
    // Save driver_id + mark as assigned
    // ---------------------------
    const { error: reqErr } = await supabase
      .from("delivery_requests")
      .update({
        status: "assigned",
        driver_id: bid.deliver_id,  // <--- IMPORTANT
      })
      .eq("request_id", request_id);
  
    if (reqErr) {
      console.error("Delivery Request Update Error:", reqErr);
      alert("Bid approved but failed to store driver ID in delivery_requests.");
      return;
    }
  
    // ---------------------------
    // STEP 4 — Update orders table
    // ---------------------------
    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        deliver_id: bid.deliver_id,
        status: "accepted",
      })
      .eq("order_id", req.order_id);
  
    if (orderErr) {
      console.error("Order Update Error:", orderErr);
      alert("Bid approved but driver could not be assigned to the order.");
      return;
    }
  
    alert("Bid approved — driver assigned successfully!");
    fetchRequests();
  };  

  return (
    <div className="manage-bids-dashboard">
      <h2>Manage Delivery Bids</h2>

      {requests.length === 0 ? (
        <p>No delivery requests to review.</p>
      ) : (
        requests.map((req) => {
          const bids = bidsByRequest[req.request_id] || [];

          return (
            <div key={req.request_id} className="manager-card">
              <h3>Delivery Request #{req.request_id}</h3>
              <p><strong>Address:</strong> {req.delivery_address}</p>

              <h4>Driver Bids:</h4>

              {bids.length === 0 ? (
                <p>No bids yet.</p>
              ) : (
                <div className="bid-list">
                  {bids
                    .sort((a, b) => a.bid_price - b.bid_price)
                    .map((bid) => (
                      <div key={bid.bid_id} className="bid-row">
                        <p>
                          <strong>
                            {bid.users.first_name} {bid.users.last_name}
                          </strong>{" "}
                          — ${bid.bid_price}
                        </p>

                        <button
                          className="approve-btn"
                          onClick={() => approveBid(req, bid)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => rejectBid(req, bid)}
                        >
                          Reject
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <textarea
                placeholder="Memo required for non-lowest bid"
                className="memo-box"
                value={memoInputs[req.request_id] || ""}
                onChange={(e) =>
                  setMemoInputs({
                    ...memoInputs,
                    [req.request_id]: e.target.value,
                  })
                }
              />
            </div>
          );
        })
      )}
    </div>
  );
}