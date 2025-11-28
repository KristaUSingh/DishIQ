import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient"; 
import './Login.css';


function Login({}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in with Supabase Auth
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

      // Fetch user info from your 'users' table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (userError || !userData) {
        setError("Unable to find user information. Please contact support.");
        return;
      }

      // Save to sessionStorage
      sessionStorage.setItem(
        "auth",
        JSON.stringify({
          isLoggedIn: true,
          role: userData.role,
          firstName: userData.first_name,
          lastName: userData.last_name,
        })
      );

      
      switch (userData.role) {
        case "customer":
          navigate("/");
          break;
        case "delivery_person":
          navigate("/Driver/transport");
          break;
        case "chef":
          navigate("/ChefMenu");
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

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
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

export default Login;
