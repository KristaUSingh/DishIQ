import React, { useContext, useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";          // FIXED
import { useAuth } from "../../context/useAuth";       // FIXED
import { StoreContext } from "../../context/StoreContext"; // FIXED



const Cart = () => {
  const {
    menuItems,
    cartItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    getTotalCartAmount,
    finalTotal,
    setFinalTotal,
    delivery,
    setDelivery,
    userBalance,
    balanceLoading,
  } = useContext(StoreContext);

  const { auth } = useAuth();
  const navigate = useNavigate();

  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [newBalance, setNewBalance] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    const s = getTotalCartAmount();
    setSubtotal(s);

    // Flat delivery fee is already stored in context (default 2)
    const deliveryFee = delivery ?? 2;
    setDelivery(deliveryFee);

    const finalSub = discountApplied ? s * 0.95 : s;
    const totalAmount = Number((finalSub + deliveryFee).toFixed(2));
    setTotal(totalAmount);
    setFinalTotal(totalAmount);

    // compute new balance
    setNewBalance(Number((userBalance - totalAmount).toFixed(2)));
  }, [cartItems, menuItems, discountApplied, delivery, userBalance, getTotalCartAmount, setFinalTotal, setDelivery]);

  const handlePromoSubmit = () => {
    if (!auth?.vip_flag) {
      alert("Promo Code can only be applied by VIP customers");
      return;
    }
    if (discountApplied) {
      alert("Promo code already applied");
      return;
    }
    if (promoCode === "CUNYVIP") {
      setDiscountApplied(true);
      alert("Promo code applied!");
    } else {
      alert("Invalid promo code");
    }
  };

  const isInsufficient = Number(newBalance) < 0;

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
                  <p>${Number(item.price).toFixed(2)}</p>

                  {/* QUANTITY BUTTONS */}
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

                  {/* ITEM TOTAL */}
                  <p>
                    $
                    {(
                      Number(item.price) * cartItems[item.dish_id]
                    ).toFixed(2)}
                  </p>

                  {/* TRASH DELETE ICON */}
                  <img
                    src={assets.trash_icon_red}
                    alt="delete"
                    className="trash-icon"
                    onClick={() => deleteFromCart(item.dish_id)}
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
            {/* Current Balance */}
            <div className="cart-total-details">
              <p>Current Balance</p>
              <p>
                {balanceLoading ? "Loading..." : `$${Number(userBalance).toFixed(2)}`}
              </p>
            </div>

            {/* New Balance After Order */}
            <div className={`cart-total-details ${isInsufficient ? "insufficient" : ""}`}>
              <p>New Balance After Order</p>
              <p>${isNaN(newBalance) ? "0.00" : Number(newBalance).toFixed(2)}</p>
            </div>

            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${(delivery ?? 2).toFixed(2)}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>${total.toFixed(2)}</b>
            </div>
          </div>

          {/* Warning */}
          {isInsufficient && (
            <div className="balance-warning">
              <p>
                Insufficient balance. Please add funds or remove items from your
                cart to proceed.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate("/place-order")}
            disabled={isInsufficient || subtotal === 0}
            className={`checkout-btn ${isInsufficient || subtotal === 0 ? "disabled" : ""}`}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>

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
    </div>
  );
};

export default Cart;

