import React, { useState } from "react";
import './UserComplaints.css';

const sampleComplaints = [
  { id: 1, customer: "Nick Johnson", complaint: "Late delivery", date: "2025-11-15", rating: 3.5 },
  { id: 2, customer: "John Wick", complaint: "Wrong order", date: "2025-11-14", rating: 4 },
  { id: 3, customer: "Sofia Sean", complaint: "Food was cold", date: "2025-11-13", rating: 2.5 },
];

const UserComplaints = () => {
  const [responses, setResponses] = useState({});
  const [resolvedComplaints, setResolvedComplaints] = useState([]);

  const handleResponseChange = (id, value) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleResponseSubmit = (id) => {
    alert(`Response sent for complaint ${id}: ${responses[id] || ""}`);
    setResponses(prev => ({ ...prev, [id]: "" }));
  };

  const handleResolve = (id) => {
    if (!resolvedComplaints.includes(id)) {
      setResolvedComplaints([...resolvedComplaints, id]);
    }
  };

  return (
    <div className="user-complaints-dashboard">
      <h2>Customer Complaints</h2>
      <div className="complaint-cards">
        {sampleComplaints.map(c => (
          <div key={c.id} className={`complaint-card ${resolvedComplaints.includes(c.id) ? 'resolved' : ''}`}>
            <div className="complaint-header">
              <span className="customer-name">{c.customer}</span>
              <span className="complaint-date">{c.date}</span>
            </div>
            <p className="complaint-text">{c.complaint}</p>
            <p className="complaint-rating">Rating: {c.rating.toFixed(1)} / 5</p>

            {resolvedComplaints.includes(c.id) ? (
              <span className="resolved-label">Resolved</span>
            ) : (
              <>
                <textarea
                  className="response-input"
                  placeholder="Type your response..."
                  value={responses[c.id] || ""}
                  onChange={(e) => handleResponseChange(c.id, e.target.value)}
                  rows={2}
                />
                <div className="response-buttons">
                  <button className="btn save-btn" onClick={() => handleResponseSubmit(c.id)}>Reply</button>
                  <button className="btn save-btn" onClick={() => handleResolve(c.id)}>Resolve</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserComplaints;
