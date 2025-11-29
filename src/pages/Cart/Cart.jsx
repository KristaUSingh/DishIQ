import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets"; // make sure trash icon is inside assets

const Cart = () => {
  const {
    cartItems,
    menuItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    getTotalCartAmount,
  } = useContext(StoreContext);

  const [itemToDelete, setItemToDelete] = useState(null);
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

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Remove Item?</h3>
            <p>Are you sure you want to remove this item from your cart?</p>

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
