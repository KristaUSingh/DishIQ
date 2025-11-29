import React, { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import "./ManageBids.css";

export default function ManageBids() {
  const [managerId, setManagerId] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);

  const [requests, setRequests] = useState([]);
  const [bidsByRequest, setBidsByRequest] = useState({});
  const [memoInputs, setMemoInputs] = useState({});

  // ----------------------------------------------------------
  // GET MANAGER PROFILE
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // FETCH REQUESTS
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // FETCH BIDS FOR EACH REQUEST
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // REJECT A SINGLE BID ONLY
  // ----------------------------------------------------------
  const rejectBid = async (req, bid) => {
    const request_id = req.request_id;

    const { error: rejectErr } = await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("bid_id", bid.bid_id);

    if (rejectErr) {
      console.error("Reject Bid Error:", rejectErr);
      alert("Failed to reject bid.");
      return;
    }

    alert(`Bid from ${bid.users.first_name} ${bid.users.last_name} rejected.`);

    fetchRequests();
  };

  // ----------------------------------------------------------
  // APPROVE BID → REJECT OTHERS → ASSIGN ORDER DRIVER
  // ----------------------------------------------------------
  const approveBid = async (req, bid) => {
    const request_id = req.request_id;
    const bids = bidsByRequest[request_id];

    const lowestPrice = Math.min(...bids.map((b) => b.bid_price));
    const memoRequired = bid.bid_price !== lowestPrice;

    const memo = memoInputs[request_id] || "";
    if (memoRequired && memo.trim().length === 0) {
      alert("Please provide a memo explaining why you didn’t choose the lowest bid.");
      return;
    }

    // STEP 1 — Accept selected bid
    const { error: acceptErr } = await supabase
      .from("bids")
      .update({
        status: "accepted",
        memo: memoRequired ? memo : null,
      })
      .eq("bid_id", bid.bid_id);

    if (acceptErr) return console.error(acceptErr);

    // STEP 2 — Reject all OTHER pending bids (but keep rejected bids untouched)
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

    // STEP 3 — Mark request assigned
    await supabase
      .from("delivery_requests")
      .update({ status: "assigned" })
      .eq("request_id", request_id);

    // STEP 4 — Assign driver to order
    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        deliver_id: bid.deliver_id,
        status: "accepted",
      })
      .eq("order_id", req.order_id);

    if (orderErr) {
      console.error("Order Update Error:", orderErr);
      alert("Bid approved but driver could not be assigned to order.");
      return;
    }

    alert("Bid approved — driver assigned!");
    fetchRequests();
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  return (
    <div className="manage-bids-dashboard">
      <h2>Manage Delivery Bids</h2>

      {requests.length === 0 ? (
        <p className="empty-state-message">No delivery requests to review.</p>
      ) : (
        requests.map((req) => {
          const bids = bidsByRequest[req.request_id] || [];

          return (
            <div key={req.request_id} className="manager-card">
              <h3>Delivery Request #{req.request_id}</h3>
              <p>
                <strong>Deliver To:</strong> {req.delivery_address}
              </p>

              <h4>Driver Bids:</h4>

              {bids.length === 0 ? (
                <p>No bids yet.</p>
              ) : (
                <div className="bid-list">
                  {bids
                    .sort((a, b) => a.bid_price - b.bid_price)
                    .map((bid) => {
                      const isLowest =
                        bid.bid_price === Math.min(...bids.map((b) => b.bid_price));

                      const isRejected = bid.status === "rejected";

                      return (
                        <div
                          key={bid.bid_id}
                          className={`bid-row ${isRejected ? "rejected" : ""}`}
                        >
                          <p>
                            <strong>
                              {bid.users?.first_name} {bid.users?.last_name}
                            </strong>{" "}
                            — ${bid.bid_price}
                            {!isRejected && isLowest && (
                              <span className="lowest-tag">Lowest</span>
                            )}
                            {isRejected && (
                              <span className="rejected-tag">Rejected</span>
                            )}
                          </p>

                          {!isRejected && (
                            <div className="bid-actions">
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
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              <textarea
                placeholder="Memo required if selecting a non-lowest bid"
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
