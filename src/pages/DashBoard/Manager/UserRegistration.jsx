import React from "react";
import './UserRegistration.css';

const sampleUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "CHEF" },
  { id: 2, name: "Mohamed Ali", email: "mohamed@example.com", role: "CHEF" },
  { id: 3, name: "Sofia Khan", email: "sofia@example.com", role: "MANAGER" },
];

const UserRegistrations = () => {
  return (
    <div className="user-dashboard-container">
      <h2>User Registrations</h2>
      <div className="user-cards">
        {sampleUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              <span>{user.name.charAt(0)}</span>
            </div>
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRegistrations;
