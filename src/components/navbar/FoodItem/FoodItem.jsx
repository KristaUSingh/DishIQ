import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../../assets/assets";
import { StoreContext } from "../../../context/StoreContext";

const FoodItem = ({ item }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  // Support both Supabase items and old items
  const itemId = item.dish_id || item._id;
  const itemImage = item.image_url || item.image;

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={itemImage} alt={item.name} />

        {!cartItems[itemId] ? (
          <img
            className="add"
            onClick={() => addToCart(itemId)}
            src={assets.add_icon_white}
            alt=""
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(itemId)}
              src={assets.remove_icon_red}
              alt=""
            />
            <p>{cartItems[itemId]}</p>
            <img
              onClick={() => addToCart(itemId)}
              src={assets.add_icon_green}
              alt=""
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{item.name}</p>
          <img src={assets.rating_stars} alt="rating" />
        </div>

        <p className="food-item-price">${item.price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
