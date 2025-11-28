import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../api/supabaseClient";
import './Signup.css';

function Signup() {
  const { handleSubmit } = useForm();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    const check_password = test_password(password);
    if (check_password.length > 0) {
      setError("Password must include: " + check_password.join(", "));
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords must match.");
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: "http://localhost:5173/login" },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        let salary = null;

        if (role == "chef") salary = 70000;
        if (role == "delivery_person") salary = 50000;
        if (role == "manager") salary = 100000;

        const { error: dbError } = await supabase.from("users").insert([
          {
            email,
            user_id: data.user.id,
            role,
            salary,
            first_name: firstName,
            last_name: lastName
          },
        ]);

        //compares with the postgre code 23505 if the account already exists
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

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <form onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}>
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

          {/* /* { {["chef", "delivery_person", "manager"].includes(role) && (
          <select 
            value={restaurant} 
            onChange={(e) => setRestaurant(e.target.value)}
            className="restaurant-select"
          >
            <option value="chilaca">Chilaca</option>
            <option value="Citizen_Chicken">Citizen Chicken</option>
            <option value="">Da Brix</option>
            <option value="">Chef</option>
          </select>
        )} } */ }

          <button type="submit" className="signup-btn">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;

