import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Signup.css';

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER"); // default role
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword || !role) {
      alert("Please fill in all fields!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Save user role and token (dummy)
    localStorage.setItem("token", "dummyToken123");
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);

    // Trigger Navbar update
    window.dispatchEvent(new Event("storage"));

    // Navigate to home page
    navigate("/");
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Account</h1>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="role-select"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="DRIVER">Driver</option>
            <option value="MANAGER">Manager</option>
            <option value="CHEF">Chef</option>
          </select>
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
