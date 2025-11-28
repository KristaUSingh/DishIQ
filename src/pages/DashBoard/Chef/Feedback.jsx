import React, { useState } from "react";
import './Feedback.css';

const sampleFeedback = [
  {
    id: 1,
    name: "Alice Johnson",
    dish: "Spicy Chicken Burger",
    rating: 4.5,
    comment: "Absolutely delicious! The food are all perfectly spiced.",
    date: "2025-11-15"
  },
  {
    id: 2,
    name: "Mohamed Ali",
    dish: "Classic Cheeseburger",
    rating: 5,
    comment: "Best burger I've had in years. Highly recommend!",
    date: "2025-11-14"
  },
  {
    id: 3,
    name: "Sofia Khan",
    dish: "Veggie Pizza",
    rating: 3.5,
    comment: "Good flavors, but portion could be bigger.",
    date: "2025-11-13"
  }
];

const Stars = ({ rating, maxRating = 5 }) => {
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

const Feedback = () => {
  const [responses, setResponses] = useState({});

  const handleResponseChange = (id, value) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleResponseSubmit = (id) => {
    alert(`Response submitted for review ${id}: ${responses[id]}`);
    setResponses(prev => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Customer Feedback</h2>
      <div className="feedback-list">
        {sampleFeedback.map(fb => (
          <div key={fb.id} className="feedback-card">
            <div className="feedback-header">
              <span className="feedback-name">{fb.name}</span>
              <Stars rating={fb.rating} />
              <span className="feedback-date">{fb.date}</span>
            </div>

            {/* Dish name */}
            <p className="feedback-dish"><strong>Dish:</strong> {fb.dish}</p>

            <p className="feedback-comment">{fb.comment}</p>

            <div className="response-section">
              <input
                type="text"
                placeholder="Type your response..."
                value={responses[fb.id] || ""}
                onChange={(e) => handleResponseChange(fb.id, e.target.value)}
                className="response-input"
              />
              <button
                className="btn response-btn"
                onClick={() => handleResponseSubmit(fb.id)}
              >
                Respond
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
