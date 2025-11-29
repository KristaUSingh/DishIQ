import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./Rating.css";
import { supabase } from "../../../api/supabaseClient";

// ----------------- FIXED STAR COMPONENT -----------------

const Star = ({ type }) => {
  const colors = {
    full: "var(--star-fill)",
    empty: "var(--star-empty)",
  };

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={type === "full" ? colors.full : "none"}
      stroke={type === "full" ? colors.full : colors.empty}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block" }}
    >
      <polygon points="12 2 15 9 22 9 17 14 19 22 12 18 5 22 7 14 2 9 9 9" />
    </svg>
  );
};

const RatingStars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="stars">
      {[...Array(full)].map((_, i) => (
        <Star key={`full-${i}`} type="full" />
      ))}

      {half && <Star type="half" />} {/* visually shaded in CSS */}

      {[...Array(empty)].map((_, i) => (
        <Star key={`empty-${i}`} type="empty" />
      ))}
    </div>
  );
};

RatingStars.propTypes = {
  rating: PropTypes.number.isRequired,
};

// ----------------- RATING PAGE -----------------

const Rating = ({ restaurant_name }) => {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    if (restaurant_name) {
      fetchRatings();
    }
  }, [restaurant_name]);
  

  const fetchRatings = async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select("food_rating, created_at")
      .eq("restaurant_name", restaurant_name);

    if (error) {
      console.error("Error loading ratings:", error);
      return;
    }

    // use ONLY food_rating
    const formatted = data.map((r) => ({
      rating: Number(r.food_rating),
      created_at: r.created_at,
    }));

    setRatings(formatted);
  };

  const totalReviews = ratings.length;

  const avgRating =
    totalReviews > 0
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;

  let rewardMessage = "";
  if (avgRating >= 4.5) {
    rewardMessage = "Excellent! You earn a reward 🎉";
  } else if (avgRating >= 3.5) {
    rewardMessage = "Good performance! Keep it up 👍";
  } else {
    rewardMessage = "Warning! You may incur a penalty ⚠️";
  }

  return (
    <div className="chef-rating-container">
      <h2 className="rating-title">Chef Rating</h2>

      <div className="average-rating">
        <RatingStars rating={avgRating} />
        <span className="rating-number">{avgRating.toFixed(1)}</span>
      </div>

      <p className="review-count">
        {totalReviews} review{totalReviews !== 1 ? "s" : ""}
      </p>

      <p className="reward-message">{rewardMessage}</p>

      <div className="reviews-list">
        {ratings.map((review, index) => (
          <div key={index} className="review-box">
            <RatingStars rating={review.rating} />
            <span className="individual-rating">
              {review.rating.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rating;