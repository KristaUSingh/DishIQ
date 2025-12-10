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
  if (!rating) rating = 0;
  const full = Math.round(rating);
  const empty = 5 - full;

  return (
    <div className="stars">
      {Array(full)
        .fill(0)
        .map((_, i) => (
          <StarSVG key={`f-${i}`} className="svg-full" />
        ))}

      {Array(empty)
        .fill(0)
        .map((_, i) => (
          <StarSVG key={`e-${i}`} className="svg-empty" />
        ))}
    </div>
  );
};

// ---------------------- MAIN COMPONENT ----------------------
const DriverRating = () => {
  const [reviews, setReviews] = useState([]);
  const [driverId, setDriverId] = useState(null);
  const [activeTab, setActiveTab] = useState("compliments");

  // Load logged-in driver
  useEffect(() => {
    const loadDriver = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setDriverId(data.user.id);
    };
    loadDriver();
  }, []);

  // Fetch reviews targeting delivery drivers
  useEffect(() => {
    if (!driverId) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select(`
          rating_id,
          delivery_rating,
          comment,
          review_type,
          dispute_status,
          manager_action,
          created_at,
          customer:customer_id ( first_name, last_name )
        `)
        .eq("driver_id", driverId)
        .eq("review_target", "driver")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setReviews(data || []);
    };

    fetchRatings();
  }, [driverId]);

  // Filter by tab
  const filtered = reviews.filter((r) =>
    activeTab === "compliments"
      ? r.review_type === "compliment"
      : r.review_type === "complaint"
  );

  // Handle dispute
  const handleDispute = async (rating_id) => {
    await supabase
      .from("ratings")
      .update({ dispute_status: "pending" })
      .eq("rating_id", rating_id);

    // Refresh list
    const updated = reviews.map((r) =>
      r.rating_id === rating_id ? { ...r, dispute_status: "pending" } : r
    );
    setReviews(updated);
  };

  // Average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.delivery_rating || 0), 0) /
        reviews.length
      : 0;

  return (
    <div className="driver-rating-dashboard">
      <h2>Your Delivery Ratings</h2>

      {/* SUMMARY */}
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

      {/* FILTER TABS */}
      <div className="driver-tabs">
        <button
          className={activeTab === "compliments" ? "active-tab" : ""}
          onClick={() => setActiveTab("compliments")}
        >
          Compliments
        </button>

        <button
          className={activeTab === "complaints" ? "active-tab" : ""}
          onClick={() => setActiveTab("complaints")}
        >
          Complaints
        </button>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <p className="no-reviews">No {activeTab} yet.</p>
      ) : (
        <div className="review-cards">
          {filtered.map((r) => (
            <div key={r.rating_id} className="review-card">
              <p>
                <strong>Customer:</strong>{" "}
                {r.customer.first_name} {r.customer.last_name}
              </p>

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

              {/* DISPUTE BUTTON FOR COMPLAINTS */}
              {activeTab === "complaints" && (
                <div className="dispute-box">
                  {r.dispute_status === "none" && (
                    <button
                      className="dispute-btn"
                      onClick={() => handleDispute(r.rating_id)}
                    >
                      Dispute Complaint
                    </button>
                  )}

                  {r.dispute_status === "pending" && (
                    <p className="pending-text">
                      Dispute submitted — waiting for manager decision.
                    </p>
                  )}

                  {r.dispute_status === "resolved" && (
                    <p className="resolved-text">
                      Manager Decision:{" "}
                      <strong>
                        {r.manager_action === "dismissed"
                          ? "Complaint dismissed"
                          : "Warning issued"}
                      </strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverRating;