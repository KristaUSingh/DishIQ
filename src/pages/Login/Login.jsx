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
    if (username === "chef" && password === "123") {
      navigate("/ChefDashboard");
    } else if (username === "manager" && password === "123") {
      navigate("/ManagerDashboard");
    } else if (username === "delivery" && password === "123") {
      navigate("/DriverDashboard");
    } else {
      alert("Invalid credentials!");
    }
  };

  return(
  <div className="login-container">
    <div className="login-card">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  </div>
  );
}
