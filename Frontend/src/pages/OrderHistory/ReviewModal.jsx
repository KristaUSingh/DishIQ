import React, { useState } from "react";
import "./ReviewModal.css";
import { supabase } from "../../api/supabaseClient";

const ReviewModal = ({ data, onClose }) => {
  const { type, order, dish } = data;

  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewType, setReviewType] = useState("complaint"); // default
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    setLoading(true);

    // ⭐ CORRECT REVIEW TARGET LOGIC
    let reviewTarget = "";
    if (type === "dish") reviewTarget = "chef";      // Customer → reviews chef
    if (type === "driver") reviewTarget = "driver";  // Customer → reviews driver

    const payload = {
      order_id: order.order_id,
      customer_id: order.customer_id,
      restaurant_name: order.restaurant_name,
      comment,
      review_type: reviewType,   // compliment / complaint
      review_target: reviewTarget, // ⭐ FIXED
    };

    // Dish review (chef)
    if (type === "dish") {
      payload.food_rating = foodRating;
      payload.dish_id = dish.dish_id;
      payload.chef_id = order.chef_id;
    }

    // Driver review
    if (type === "driver") {
      payload.delivery_rating = deliveryRating;
      payload.driver_id = order.deliver_id;
    }

    const { error } = await supabase.from("ratings").insert(payload);
    setLoading(false);

    if (!error) {
      onClose();
    } else {
      console.error(error);
      alert("There was an issue submitting your review.");
    }
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <h2>
          {type === "dish"
            ? `Review Dish: ${dish.menus?.name}`
            : "Review Delivery Driver"}
        </h2>

        {/* Review Type */}
        <label>Review Type</label>
        <select value={reviewType} onChange={(e) => setReviewType(e.target.value)}>
          <option value="complaint">Complaint</option>
          <option value="compliment">Compliment</option>
        </select>

        {/* Dish rating */}
        {type === "dish" && (
          <>
            <label>Food Rating</label>
            <select
              value={foodRating}
              onChange={(e) => setFoodRating(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>
          </>
        )}

        {/* Driver rating */}
        {type === "driver" && (
          <>
            <label>Delivery Rating</label>
            <select
              value={deliveryRating}
              onChange={(e) => setDeliveryRating(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>
          </>
        )}

        {/* Comment */}
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            reviewType === "complaint"
              ? "What went wrong?"
              : "What did you like?"
          }
        />

        <div className="modal-buttons">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
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