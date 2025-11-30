import React, { useContext } from "react";
import "./FoodItem.css";
import { useAuth } from "../../../context/useAuth";
import { StoreContext } from "../../../context/StoreContext";

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "C";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "C";
  return (
    (parts[0][0]?.toUpperCase() || "") +
    (parts[1][0]?.toUpperCase() || "")
  );
};

const FoodItem = ({ item }) => {
  const { auth } = useAuth();
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  const isChef = item.isChefCard === true;

  const imageSrc = item.image_url || item.image || item.img || "";

  // ⭐ rating logic (no default)
  const rating = item.rating;
  const fullStars = rating != null ? Math.floor(rating) : 0;
  const halfStar = rating != null ? rating % 1 !== 0 : false;
  const emptyStars = rating != null ? 5 - fullStars - (halfStar ? 1 : 0) : 0;  

  const FullStar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#259f4c">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 
               12 18.77 5.82 22 7 14.14l-5-4.87 
               6.91-1.01L12 2z" />
    </svg>
  );

  const EmptyStar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 
               12 18.77 5.82 22 7 14.14l-5-4.87 
               6.91-1.01L12 2z" />
    </svg>
  );

  const HalfStar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="halfGrad">
          <stop offset="50%" stopColor="#259f4c" />
          <stop offset="50%" stopColor="#ccc" />
        </linearGradient>
      </defs>
      <path fill="url(#halfGrad)" stroke="#ccc" strokeWidth="1.5"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 
           12 18.77 5.82 22 7 14.14l-5-4.87 
           6.91-1.01L12 2z" />
    </svg>
  );

  const quantity = cartItems[item.dish_id] || 0;

  const handleAddClick = () => {
    if (!auth?.isLoggedIn) {
      alert("Please log in to add items to your cart.");
      return;
    }
    addToCart(item.dish_id);
  };

  return (
    <div className="food-item">
      <div className="food-item-image-wrapper">

        {isChef ? (
          <div className="chef-avatar">{getInitials(item.name)}</div>
        ) : (
          <img src={imageSrc} alt={item.name} className="food-item-image" />
        )}

        {!isChef && (
          <>
            {quantity === 0 ? (
              <button className="add-btn" onClick={handleAddClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            ) : (
              <div className="counter-wrapper">
                <button className="counter-btn" onClick={() => removeFromCart(item.dish_id)}>
                  –
                </button>
                <span className="counter-qty">{quantity}</span>
                <button className="counter-btn" onClick={() => addToCart(item.dish_id)}>
                  +
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="food-item-info">
        <p className="food-item-name">{item.name}</p>

        {item.restaurant_name && (
          <p className="restaurant-label">
            From {item.restaurant_name}
          </p>
        )}

        {/* ⭐ only show rating when rating exists */}
        {rating !== null && rating !== undefined && (
          <div className="food-item-rating">
            {[...Array(fullStars)].map((_, i) => <FullStar key={"f" + i} />)}
            {halfStar && <HalfStar />}
            {[...Array(emptyStars)].map((_, i) => <EmptyStar key={"e" + i} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodItem;