import React, { useContext, useState, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../api/supabaseClient";

const Cart = () => {
  const {
    cartItems,
    menuItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    getTotalCartAmount,
    finalTotal,
    setFinalTotal,
    delivery,
    setDelivery
  } = useContext(StoreContext);

  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const auth = JSON.parse(localStorage.getItem("auth"));
  const isVip = auth?.vip_flag === true;

  const { setAuth } = useAuth();

  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [find_delivery, global_delivery] = useState(0);

  // ------------------------------
  // FETCH USER BALANCE FROM FINANCE TABLE
  // ------------------------------
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from("finance")
        .select("balance")
        .eq("customer_id", auth.user_id)
        .single();

      if (!error && data) {
        setBalance(data.balance ?? 0);
      }
    };

    fetchBalance();
  }, [auth]);

  // Compute new balance after order
  const newBalance = balance - Number(total);

  useEffect(() => {
    const subtotal = getTotalCartAmount();

    if (subtotal === 0) {
      const delivery = 0;
      setDelivery(delivery);
      global_delivery(delivery);

      const finalSubtotal = discountApplied ? subtotal * 0.95 : subtotal;
      const totalAmount = Math.round((finalSubtotal + delivery) * 100) / 100;

      setTotal(totalAmount);
      setFinalTotal(totalAmount);
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("finance")
          .select("num_orders")
          .eq("customer_id", auth.user_id)
          .single();

        if (error) throw error;

        const numOrders = data?.num_orders ?? 0;

        const delivery =
          (numOrders + 1) % 3 === 0 && isVip ? 0 : 2;

        setDelivery(delivery);
        global_delivery(delivery);

        const finalSubtotal = discountApplied ? subtotal * 0.95 : subtotal;
        const totalAmount = Math.round((finalSubtotal + delivery) * 100) / 100;

        setTotal(totalAmount);
        setFinalTotal(totalAmount);
      } catch (err) {
        console.error("Failed to fetch order info:", err);

        const delivery = 2;
        setDelivery(delivery);
        global_delivery(delivery);

        const finalSubtotal = discountApplied ? subtotal * 0.95 : subtotal;
        const totalAmount = Math.round((finalSubtotal + delivery) * 100) / 100;

        setTotal(totalAmount);
        setFinalTotal(totalAmount);
      }
    };

    fetchOrders();
  }, [cartItems, discountApplied, auth, isVip]);

  const handlePromoSubmit = () => {
    if (promoCode !== "CUNYVIP") {
      alert("Invalid promo code");
    }

    if (!isVip) {
      alert("Promo Code can only be applied by VIP customers");
      return;
    }

    if (discountApplied) {
      alert("Promo already applied");
      return;
    }

    if (promoCode === "CUNYVIP") {
      setDiscountApplied(true);
      alert("Promo applied!");
    }
  };

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>

        <br />
        <hr />

        {menuItems.map((item) => {
          if (cartItems[item.dish_id] > 0) {
            return (
              <div key={item.dish_id} className="cart-row">
                <div className="cart-items-title cart-items-item">
                  <img src={item.image_url} alt="" />

                  <p>{item.name}</p>
                  <p>${Math.round(Number(item.price) * 100) / 100}</p>

                  <div className="cart-qty-box">
                    <button
                      className="qty-btn"
                      onClick={() => removeFromCart(item.dish_id)}
                    >
                      −
                    </button>

                    <p className="qty-count">{cartItems[item.dish_id]}</p>

                    <button
                      className="qty-btn"
                      onClick={() => addToCart(item.dish_id)}
                    >
                      +
                    </button>
                  </div>

                  <p>
                    $
                    {Math.round(
                      Number(item.price) * cartItems[item.dish_id] * 100
                    ) / 100}
                  </p>

                  <img
                    src={assets.trash_icon_red}
                    alt="delete"
                    className="trash-icon"
                    onClick={() => setItemToDelete(item.dish_id)}
                  />
                </div>

                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* CART TOTAL SECTION */}
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>

          <div>
            {/* CURRENT BALANCE */}
            <div className="cart-total-details">
              <p>Current Balance</p>
              <p>${Math.round(balance * 100) / 100}</p>
            </div>

            {/* NEW BALANCE */}
            <div className="cart-total-details">
              <p>New Balance After Order</p>
              <p>${Math.round(newBalance * 100) / 100}</p>
            </div>

            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${Math.round(getTotalCartAmount() * 100) / 100}</p>
            </div>

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${Math.round(delivery * 100) / 100}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>${Math.round(total * 100) / 100}</b>
            </div>
          </div>

          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        {/* PROMO */}
        <div className="cart-promocode">
          <div>
            <p>If you are a VIP customer, enter your promo code here</p>
            <div className="cart-promocode-input">
              <input
                type="text"
                placeholder="promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button onClick={handlePromoSubmit}>Submit</button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Remove Item?</h3>
            <p>Are you sure you want to remove this item?</p>

            <div className="delete-modal-buttons">
              <button
                className="delete-confirm"
                onClick={() => {
                  deleteFromCart(itemToDelete);
                  setItemToDelete(null);
                }}
              >
                Yes, Remove
              </button>

              <button
                className="delete-cancel"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;