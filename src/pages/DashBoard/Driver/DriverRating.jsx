import React, { useState } from "react";
import './DriverRating.css';

const sampleReviews = [
  { id: 1, customer: "Alice Johnson", rating: 4.5, comment: "Fast and friendly delivery.", date: "2025-11-15" },
  { id: 2, customer: "Mohamed Ali", rating: 5, comment: "Very punctual and careful with food.", date: "2025-11-14" },
  { id: 3, customer: "Sofia Khan", rating: 3.5, comment: "Good but late by 15 mins.", date: "2025-11-13" },
  { id: 4, customer: "John Smith", rating: 4, comment: "Handled my order well.", date: "2025-11-12" },
];

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

const DriverRating = () => {
  const totalReviews = sampleReviews.length;
  const avgRating = totalReviews
    ? sampleReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : 0;

  return (
    <div className="driver-rating-dashboard">
      <h2>Driver: Alex Johnson</h2>

      <div className="driver-summary">
        <div className="driver-summary-card">
          <h3>Total Reviews</h3>
          <p>{totalReviews}</p>
        </div>
        <div className="driver-summary-card">
          <h3>Average Rating</h3>
          <p>{avgRating.toFixed(1)} / 5</p>
        </div>
      </div>

      <h3>Individual Reviews</h3>
      <div className="review-cards">
        {sampleReviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <span className="customer-name">{r.customer}</span>
              <span className="review-date">{r.date}</span>
            </div>
            <RatingStars rating={r.rating} />
            <p className="review-comment">{r.comment}</p>
            <span className="review-score">{r.rating.toFixed(1)} / 5</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverRating;
