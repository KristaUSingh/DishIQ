import React, { useEffect, useState } from "react";
import "./CustomerFeedback.css";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../context/useAuth";

const CustomerFeedback = () => {
  const { auth } = useAuth();
  const customerId = auth?.user_id;

  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("compliments");

  useEffect(() => {
    if (customerId) fetchFeedback();
  }, [customerId]);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select(`
        rating_id,
        delivery_rating,
        comment,
        created_at,
        review_type,
        dispute_status,
        manager_action,
        driver:driver_id ( first_name, last_name )
      `)
      .eq("customer_id", customerId)
      .eq("review_target", "customer")
      .not("delivery_rating", "is", null);

    if (!error) {
      setReviews(data);
    } else {
      console.error("Error loading customer feedback:", error);
    }
  };

  const handleDispute = async (rating_id) => {
    const { error } = await supabase
      .from("ratings")
      .update({ dispute_status: "pending" })
      .eq("rating_id", rating_id);

    if (error) console.error(error);
    fetchFeedback();
  };

  // ✅ FIXED: filter BEFORE return()
  const filtered = reviews.filter((r) =>
    activeTab === "compliments"
      ? r.review_type === "compliment"
      : r.review_type === "complaint"
  );

  return (
    <div className="customer-feedback-container">
      <h2 className="customer-feedback-title">Your Delivery Feedback</h2>

      {/* TABS */}
      <div className="cf-tabs">
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

      {/* FEEDBACK LIST */}
      {filtered.length === 0 ? (
        <p className="no-feedback">No {activeTab} yet.</p>
      ) : (
        filtered.map((fb) => (
          <div key={fb.rating_id} className="customer-feedback-card">
            <div className="cf-header">
              <strong>Driver:</strong>{" "}
              {fb.driver?.first_name} {fb.driver?.last_name}
            </div>

            <div className="cf-row">
              <strong>Rating:</strong> {fb.delivery_rating} ⭐
            </div>

            <div className="cf-row">
              <strong>Comment:</strong> {fb.comment}
            </div>

            {/* Complaint Actions */}
            {activeTab === "complaints" && (
              <div className="cf-dispute-box">
                {fb.dispute_status === "none" && (
                  <button
                    className="cf-dispute-btn"
                    onClick={() => handleDispute(fb.rating_id)}
                  >
                    Dispute Complaint
                  </button>
                )}

                {fb.dispute_status === "pending" && (
                  <p className="cf-pending">
                    Dispute submitted. Awaiting manager review.
                  </p>
                )}

                {fb.dispute_status === "resolved" && (
                  <p className="cf-resolved">
                    Manager Decision:{" "}
                    <strong>
                      {fb.manager_action === "dismissed"
                        ? "Complaint dismissed."
                        : "Warning issued."}
                    </strong>
                  </p>
                )}
              </div>
            )}

            <div className="cf-date">
              {new Date(fb.created_at).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CustomerFeedback;