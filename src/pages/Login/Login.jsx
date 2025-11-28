import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    let role = null;

    if (username === "chef" && password === "123") {
      role = "CHEF";
      navigate("/chefmenu");
    } else if (username === "manager" && password === "123") {
      role = "MANAGER";
      navigate("/dashboard");
    } else if (username === "driver" && password === "123") {
      role = "DRIVER";
      navigate("/driver/bids");
    } else if (username === "customer" && password === "123") {
      role = "CUSTOMER";
      navigate("/");
    } else {
      alert("Invalid credentials!");
      return;
    }

    localStorage.setItem("token", "dummyToken123");
    localStorage.setItem("role", role);
    window.dispatchEvent(new Event("storage"));
  };

  const handleCreateAccount = () => {
    navigate("/signup");
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
          <button type="submit" className="login-btn">Login</button>
        </form>
        <button 
          className="create-account-btn" 
          onClick={handleCreateAccount}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
