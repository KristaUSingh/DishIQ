import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './navbar.css';
import { assets } from '../../assets/assets';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const navigate = useNavigate();

  // Read auth info every render
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.trim().toUpperCase() || null;
  const isLoggedIn = !!token;

  const handleLoginClick = () => navigate('/login');
  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>

      <ul className="navbar-menu">
        {!isLoggedIn && (
          <>
            <li onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</li>
            <li onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</li>
            <li onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</li>
            <li onClick={() => setMenu("contact us")} className={menu === "contact us" ? "active" : ""}>contact us</li>
          </>
        )}

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
            <li onClick={() => navigate('/manager/staffrating')}>Staff Rating</li>
            <li onClick={() => navigate('/manager/finances')}>Restaurant Finances</li>
            <li onClick={() => navigate('/ChefMenu')}>Manage Menu Items</li>
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
