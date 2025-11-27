import React from "react";
import './UserComplaints.css';

const sampleComplaints = [
  { id: 1, customer: "nick johnson", complaint: "Late delivery", date: "2025-11-15", rating: 3.5 },
  { id: 2, customer: "John whick", complaint: "Wrong order", date: "2025-11-14", rating: 4 },
  { id: 3, customer: "Sofia sean", complaint: "Food was cold", date: "2025-11-13", rating: 2.5 },
];

const UserComplaints = () => {
  return (
    <div className="user-complaints-dashboard">
      <h2>Customer Complaints</h2>
      <div className="complaint-cards">
        {sampleComplaints.map(c => (
          <div key={c.id} className="complaint-card">
            <div className="complaint-header">
              <span className="customer-name">{c.customer}</span>
              <span className="complaint-date">{c.date}</span>
            </div>
            <p className="complaint-text">{c.complaint}</p>
            <p className="complaint-rating">Rating: {c.rating.toFixed(1)} / 5</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserComplaints;
