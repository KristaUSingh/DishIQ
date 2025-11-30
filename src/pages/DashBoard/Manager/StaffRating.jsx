import React, { useEffect, useState } from "react";
import "./StaffRating.css";
import { supabase } from "../../../api/supabaseClient";
import { useAuth } from "../../../context/useAuth";

/* ============================
   ⭐ SVG STAR COMPONENTS
=============================== */

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

const RatingStars = ({ rating }) => {
  if (!rating) rating = 0;

  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="stars">
      {Array(full)
        .fill(0)
        .map((_, i) => (
          <StarSVG key={`f-${i}`} className="svg-full" />
        ))}

      {half && <HalfStarSVG />}

      {Array(empty)
        .fill(0)
        .map((_, i) => (
          <StarSVG key={`e-${i}`} className="svg-empty" />
        ))}
    </div>
  );
};

/* ============================
   ⭐ STAFF RATING PAGE LOGIC
=============================== */

const StaffRating = () => {
  const { auth } = useAuth();
  const managerRestaurant = auth?.restaurant_name;

  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (managerRestaurant) fetchStaffRatings();
  }, [managerRestaurant]);

  const fetchStaffRatings = async () => {
    const { data: ratingsData, error: ratingsErr } = await supabase
      .from("ratings")
      .select(`
        rating_id,
        review_type,
        review_target,
        food_rating,
        delivery_rating,
        customer_id,
        chef_id,
        driver_id,
        restaurant_name
      `)
      .eq("restaurant_name", managerRestaurant);

    if (ratingsErr) {
      console.error(ratingsErr);
      return;
    }

    const involvedIds = [
      ...new Set(
        ratingsData
          .flatMap((r) => [r.customer_id, r.chef_id, r.driver_id])
          .filter(Boolean)
      ),
    ];

    const { data: usersData, error: usersErr } = await supabase
      .from("users")
      .select("user_id, first_name, last_name, role")
      .in("user_id", involvedIds);

    if (usersErr) {
      console.error(usersErr);
      return;
    }

    const ratingMap = {};

    usersData.forEach((u) => {
      ratingMap[u.user_id] = {
        ...u,
        totalReviews: 0,
        allStars: [],
        avgRating: 0,
      };
    });

    ratingsData.forEach((r) => {
      let targetId = null;
      let starValue = null;

      if (r.review_target === "chef") {
        targetId = r.chef_id;
        starValue = r.food_rating ? Number(r.food_rating) : null;
      }

      if (r.review_target === "driver") {
        targetId = r.driver_id;
        starValue = r.delivery_rating ? Number(r.delivery_rating) : null;
      }

      if (r.review_target === "customer") {
        targetId = r.customer_id;
        starValue = r.delivery_rating ? Number(r.delivery_rating) : null;
      }

      if (!targetId || !ratingMap[targetId]) return;

      if (starValue !== null) ratingMap[targetId].allStars.push(starValue);

      if (starValue !== null || r.review_type === "compliment") {
        ratingMap[targetId].totalReviews++;
      }
    });

    const formatted = Object.values(ratingMap).map((u) => {
      const avg =
        u.allStars.length > 0
          ? u.allStars.reduce((a, b) => a + b, 0) / u.allStars.length
          : 0;

      return { ...u, avgRating: Number(avg.toFixed(1)) };
    });

    setStaff(formatted);
  };

  return (
    <div className="staff-rating-dashboard">
      <h2>Staff Ratings</h2>

      <div className="staff-cards">
        {staff.map((s) => (
          <div key={s.user_id} className="staff-card">
            <div className="staff-info">
              <h3 className="staff-name">
                {s.first_name} {s.last_name}
              </h3>
              <span className="staff-role">{s.role.toUpperCase()}</span>
            </div>

            <div className="staff-rating">
              <RatingStars rating={s.avgRating} />
              <span className="rating-number">{s.avgRating}</span>
            </div>

            <p className="total-reviews">
              {s.totalReviews} review{s.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffRating;