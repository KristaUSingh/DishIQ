import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../api/supabaseClient";
import "./Signup.css";

function Signup() {
  const { handleSubmit } = useForm();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [restaurant, setRestaurant] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const restaurantOptions = [
    "Chilaca",
    "Citizen Chicken",
    "Da Brix",
  ];

  const test_password = (value) => {
    const newErrors = [];
    if (value.length < 8) newErrors.push("At least 8 characters");
    if (!/[A-Z]/.test(value)) newErrors.push("At least one uppercase letter");
    if (!/[a-z]/.test(value)) newErrors.push("At least one lowercase letter");
    if (!/[0-9]/.test(value)) newErrors.push("At least one number");
    if (!/[!@#$%^&*]/.test(value))
      newErrors.push("At least one special character (!@#$%^&*)");
    return newErrors;
  };

  const onSubmit = async () => {
    setError("");
    setSuccess("");

    // Password rules
    const check_password = test_password(password);
    if (check_password.length > 0) {
      setError("Password must include: " + check_password.join(", "));
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords must match.");
      return;
    }

    // If chef/manager, restaurant required
    if ((role === "chef" || role === "manager") && !restaurant) {
      setError("Please select a restaurant.");
      return;
    }

    try {
      // 1️⃣ Supabase Auth Signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: "http://localhost:5173/login" },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        let salary = null;

        if (role === "chef") salary = 70000;
        if (role === "delivery_person") salary = 50000;
        if (role === "manager") salary = 100000;

        // 2️⃣ Insert into your Supabase "users" table
        const { error: dbError } = await supabase.from("users").insert([
          {
            email,
            user_id: data.user.id,
            role,
            salary,
            first_name: firstName,
            last_name: lastName,
            restaurant_name:
              role === "chef" || role === "manager" ? restaurant : null,
          },
        ]);

        if (dbError?.code === "23505") {
          setError("Account already exists. Login or reset password.");
          return;
        }
        if (dbError) throw dbError;
      }

      setSuccess("Signup successful! Please check your email to verify your account.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Something went wrong during signup.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Account</h1>

        {error && <p className="alert">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="text"
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm_password}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* ROLE SELECT */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="role-select"
          >
            <option value="customer">Customer</option>
            <option value="delivery_person">Driver</option>
            <option value="manager">Manager</option>
            <option value="chef">Chef</option>
          </select>

          {/* RESTAURANT SELECT — ONLY CHEF OR MANAGER */}
          {(role === "chef" || role === "manager") && (
            <select
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="restaurant-select"
              required
            >
              <option value="">Select Restaurant</option>
              {restaurantOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
