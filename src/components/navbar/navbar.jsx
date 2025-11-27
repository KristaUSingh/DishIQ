import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './navbar.css';
import { assets } from '../../assets/assets';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // 🔥 FIX: Always read latest auth data
  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");

      setIsLoggedIn(!!token);
      setRole(storedRole ? storedRole.trim() : null);
    };

    // Run at mount
    updateAuth();

    // Listen for manual dispatches (from login/logout)
    window.addEventListener("authChange", updateAuth);

    return () => {
      window.removeEventListener("authChange", updateAuth);
    };
  }, []);

  const handleLoginClick = () => navigate('/login');

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    setIsLoggedIn(false);
    setRole(null);

    window.dispatchEvent(new Event("authChange"));

    navigate('/');
  };

  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>

      <ul className="navbar-menu">
        <li onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</li>
        <li onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</li>
        <li onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</li>
        <li onClick={() => setMenu("contact us")} className={menu === "contact us" ? "active" : ""}>contact us</li>

        {/* ⭐ CHEF MENU */}
        {isLoggedIn && role === "CHEF" && (
          <>
            <li onClick={() => navigate('/ChefMenu')}>Manage Menu Items</li>
            <li onClick={() => navigate('/feedback')}>View Feedback</li>
            <li onClick={() => navigate('/rating')}>Rating status</li>
          </>
        )}

        {/* ⭐ MANAGER MENU */}
        {isLoggedIn && role === "MANAGER" && (
          <>
            <li onClick={() => navigate('/manager/user')}>User Registrations</li>
            <li onClick={() => navigate('/manager/complaints')}>Complaints</li>
            <li onClick={() => navigate('/manager/ratings')}>Ratings</li>
            <li onClick={() => navigate('/manager/staff')}>Staff Performance</li>
            <li onClick={() => navigate('/manager/finances')}>Restaurant Finances</li>
            <li onClick={() => navigate('/ChefMenu')}>Manage Menu Items</li>
          </>
        )}

        {/* ⭐ DRIVER MENU */}
        {isLoggedIn && role === "DRIVER" && (
          <>
            <li onClick={() => navigate('/driver/bids')}>Bid Deliveries</li>
            <li onClick={() => navigate('/driver/transport')}>Transport Orders</li>
            <li onClick={() => navigate('/driver/ratings')}>Delivery Ratings</li>
          </>
        )}
      </ul>

      <div className="navbar-right">
        <img src={assets.searchIcon} alt="search" />

        <Link to="/cart" className="navbar-search-icon">
          <img src={assets.basketIcon} alt="cart" />
          <div className="dot"></div>
        </Link>

        {!isLoggedIn ? (
          <button onClick={handleLoginClick}>Login</button>
        ) : (
          <button onClick={handleLogoutClick}>Logout</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;

