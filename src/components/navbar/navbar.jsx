import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';
import { assets } from '../../assets/assets';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setIsLoggedIn(true);
      setRole(storedRole);
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }

    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");

      if (token && storedRole) {
        setIsLoggedIn(true);
        setRole(storedRole);
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginClick = () => navigate('/login');

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setRole(null);
    window.dispatchEvent(new Event("storage"));
    navigate('/');
  };

  return (
    <div className='navbar'>
      <img src={assets.logo} alt="logo" className="logo" />

      <ul className="navbar-menu">
        {/* Public menu — always show */}
        <li onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</li>
        <li onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</li>
        <li onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</li>
        <li onClick={() => setMenu("contact us")} className={menu === "contact us" ? "active" : ""}>contact us</li>

        {/* Role-specific menu */}
        {isLoggedIn && role === "CHEF" && (
          <>
            <li onClick={() => navigate('/ChefMenu')}>Manage Menu Items</li>
            <li onClick={() => navigate('/feedback')}>View Feedback</li>
            <li onClick={() => navigate('/rating')}>Rating status</li>
          </>
        )}
        {isLoggedIn && role === "MANAGER" && (
          <>
            <li onClick={() => navigate('/manager/user')}>User Registrations</li>
            <li onClick={() => navigate('/manager/complaints')}>Complaints</li>
            <li onClick={() => navigate('/manager/ratings')}>Ratings</li>
            <li onClick={() => navigate('/manager/staff')}>Staff Performance</li>
            <li onClick={() => navigate('/manager/finances')}>Restaurant finances</li>
            <li onClick={() => navigate('/ChefMenu')}>Manage Menu items</li>
          </>
        )}
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
        <div className="navbar-search-icon">
          <img src={assets.basketIcon} alt="basket" />
          <div className="dot"></div>
        </div>

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
