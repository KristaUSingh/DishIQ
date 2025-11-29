import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './navbar.css';
import { supabase } from "../../api/supabaseClient";
import { assets } from '../../assets/assets';
import { useAuth } from "../../context/useAuth";
import { StoreContext } from "../../context/StoreContext";
import { FiShoppingCart } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const { cartItems } = useContext(StoreContext);

  const isLoggedIn = auth?.isLoggedIn || false;
  const role = auth?.role || null;

  // ---- LIVE CART COUNT ----
  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const handleLogoutClick = async () => {
    await supabase.auth.signOut();
    setAuth(null);
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
            <li onClick={() => navigate("/order-history")}>Order History</li>
            <li onClick={() => navigate("/contact")}>Contact Us</li>
          </>
        )}

        {isLoggedIn && role === "chef" && (
          <>
            <li onClick={() => navigate('/chef/menu')}>Manage Menu</li>
            <li onClick={() => navigate('/chef/orders')}>Orders</li>
            <li onClick={() => navigate('/chef/feedback')}>Feedback</li>
            <li onClick={() => navigate('/chef/rating')}>Rating</li>
          </>
        )}

        {isLoggedIn && role === "manager" && (
          <>
            <li onClick={() => navigate('/manager/user')}>User Registrations</li>
            <li onClick={() => navigate('/manager/manage-bids')}>Manage Bids</li>
            <li onClick={() => navigate('/manager/complaints')}>Complaints</li>
            <li onClick={() => navigate('/manager/staffrating')}>Staff Rating</li>
            <li onClick={() => navigate('/manager/finances')}>Finances</li>
          </>
        )}

        {isLoggedIn && role === "delivery_person" && (
          <>
            <li onClick={() => navigate('/driver/bids')}>Bid Deliveries</li>
            <li onClick={() => navigate('/driver/transport')}>Transport Orders</li>
            <li onClick={() => navigate('/driver/ratings')}>Delivery Ratings</li>
          </>
        )}

      </ul>

      <div className="navbar-right">

        {/* ---- CUSTOMER CART ICON ---- */}
        {isLoggedIn && role === "customer" && (
          <Link to="/cart" className="navbar-cart-icon">
            <FiShoppingCart size={26} />

            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>
        )}

        {!isLoggedIn ? (
          <button className="nav-auth-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        ) : (
          <button className="nav-auth-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        )}

      </div>
    </div>
  );
};

export default Navbar;