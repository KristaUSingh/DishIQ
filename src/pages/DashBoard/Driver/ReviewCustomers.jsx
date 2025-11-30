import React, { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import "./ReviewCustomers.css";

const DriverReviewCustomers = () => {
  const [deliverId, setDeliverId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDeliverId(data.user.id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (deliverId) fetchCompletedOrders();
  }, [deliverId]);

  const fetchCompletedOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        users:customer_id ( first_name, last_name ),
        ratings:ratings(*)
      `)
      .eq("deliver_id", deliverId)
      .eq("status", "delivered");

    setOrders(data || []);
  };

  const submitCustomerReview = async () => {
    const payload = {
      order_id: reviewTarget.order_id,
      customer_id: reviewTarget.customer_id,
      driver_id: deliverId,
      review_target: "customer",
      delivery_rating: rating,
      comment,
    };

    await supabase.from("ratings").insert(payload);

    setReviewTarget(null);
    setComment("");
    setRating(5);
    fetchCompletedOrders();
  };

  return (
    <div className="driver-review-page">
      <h2>Review Customers</h2>

      {orders.length === 0 && <p>No completed deliveries yet.</p>}

      {orders.map((o) => {
        const alreadyReviewed = o.ratings.some(
          (r) => r.review_target === "customer"
        );

        return (
          <div className="customer-review-card" key={o.order_id}>
            <h4>
              Order #{o.order_id} — {o.users.first_name} {o.users.last_name}
            </h4>

            <p><strong>Address:</strong> {o.delivery_address}</p>

            <button
              className={`review-btn ${alreadyReviewed ? "disabled-review" : ""}`}
              disabled={alreadyReviewed}
              onClick={() => setReviewTarget(o)}
            >
              {alreadyReviewed ? "Already Reviewed" : "Review Customer"}
            </button>
          </div>
        );
      })}

      {reviewTarget && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <h3>
              Review Customer:{" "}
              {reviewTarget.users.first_name} {reviewTarget.users.last_name}
            </h3>

            <label>Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>

            <label>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain the delivery experience"
            />

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setReviewTarget(null)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={submitCustomerReview}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverReviewCustomers;