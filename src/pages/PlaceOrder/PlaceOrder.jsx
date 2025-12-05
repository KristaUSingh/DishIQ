import React, { useContext, useState, useMemo } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const {
    cartItems,
    menuItems,
    delivery,
    finalTotal,
    getTotalCartAmount,
    deleteFromCart,
    clearCart,
    deductBalance,
  } = useContext(StoreContext);

  const { auth } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Delivery form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  // Build items list
  const cartDetails = useMemo(
    () =>
      menuItems
        .filter((item) => cartItems[item.dish_id])
        .map((item) => ({
          dish_id: item.dish_id,
          name: item.name,
          quantity: cartItems[item.dish_id],
          price: item.price,
          restaurant_name: item.restaurant_name,
        })),
    [menuItems, cartItems]
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!auth || auth.role !== "customer") {
      alert("You must be logged in as a customer to place an order.");
      return;
    }

    if (cartDetails.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const customer_id = auth.customer_id; // as confirmed
      const restaurant_name = cartDetails[0].restaurant_name;
      // Use finalTotal computed in Cart; fallback to recompute
      const total_price = Number(finalTotal ?? (getTotalCartAmount() + (delivery ?? 2)));

      // 1) Check finance balance + deduct using context helper (atomic update)
      const deductResult = await deductBalance(total_price, {
        incrementOrders: 1,
        addTotalSpent: total_price,
      });

      if (!deductResult.success) {
        // If insufficient, add a warning to users table (as your previous code did)
        if (deductResult.message === "Insufficient balance.") {
          // add warning count
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("warnings")
              .eq("user_id", customer_id)
              .single();

            if (userError && userError.code !== "PGRST116") {
              console.error("User fetch error when adding warning:", userError);
            } else {
              const currentWarnings = Number(userData?.warnings ?? 0);
              const { error: updateError } = await supabase
                .from("users")
                .update({ warnings: currentWarnings + 1 })
                .eq("user_id", customer_id);

              if (updateError) console.error("Error updating warnings:", updateError);
            }
          } catch (warnErr) {
            console.error("Warning update failed:", warnErr);
          }

          alert("Insufficient funds! Your balance is too low. A warning has been added to your account.");
          setLoading(false);
          return;
        }

        // other deduction errors
        alert(deductResult.message || "Failed to deduct balance.");
        setLoading(false);
        return;
      }

      // 2) Create order row in orders table
      const delivery_address = `${street}, ${city}, ${stateVal} ${zip}`;
      const orderPayload = {
        customer_id,
        restaurant_name,
        status: "paid",
        total_price,
        delivery_address,
        delivery_fee: delivery ?? 2,
      };

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error("Order insert error:", orderError);
        alert("Order creation failed; please contact support.");
        setLoading(false);
        return;
      }

      const order_id = orderData.order_id;

      // 3) Insert order items
      const itemsToInsert = cartDetails.map((item) => ({
        order_id,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsError) {
        console.error("Order items insert error:", itemsError);
        alert("Failed to create order items; please contact support.");
        setLoading(false);
        return;
      }

      // 4) Clear cart (use clearCart for convenience)
      clearCart();

      alert("Order placed successfully!");
      setLoading(false);
      navigate("/order-confirmation", { state: { order: orderData } });
    } catch (err) {
      console.error("Order Error:", err);
      alert("Something went wrong placing your order. Try again.");
      setLoading(false);
    }
  };

  return (
    <form className="place-order" onSubmit={handlePlaceOrder}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <div className="multi-fields">
          <input
            type="text"
            placeholder="First Name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Street"
          required
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />

        <div className="multi-fields">
          <input
            type="text"
            placeholder="City"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="text"
            placeholder="State"
            required
            value={stateVal}
            onChange={(e) => setStateVal(e.target.value)}
          />
        </div>

        <div className="multi-fields">
          <input
            type="text"
            placeholder="Zip Code"
            required
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
          <input
            type="text"
            placeholder="Country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <input
          type="text"
          placeholder="Phone Number"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotalCartAmount().toFixed(2)}</p>
          </div>

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>${(delivery ?? 2).toFixed(2)}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>{"$"}{(finalTotal ?? (getTotalCartAmount() + (delivery ?? 2))).toFixed(2)}</b>
          </div>

          <div className="cart-total-details" style={{ marginLeft: "auto" }}>
            {((getTotalCartAmount() + (delivery ?? 2)).toFixed(2) !== Number(finalTotal ?? 0).toFixed(2) && getTotalCartAmount() !== 0) && (
              <div style={{ fontSize: "0.9rem", color: "#777" }}>
                Original price without discount: ${(getTotalCartAmount() + (delivery ?? 2)).toFixed(2)}
              </div>
            )}
          </div>

          <button style={{ marginLeft: "auto" }} disabled={loading}>
            {loading ? "Placing Order..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;

