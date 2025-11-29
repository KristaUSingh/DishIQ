import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../api/supabaseClient";
import { useAuth } from "../context/useAuth";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState({});

  const { auth } = useAuth(); // ⬅️ current logged-in user

  // Load menu items once
  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from("menus").select("*");
      if (!error) setMenuItems(data);
    };
    fetchMenu();
  }, []);

  // ------------------------------------------
  // ADD TO CART (CUSTOMER ONLY)
  // ------------------------------------------
  const addToCart = (itemId) => {
    // If not logged in at all
    if (!auth) {
      alert("You must be logged in as a customer to add items to your cart.");
      return;
    }

    // If logged in but NOT a customer
    if (auth.role !== "customer") {
      alert("Only customers can place orders.");
      return;
    }

    // Otherwise add item normally
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  // REMOVE (never below 0)
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

  // TOTAL PRICE
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
