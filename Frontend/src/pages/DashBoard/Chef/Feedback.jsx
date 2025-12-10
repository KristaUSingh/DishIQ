import React, { useEffect, useState } from "react";
import "./Feedback.css";
import { supabase } from "../../../api/supabaseClient";

const StarSVG = ({ className }) => (
  <svg className={`star ${className}`} viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 
      9.24l-7.19-.61L12 2 9.19 8.63 
      2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const HalfStarSVG = () => (
  <svg className="star svg-half" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="half-fill">
        <stop offset="50%" stopColor="#4CAF50" />
        <stop offset="50%" stopColor="#ddd" />
      </linearGradient>
    </defs>
    <path fill="url(#half-fill)" d="M12 17.27L18.18 21l-1.64-7.03L22 
      9.24l-7.19-.61L12 2 9.19 8.63 
      2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const Stars = ({ rating }) => {
  if (!rating) rating = 0;
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="stars">
      {Array(full)
        .fill(0)
        .map((_, i) => <StarSVG key={`f-${i}`} className="svg-full" />)}

      {half && <HalfStarSVG />}

      {Array(empty)
        .fill(0)
        .map((_, i) => <StarSVG key={`e-${i}`} className="svg-empty" />)}
    </div>
  );
};

const Feedback = ({ restaurant_name }) => {
  const [feedback, setFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState("compliments");

  useEffect(() => {
    if (restaurant_name) fetchFeedback();
  }, [restaurant_name]);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select(`
        rating_id,
        food_rating,
        comment,
        created_at,
        review_type,
        dispute_status,
        manager_action,
        dish_id,
        customer:customer_id ( first_name, last_name )
      `)
      .eq("restaurant_name", restaurant_name)
      .eq("review_target", "chef"); // Only reviews targeted at the chef

    if (error) {
      console.error("Error loading feedback:", error);
      return;
    }

    // Extract dish IDs
    const dishIds = [
      ...new Set(
        data
          .map((r) => r.dish_id)
          .filter((id) => id !== null && id !== undefined)
      ),
    ];

    let menuMap = {};

    if (dishIds.length > 0) {
      const { data: menuData } = await supabase
        .from("menus")
        .select("dish_id, name")
        .in("dish_id", dishIds);

      if (menuData) {
        menuData.forEach((m) => {
          menuMap[m.dish_id] = m.name;
        });
      }
    }

    const formatted = data.map((item) => ({
      id: item.rating_id,
      customer: `${item.customer.first_name} ${item.customer.last_name}`,
      food_rating: item.food_rating,
      comment: item.comment,
      review_type: item.review_type,
      dispute_status: item.dispute_status,
      manager_action: item.manager_action,
      dish_name: item.dish_id ? menuMap[item.dish_id] : null,
      created_at: new Date(item.created_at).toLocaleString(),
    }));

    setFeedback(formatted);
  };

  // Handle dispute
  const handleDispute = async (rating_id) => {
    const { error } = await supabase
      .from("ratings")
      .update({ dispute_status: "pending" })
      .eq("rating_id", rating_id);

    if (error) console.error(error);
    fetchFeedback();
  };

  // Filter by compliments/complaints
  const filtered = feedback.filter((fb) =>
    activeTab === "compliments"
      ? fb.review_type === "compliment"
      : fb.review_type === "complaint"
  );

  return (
    <div className="feedback-container">
      <h2 className="feedback-title">Customer Feedback</h2>

      {/* FILTER TABS */}
      <div className="fb-tabs">
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

      {filtered.length === 0 ? (
        <p className="no-feedback">No {activeTab} yet.</p>
      ) : (
        filtered.map((fb) => (
          <div key={fb.id} className="feedback-card-clean">
            <div className="fb-header">
              <span className="fb-name">{fb.customer}</span>
              <span className="fb-date">{fb.created_at}</span>
            </div>

            {/* Dish */}
            <div className="fb-row">
              <strong>Dish:</strong> {fb.dish_name || "N/A"}
            </div>

            {/* Rating */}
            <div className="fb-row">
              <strong>Food Rating:</strong>
              <Stars rating={fb.food_rating} />
            </div>

            {/* Comment */}
            <div className="fb-row comment-row">
              <strong>Comment:</strong> {fb.comment}
            </div>

            {/* Dispute logic */}
            {activeTab === "complaints" && (
              <div className="fb-dispute-box">
                {fb.dispute_status === "none" && (
                  <button
                    className="fb-dispute-btn"
                    onClick={() => handleDispute(fb.id)}
                  >
                    Dispute Complaint
                  </button>
                )}

                {fb.dispute_status === "pending" && (
                  <p className="fb-pending">Dispute submitted. Awaiting manager review.</p>
                )}

                {fb.dispute_status === "resolved" && (
                  <p className="fb-resolved">
                    Manager Decision:{" "}
                    <strong>
                      {fb.manager_action === "dismissed"
                        ? "Complaint dismissed"
                        : "Warning issued"}
                    </strong>
                  </p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Feedback;