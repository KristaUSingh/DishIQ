import { createContext, useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useAuth } from "../context/useAuth";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [finalTotal, setFinalTotal] = useState(null);

  // Delivery is a flat $2 as requested
  const [delivery, setDelivery] = useState(2);

  // Balance state
  const [userBalance, setUserBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const { auth } = useAuth(); // expected to contain auth.customer_id

  // Load menu items once
  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from("menus").select("*");
      if (!error && data) setMenuItems(data);
    };
    fetchMenu();
  }, []);

  // Fetch user's balance when auth changes (or initially)
  useEffect(() => {
    const fetchBalance = async () => {
      if (!auth?.customer_id) {
        setUserBalance(0);
        return;
      }

      setBalanceLoading(true);
      try {
        const { data, error } = await supabase
          .from("finance")
          .select("balance")
          .eq("customer_id", auth.customer_id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching balance:", error);
          setUserBalance(0);
          setBalanceLoading(false);
          return;
        }

        const bal = Number(data?.balance ?? 0);
        setUserBalance(bal);
      } catch (err) {
        console.error("Unexpected error fetching balance:", err);
        setUserBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [auth]);

  // ------------------------------------------
  // CART HANDLERS
  // ------------------------------------------
  const addToCart = (itemId) => {
    if (!auth) {
      alert("You must be logged in as a customer to add items to your cart.");
      return;
    }
    if (auth.role !== "customer") {
      alert("Only customers can place orders.");
      return;
    }
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

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

  const deleteFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const clearCart = () => setCartItems({});

  // TOTAL PRICE
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const item = menuItems.find((m) => m.dish_id === Number(itemId));
      if (item) total += item.price * cartItems[itemId];
    }
    return Number(total);
  };

  // ------------------------------------------
  // BALANCE HANDLERS (Supabase)
  // ------------------------------------------
  /**
   * Deducts `amount` from the user's balance in Supabase and optionally increments counters.
   * - amount: number (dollars, e.g., 12.34)
   * - opts: { incrementOrders?: number, addTotalSpent?: number }
   *
   * Returns { success: boolean, message: string, updated?: object }
   */
  const deductBalance = async (amount, opts = {}) => {
    if (!auth?.customer_id) {
      return { success: false, message: "User not authenticated." };
    }

    const amt = Number(Number(amount).toFixed(2));
    if (isNaN(amt) || amt <= 0) {
      return { success: false, message: "Invalid amount to deduct." };
    }

    try {
      // Fetch current finance row (balance, num_orders, total_spent)
      const { data: financeRow, error: fetchErr } = await supabase
        .from("finance")
        .select("balance, num_orders, total_spent")
        .eq("customer_id", auth.customer_id)
        .single();

      if (fetchErr && fetchErr.code !== "PGRST116") {
        console.error("Error fetching finance row:", fetchErr);
        return { success: false, message: "Failed to fetch finance row." };
      }

      const currentBalance = Number(financeRow?.balance ?? userBalance ?? 0);
      const currentNumOrders = Number(financeRow?.num_orders ?? 0);
      const currentTotalSpent = Number(financeRow?.total_spent ?? 0);

      if (currentBalance < amt) {
        return { success: false, message: "Insufficient balance." };
      }

      const newBalance = Number((currentBalance - amt).toFixed(2));

      // Compute new num_orders and total_spent if requested
      const incrementOrders = Number(opts.incrementOrders ?? 0);
      const addTotalSpent = Number(Number(opts.addTotalSpent ?? 0).toFixed(2));

      const updatePayload = {
        balance: newBalance,
      };

      if (incrementOrders) updatePayload.num_orders = currentNumOrders + incrementOrders;
      if (addTotalSpent) updatePayload.total_spent = Number((currentTotalSpent + addTotalSpent).toFixed(2));

      // Update finance row atomically (single update)
      const { data: updatedRow, error: updateErr } = await supabase
        .from("finance")
        .update(updatePayload)
        .eq("customer_id", auth.customer_id)
        .select()
        .single();

      if (updateErr) {
        console.error("Error updating finance:", updateErr);
        return { success: false, message: "Failed to update finance." };
      }

      // Update local context balance
      setUserBalance(Number(updatedRow?.balance ?? newBalance));

      return { success: true, message: "Balance updated.", updated: updatedRow };
    } catch (err) {
      console.error("Unexpected error in deductBalance:", err);
      return { success: false, message: "Unexpected error while deducting." };
    }
  };

  // Force-refresh balance
  const refreshBalance = async () => {
    if (!auth?.customer_id) return;
    try {
      const { data, error } = await supabase
        .from("finance")
        .select("balance")
        .eq("customer_id", auth.customer_id)
        .single();

      if (!error) setUserBalance(Number(data?.balance ?? 0));
    } catch (err) {
      console.error("refreshBalance error:", err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        menuItems,
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        getTotalCartAmount,
        finalTotal,
        setFinalTotal,
        delivery,
        setDelivery,
        userBalance,
        setUserBalance,
        balanceLoading,
        deductBalance,
        refreshBalance,
      }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
