import { createContext, useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [menuItems, setMenuItems] = useState([]); // REAL menu from Supabase
  const [cartItems, setCartItems] = useState({}); // dish_id → quantity

  // ================================
  // LOAD MENU ITEMS FROM SUPABASE
  // ================================
  useEffect(() => {
    const loadMenuItems = async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("*");

      if (error) {
        console.error("Supabase menu load error:", error);
        return;
      }

      setMenuItems(data || []);
    };

    loadMenuItems();
  }, []);

  // ================================
  // ADD TO CART
  // ================================
  const addToCart = (dishId) => {
    setCartItems((prev) => {
      const currentQty = prev[dishId] || 0;
      return { ...prev, [dishId]: currentQty + 1 };
    });
  };

  // ================================
  // REMOVE FROM CART
  // ================================
  const removeFromCart = (dishId) => {
    setCartItems((prev) => {
      if (!prev[dishId]) return prev;

      const updatedQty = prev[dishId] - 1;

      return updatedQty > 0
        ? { ...prev, [dishId]: updatedQty }
        : { ...prev, [dishId]: 0 };
    });
  };

  // ================================
  // CART TOTAL
  // ================================
  const getTotalCartAmount = () => {
    let total = 0;

    for (const dishId in cartItems) {
      const item = menuItems.find((i) => i.dish_id === Number(dishId));

      if (item) {
        total += item.price * cartItems[dishId];
      }
    }

    return total;
  };

  const contextValue = {
    menuItems,       // <-- use this instead of food_list
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;