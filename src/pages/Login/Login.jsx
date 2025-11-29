import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../context/AuthContext"; 
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();   // <-- SAVE GLOBAL AUTH HERE

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.status === 400 && signInError.message.includes("email")) {
          setError("Your email isn’t verified. Please check your inbox.");
          return;
        }

        setError("Incorrect email or password.");
        return;
      }

      const user = data.user;

      if (!user) {
        setError("Login failed. Please try again.");
        return;
      }

      // Fetch user profile from "users" table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, first_name, last_name, restaurant_name")
        .eq("user_id", user.id)
        .single();

      if (userError || !userData) {
        setError("Unable to find user information. Please contact support.");
        return;
      }

      // Save user to AuthContext (auto-persist)
      setAuth({
        isLoggedIn: true,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name,
        restaurant_name: userData.restaurant_name || null,
        user_id: user.id,
      });

      // Redirect based on role
      switch (userData.role) {
        case "customer":
          navigate("/");
          break;
        case "delivery_person":
          navigate("/driver/bids");
          break;
        case "chef":
          navigate("/chef/menu");
          break;
        case "manager":
          navigate("/manager/user");
          break;
        default:
          setError("Unknown role. Please contact support.");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong during login.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        {error && <p className="alert">{error}</p>}

        <form onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">Login</button>
        </form>

        <button className="create-account-btn" onClick={() => navigate("/signup")}>
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;
