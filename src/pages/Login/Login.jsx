import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // 🔹 Dummy login logic
    let role = null;

    if (username === "chef" && password === "123") {
      role = "CHEF";
      navigate("/ChefDashboard");
    } else if (username === "manager" && password === "123") {
      role = "MANAGER";
      navigate("/ManagerDashboard");
    } else if (username === "delivery" && password === "123") {
      role = "DRIVER";
      navigate("/DriverDashboard");
    } else {
      alert("Invalid credentials!");
      return;
    }

    // 🔹 Save token and role to localStorage
    localStorage.setItem("token", "dummyToken123"); // can be any string
    localStorage.setItem("role", role);

    // 🔹 Trigger Navbar update (if listening to storage events)
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
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
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
