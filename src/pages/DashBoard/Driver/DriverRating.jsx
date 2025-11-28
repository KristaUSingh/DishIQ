import React, { useEffect, useState } from "react";
import "./DriverRating.css";
import { supabase } from "../../../api/supabaseClient";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const RatingStars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="stars">
      {[...Array(full)].map((_, i) => (
        <span key={"f" + i} className="star full">★</span>
      ))}
      {half && <span className="star half">★</span>}
      {[...Array(empty)].map((_, i) => (
        <span key={"e" + i} className="star empty">☆</span>
      ))}
    </div>
  );
};

const DriverRating = () => {
  const [reviews, setReviews] = useState([]);
  const [driverId, setDriverId] = useState(null);

  // Load driver ID
  useEffect(() => {
    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDriverId(data.user.id);
    };
    loadDriver();
  }, []);

  // Fetch reviews
  useEffect(() => {
    if (!driverId) return;

    const fetchRatings = async () => {
      try {
        const res = await fetch(`${BACKEND}/driver/ratings/${driverId}`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    };

    fetchRatings();
  }, [driverId]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.delivery_rating, 0) /
        reviews.length
      : 0;

  return (
    <div className="driver-rating-dashboard">
      <h2>Your Delivery Ratings</h2>

      <div className="driver-summary">
        <div className="driver-summary-card">
          <h3>Total Reviews</h3>
          <p>{reviews.length}</p>
        </div>

        <div className="driver-summary-card">
          <h3>Average Rating</h3>
          <p>{avgRating.toFixed(1)} / 5</p>
          <RatingStars rating={avgRating} />
        </div>
      </div>

      <h3>Recent Feedback</h3>
      <div className="review-cards">
        {reviews.map((r) => (
          <div key={r.rating_id} className="review-card">
            <p><strong>Rating:</strong> {r.delivery_rating} / 5</p>
            <RatingStars rating={r.delivery_rating} />
            <p><strong>Comment:</strong> {r.comment || "No comment"}</p>
            <p className="review-date">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverRating;
