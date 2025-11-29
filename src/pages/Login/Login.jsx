import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../context/useAuth";   // ✅ FIX
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();   // ✅ FIX

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Incorrect email or password.");
        return;
      }

      const user = data?.user;

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // ✅ Save user globally
      setAuth({
        isLoggedIn: true,
        role: profile.role,
        firstName: profile.first_name,
        lastName: profile.last_name,
        restaurant_name: profile.restaurant_name,
        user_id: user.id
      });

      // Redirect
      switch (profile.role) {
        case "customer": navigate("/"); break;
        case "delivery_person": navigate("/driver/bids"); break;
        case "chef": navigate("/chef/menu"); break;
        case "manager": navigate("/manager/user"); break;
      }

    } catch (err) {
      setError("Something went wrong.");
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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <button 
          className="create-account-btn" 
          onClick={() => navigate("/signup")}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;
