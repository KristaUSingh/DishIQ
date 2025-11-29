
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './navbar.css';
import { supabase } from "../../api/supabaseClient";
import { assets } from '../../assets/assets';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // 🔥 Load Supabase Auth + Role on first render
  useEffect(() => {
    const loadAuthAndRole = async () => {
      // 1. Get logged-in user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setIsLoggedIn(false);
        setRole(null);
        return;
      }

      setIsLoggedIn(true);

      // 2. Fetch role from Supabase "users" table
      const { data: profile, error } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!error && profile?.role) {
        setRole(profile.role.trim());
      }
    };

    loadAuthAndRole();
  }, []);

  // Logout
  const handleLogoutClick = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setRole(null);
    navigate('/');
  };

  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>

      <ul className="navbar-menu">
        {!isLoggedIn && (
          <>
            <li onClick={() => navigate("/")} className={menu === "home" ? "active" : ""}>Home</li>
            <li onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Restaurants</li>
            <li onClick={() => setMenu("contact us")} className={menu === "contact us" ? "active" : ""}>Contact Us</li>
          </>
        )}

        {/* CHEF ROUTES */}
        {isLoggedIn && role === "chef" && (
          <>
            <li onClick={() => navigate('/ChefMenu')}>Manage Menu Items</li>
            <li onClick={() => navigate('/feedback')}>View Feedback</li>
            <li onClick={() => navigate('/rating')}>Rating status</li>
          </>
        )}

        {/* MANAGER ROUTES */}
        {isLoggedIn && role === "manager" && (
          <>
            <li onClick={() => navigate('/manager/user')}>User Registrations</li>
            <li onClick={() => navigate('/manager/complaints')}>Complaints</li>
            <li onClick={() => navigate('/manager/staffrating')}>Staff Rating</li>
            <li onClick={() => navigate('/manager/finances')}>Restaurant Finances</li>
            <li onClick={() => navigate('/ChefMenu')}>Manage Menu Items</li>
          </>
        )}

        {/* DRIVER ROUTES */}
        {isLoggedIn && role === "delivery_person" && (
          <>
            <li onClick={() => navigate('/driver/bids')}>Bid Deliveries</li>
            <li onClick={() => navigate('/driver/transport')}>Transport Orders</li>
            <li onClick={() => navigate('/driver/ratings')}>Delivery Ratings</li>
          </>
        )}
      </ul>

      <div className="navbar-right">
        <Link to="/cart" className="navbar-search-icon">
          <img src={assets.basketIcon} alt="cart" />
          <div className="dot"></div>
        </Link>

        {!isLoggedIn ? (
          <button onClick={() => navigate('/login')}>Login</button>
        ) : (
          <button onClick={handleLogoutClick}>Logout</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
