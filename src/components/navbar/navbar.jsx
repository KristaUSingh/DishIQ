import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';
import { assets } from '../../assets/assets';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token'); 
      setIsLoggedIn(!!token); 
    };

    checkLogin();

    window.addEventListener('storage', checkLogin);

    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('role');   
    setIsLoggedIn(false);              
    navigate('/');                      // redirect to homepage
  };

  return (
    <div className='navbar'>
      <img src={assets.logo} alt="" className="logo" />
      <ul className="navbar-menu">
        <li onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</li>
        <li onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</li>
        <li onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</li>
        <li onClick={() => setMenu("contact us")} className={menu === "contact us" ? "active" : ""}>contact us</li>
      </ul>

      <div className="navbar-right">
        <img src={assets.searchIcon} alt="" />
        <div className="navbar-search-icon">
          <img src={assets.basketIcon} alt="" />
          <div className="dot"></div>
        </div>

        {isLoggedIn ? (
          <button onClick={handleLogoutClick}>Logout</button>
        ) : (
          <button onClick={handleLoginClick}>Login</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
