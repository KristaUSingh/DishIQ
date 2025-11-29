import React, { useState } from "react";
import "./ReviewModal.css";
import { supabase } from "../../api/supabaseClient";

const ReviewModal = ({ order, onClose }) => {
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewType, setReviewType] = useState("review");   // NEW
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    setLoading(true);

    const { error } = await supabase.from("ratings").insert({
      order_id: order.order_id,
      customer_id: order.customer_id,
      restaurant_name: order.restaurant_name,
      food_rating: foodRating,
      delivery_rating: deliveryRating,
      comment: comment,
      review_type: reviewType,   // NEW FIELD
    });

    setLoading(false);

    if (!error) {
      onClose();
    } else {
      console.error("Error saving review:", error);
      alert("There was an issue submitting your review.");
    }
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <h2>Leave a Review</h2>

        {/* REVIEW TYPE */}
        <label>Review Type</label>
        <select
          value={reviewType}
          onChange={(e) => setReviewType(e.target.value)}
        >
          <option value="review">Standard Review</option>
          <option value="complaint">Complaint</option>
          <option value="compliment">Compliment</option>
        </select>

        {/* FOOD RATING */}
        <label>Food Rating</label>
        <select
          value={foodRating}
          onChange={(e) => setFoodRating(e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>

        {/* DELIVERY RATING */}
        <label>Delivery Rating</label>
        <select
          value={deliveryRating}
          onChange={(e) => setDeliveryRating(e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>

        {/* COMMENT BOX */}
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            reviewType === "complaint"
              ? "What went wrong?"
              : reviewType === "compliment"
              ? "What did you like?"
              : "Write your feedback..."
          }
        />

        <div className="modal-buttons">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button
            onClick={submitReview}
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;