import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './navbar.css';
import { supabase } from "../../api/supabaseClient";
import { assets } from '../../assets/assets';
import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const isLoggedIn = auth?.isLoggedIn || false;
  const role = auth?.role || null;

  const handleLogoutClick = async () => {
    await supabase.auth.signOut();

    // Clear global auth state
    setAuth(null);

    // Clear local storage backup
    localStorage.removeItem("auth");

    navigate('/');
  };

  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>

      <ul className="navbar-menu">

        {!isLoggedIn && (
          <>
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/restaurants")}>Restaurants</li>
            <li onClick={() => navigate("/contact")}>Contact Us</li>
          </>
        )}

        {isLoggedIn && role === "customer" && (
          <>
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/restaurants")}>Restaurants</li>
            <li onClick={() => navigate("/contact")}>Contact Us</li>
          </>
        )}

        {/* CHEF MENU */}
        {isLoggedIn && role === "chef" && (
          <>
            <li onClick={() => navigate('/chef/menu')}>Manage Menu</li>
            <li onClick={() => navigate('/chef/orders')}>Orders</li>
            <li onClick={() => navigate('/feedback')}>Feedback</li>
            <li onClick={() => navigate('/rating')}>Rating</li>
          </>
        )}

        {/* MANAGER MENU */}
        {isLoggedIn && role === "manager" && (
          <>
            <li onClick={() => navigate('/manager/user')}>User Registrations</li>
            <li onClick={() => navigate('/manager/manage-bids')}>Manage Bids</li>
            <li onClick={() => navigate('/manager/complaints')}>Complaints</li>
            <li onClick={() => navigate('/manager/staffrating')}>Staff Rating</li>
            <li onClick={() => navigate('/manager/finances')}>Finances</li>
          </>
        )}

        {/* DRIVER MENU */}
        {isLoggedIn && role === "delivery_person" && (
          <>
            <li onClick={() => navigate('/driver/bids')}>Bid Deliveries</li>
            <li onClick={() => navigate('/driver/transport')}>Transport Orders</li>
            <li onClick={() => navigate('/driver/ratings')}>Delivery Ratings</li>
          </>
        )}

      </ul>

      <div className="navbar-right">
        {isLoggedIn && (
          <Link to="/cart" className="navbar-search-icon">
            <img src={assets.basketIcon} alt="cart" />
            <div className="dot"></div>
          </Link>
        )}

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
