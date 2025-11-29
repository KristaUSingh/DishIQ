import React, { useEffect, useState } from "react";
import "./DriverRating.css";
import { supabase } from "../../../api/supabaseClient";

// ---------------------- STAR COMPONENT ----------------------
const StarSVG = ({ className }) => (
  <svg className={`star ${className}`} viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 
      9.24l-7.19-.61L12 2 9.19 8.63 
      2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const RatingStars = ({ rating }) => {
  const full = Math.round(rating); // delivery ratings are whole numbers
  const empty = 5 - full;

  return (
    <div className="stars">
      {Array(full).fill(0).map((_, i) => (
        <StarSVG key={`f-${i}`} className="svg-full" />
      ))}
      {Array(empty).fill(0).map((_, i) => (
        <StarSVG key={`e-${i}`} className="svg-empty" />
      ))}
    </div>
  );
};


// ---------------------- MAIN COMPONENT ----------------------
const DriverRating = () => {
  const [reviews, setReviews] = useState([]);
  const [driverId, setDriverId] = useState(null);

  // ----------------------------------------------------------
  // LOAD THE LOGGED-IN DRIVER ID
  // ----------------------------------------------------------
  useEffect(() => {
    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDriverId(data.user.id);
    };
    loadDriver();
  }, []);

  // ----------------------------------------------------------
  // FETCH RATINGS FOR THIS DRIVER
  // ----------------------------------------------------------
  useEffect(() => {
    if (!driverId) return;

    const fetchRatings = async () => {
      try {
        const { data, error } = await supabase
          .from("ratings")
          .select("rating_id, delivery_rating, comment, created_at")
          .eq("driver_id", driverId)          // ⭐ match driver
          .not("delivery_rating", "is", null) // only delivery reviews
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          return;
        }

        setReviews(data || []);
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    };

    fetchRatings();
  }, [driverId]);

  // ----------------------------------------------------------
  // AVERAGE RATING
  // ----------------------------------------------------------
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.delivery_rating, 0) /
        reviews.length
      : 0;

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  return (
    <div className="driver-rating-dashboard">
      <h2>Your Delivery Ratings</h2>

      {/* Summary Boxes */}
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

      {/* Feedback List */}
      <h3>Recent Feedback</h3>

      {reviews.length === 0 ? (
        <p className="no-reviews">No delivery reviews yet.</p>
      ) : (
        <div className="review-cards">
          {reviews.map((r) => (
            <div key={r.rating_id} className="review-card">
              <p>
                <strong>Rating:</strong> {r.delivery_rating} / 5
              </p>
              <RatingStars rating={r.delivery_rating} />

              <p>
                <strong>Comment:</strong> {r.comment || "No comment"}
              </p>

              <p className="review-date">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverRating;