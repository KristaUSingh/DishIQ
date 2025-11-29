import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    menuItems,
    cartItems,
    removeFromCart,
    getTotalCartAmount,
  } = useContext(StoreContext);

  const navigate = useNavigate();

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

        {/* DISPLAY ONLY ITEMS THAT ARE IN CART */}
        {menuItems.map((item) => {
          const qty = cartItems[item.dish_id];

          if (!qty || qty <= 0) return null;

          return (
            <div key={item.dish_id}>
              <div className="cart-items-title cart-items-item">
                <img src={item.image_url} alt={item.name} />

                <p>{item.name}</p>

                <p>${Number(item.price).toFixed(2)}</p>

                <p>{qty}</p>

                <p>${(item.price * qty).toFixed(2)}</p>

                <p
                  className="cross"
                  onClick={() => removeFromCart(item.dish_id)}
                >
                  x
                </p>
              </div>

              <hr />
            </div>
          );
        })}
      </div>

      {/* CART TOTAL SECTION */}
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount().toFixed(2)}</p>
            </div>

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? "0.00" : "2.00"}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>
                $
                {getTotalCartAmount() === 0
                  ? "0.00"
                  : (getTotalCartAmount() + 2).toFixed(2)}
              </b>
            </div>
          </div>

          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        {/* PROMO CODE */}
        <div className="cart-promocode">
          <div>
            <p>If you are a VIP customer, enter your promo code here</p>

            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
