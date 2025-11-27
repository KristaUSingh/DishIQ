import React from "react";
import PropTypes from "prop-types";
import './Rating.css';

const sampleReviews = [
  { id: 1, rating: 4.5 },
  { id: 2, rating: 5 },
  { id: 3, rating: 3.5 },
  { id: 4, rating: 4 },
  { id: 5, rating: 4.8 }
];

const RatingStars = ({ rating, maxRating = 5 }) => {
  const safeRating = Math.min(Math.max(Number(rating) || 0, 0), maxRating);
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating - fullStars >= 0.5;
  const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="stars">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star full">★</span>
      ))}
      {halfStar && <span className="star half">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="star empty">☆</span>
      ))}
    </div>
  );
};

RatingStars.propTypes = {
  rating: PropTypes.number.isRequired,
  maxRating: PropTypes.number,
};

const Rating = () => {
  const totalReviews = sampleReviews.length;
  const avgRating = totalReviews
    ? sampleReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : 0;

  // Rewards or penalties logic
  let rewardMessage = "";
  if (avgRating >= 4.5) {
    rewardMessage = "Excellent! You earns a reward 🎉";
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

      <p className="review-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>

      {/* Rewards / penalties message */}
      <p className="reward-message">{rewardMessage}</p>

      <div className="reviews-list">
        {sampleReviews.map(review => (
          <div key={review.id} className="review-box">
            <RatingStars rating={review.rating} />
            <span className="individual-rating">{review.rating.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rating;
