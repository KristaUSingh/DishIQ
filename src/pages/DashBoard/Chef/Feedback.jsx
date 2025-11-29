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
        dish_id,
        customer:customer_id ( first_name, last_name )
      `)
      .eq("restaurant_name", restaurant_name);
  
    if (error) {
      console.error("Error loading feedback:", error);
      return;
    }
  
    // Filter out NULL dish ids BEFORE querying menus
    const dishIds = [
      ...new Set(
        data
          .map((r) => r.dish_id)
          .filter((id) => id !== null && id !== undefined) // <--- FIX
      ),
    ];
  
    let menuMap = {};
  
    if (dishIds.length > 0) {
      const { data: menuData, error: menuErr } = await supabase
        .from("menus")
        .select("dish_id, name")
        .in("dish_id", dishIds); // dishIds now contains ONLY integers
  
      if (!menuErr && menuData) {
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
      dish_name: item.dish_id ? menuMap[item.dish_id] : null,
      created_at: new Date(item.created_at).toLocaleString(),
    }));
  
    setFeedback(formatted);
  };  

  return (
    <div className="feedback-container">
      <h2 className="feedback-title">Customer Feedback</h2>

      {feedback.length === 0 ? (
        <p>No feedback available yet.</p>
      ) : (
        feedback.map((fb) => (
          <div key={fb.id} className="feedback-card-clean">

            <div className="fb-header">
              <span className="fb-name">{fb.customer}</span>
              <span className="fb-date">{fb.created_at}</span>
            </div>

            {/* Dish Name */}
            <div className="fb-row">
              <span className="fb-label"><strong>Dish:</strong></span>
              <span className="fb-comment">{fb.dish_name || "Delivery Review"}</span>
            </div>

            {/* Rating */}
            <div className="fb-row">
              <span className="fb-label"><strong>Food Rating:</strong></span>
              <Stars rating={fb.food_rating || 0} />
            </div>


            {/* Comment */}
            <div className="fb-row comment-row">
              <span className="fb-label"><strong>Comment:</strong></span>
              <span className="fb-comment">{fb.comment}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Feedback;