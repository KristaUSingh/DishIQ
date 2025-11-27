import React from "react";
import './StaffRating.css';

// Sample data for staff ratings
const staffRatings = [
  { id: 1, name: "Alice Johnson", role: "CHEF", rating: 4.5, totalReviews: 12 },
  { id: 2, name: "Mohamed Ali", role: "CHEF", rating: 4.8, totalReviews: 20 },
  { id: 3, name: "Sofia Khan", role: "MANAGER", rating: 4.2, totalReviews: 8 },
  { id: 4, name: "Nick Brown", role: "CHEF", rating: 3.9, totalReviews: 5 },
];

// Reusable component to show stars
const RatingStars = ({ rating, maxRating = 5 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="stars">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="star full">★</span>)}
      {halfStar && <span className="star half">★</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="star empty">☆</span>)}
    </div>
  );
};

const StaffRating = () => {
  return (
    <div className="staff-rating-dashboard">
      <h2>Staff Ratings</h2>
      <div className="staff-cards">
        {staffRatings.map(staff => (
          <div key={staff.id} className="staff-card">
            <div className="staff-info">
              <h3 className="staff-name">{staff.name}</h3>
              <span className="staff-role">{staff.role}</span>
            </div>
            <div className="staff-rating">
              <RatingStars rating={staff.rating} />
              <span className="rating-number">{staff.rating.toFixed(1)}</span>
            </div>
            <p className="total-reviews">{staff.totalReviews} review{staff.totalReviews !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffRating;
