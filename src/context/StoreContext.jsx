import { createContext, useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [menuItems, setMenuItems] = useState([]); // items from Supabase
  const [cartItems, setCartItems] = useState({});

  // Load all menu items once
  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from("menus").select("*");
      if (!error) setMenuItems(data);
    };
    fetchMenu();
  }, []);

  // ADD
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  // REMOVE ↓ (never below 0)
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  // DELETE ENTIRE ROW
  const deleteFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  // TOTAL
  const getTotalCartAmount = () => {
    let total = 0;

    for (const itemId in cartItems) {
      const item = menuItems.find((m) => m.dish_id === Number(itemId));
      if (item) total += item.price * cartItems[itemId];
    }

    return total;
  };

  return (
    <StoreContext.Provider
      value={{
        menuItems,
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        getTotalCartAmount,
      }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
