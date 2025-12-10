import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import "./RestaurantMenu.css";
import { StoreContext } from "../../context/StoreContext";

const RestaurantMenu = () => {
  const { restaurantName } = useParams();

  // ⭐ USE GLOBAL CART SYSTEM
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  const [menuCategories, setMenuCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("restaurant_name", restaurantName);

      if (error) {
        console.error("Menu load error:", error);
        setLoading(false);
        return;
      }

      // Group by category
      const grouped = {};
      data.forEach((item) => {
        if (item.name === "Placeholder") return;
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      });

      setMenuCategories(grouped);
      setLoading(false);
    };

    loadMenu();
  }, [restaurantName]);

  if (loading) return <p>Loading menu...</p>;

  return (
    <div className="restaurant-menu-container">
      <h1 className="restaurant-title">{restaurantName} Menu</h1>

      {Object.keys(menuCategories).length === 0 ? (
        <p>No menu items available yet.</p>
      ) : (
        Object.keys(menuCategories).map((category) => (
          <section key={category} className="category-section">
            <h2 className="category-title">{category}</h2>

            <div className="customer-items-list">
              {menuCategories[category].map((item) => (
                <div key={item.dish_id} className="customer-menu-item">
                  <div className="item-text">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">${Number(item.price).toFixed(2)}</p>

                    {/* ⭐ USE GLOBAL CART */}
                    <div className="cart-controls">
                      <button
                        className="cart-btn"
                        onClick={() => removeFromCart(item.dish_id)}
                      >
                        –
                      </button>

                      <span className="quantity">
                        {cartItems[item.dish_id] || 0}
                      </span>

                      <button
                        className="cart-btn"
                        onClick={() => addToCart(item.dish_id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {item.image_url && (
                    <img
                      className="item-image"
                      src={item.image_url}
                      alt={item.name}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default RestaurantMenu;
