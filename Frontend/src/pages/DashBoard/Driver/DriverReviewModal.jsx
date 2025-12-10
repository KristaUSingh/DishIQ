import React, { useState, useEffect } from "react";
import { supabase } from "../../../api/supabaseClient";
import "./DriverReviewModal.css";

const DriverReviewModal = ({ order, driverId, onClose }) => {
  const [rating, setRating] = useState(5);
  const [reviewType, setReviewType] = useState("complaint");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ NEW — detect if driver already reviewed this customer
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    checkExistingReview();
  }, []);

  const checkExistingReview = async () => {
    const { data } = await supabase
      .from("ratings")
      .select("rating_id")
      .eq("order_id", order.order_id)
      .eq("driver_id", driverId)
      .eq("customer_id", order.customer_id)
      .eq("review_target", "customer");

    if (data && data.length > 0) {
      setAlreadyReviewed(true);
    }
  };

  const submitReview = async () => {
    if (alreadyReviewed) return;

    setLoading(true);

    const payload = {
      order_id: order.order_id,

      driver_id: driverId,            // reviewer
      customer_id: order.customer_id, // target
      review_target: "customer",      // ⭐ REQUIRED

      delivery_rating: rating,
      review_type: reviewType,
      comment,

      // not relevant
      food_rating: null,
      dish_id: null,
      chef_id: null,

      restaurant_name: order.restaurant_name,
    };

    const { error } = await supabase.from("ratings").insert(payload);

    setLoading(false);

    if (!error) {
      setAlreadyReviewed(true);
      onClose();
    } else {
      console.error(error);
      alert("Error submitting review.");
    }
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <h2>Review Customer: {order.customer_name}</h2>

        {alreadyReviewed && (
          <p className="already-reviewed-msg">
            You already reviewed this customer for this order.
          </p>
        )}

        <label>Rating</label>
        <select
          value={rating}
          disabled={alreadyReviewed}
          onChange={(e) => setRating(+e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} ★</option>
          ))}
        </select>

        <label>Review Type</label>
        <select
          value={reviewType}
          disabled={alreadyReviewed}
          onChange={(e) => setReviewType(e.target.value)}
        >
          <option value="complaint">Complaint</option>
          <option value="compliment">Compliment</option>
        </select>

        <label>Comment</label>
        <textarea
          value={comment}
          disabled={alreadyReviewed}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            reviewType === "complaint"
              ? "Describe the issue…"
              : "What went well?"
          }
        />

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>

          <button
            className="submit-btn"
            disabled={loading || alreadyReviewed}
            onClick={submitReview}
          >
            {alreadyReviewed
              ? "Review Submitted"
              : loading
              ? "Submitting..."
              : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverReviewModal;