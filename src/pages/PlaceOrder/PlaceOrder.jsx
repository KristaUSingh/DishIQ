import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const { cartItems, menuItems, getTotalCartAmount, deleteFromCart } =
    useContext(StoreContext);

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
  const cartDetails = menuItems
    .filter((item) => cartItems[item.dish_id])
    .map((item) => ({
      dish_id: item.dish_id,
      name: item.name,
      quantity: cartItems[item.dish_id],
      price: item.price,
      restaurant_name: item.restaurant_name,
    }));

  // ----------------------------
  // HANDLE PLACE ORDER
  // ----------------------------
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
      const customer_id = auth.user_id;
      const restaurant_name = cartDetails[0].restaurant_name;
      const total_price = getTotalCartAmount();

      // Build full delivery address
      const delivery_address = `${firstName} ${lastName}, ${street}, ${city}, ${stateVal} ${zip}, ${country}. Phone: ${phone}`;

      // -----------------------------------------
      // 1️⃣ INSERT INTO ORDERS TABLE
      // -----------------------------------------
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_id,
            restaurant_name,
            status: "pending",
            total_price,
            delivery_address,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const order_id = orderData.order_id;

      // -----------------------------------------
      // 2️⃣ INSERT INTO ORDER_ITEMS TABLE
      // -----------------------------------------
      const itemsToInsert = cartDetails.map((item) => ({
        order_id,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Clear cart
      cartDetails.forEach((item) => deleteFromCart(item.dish_id));

      alert("Order placed successfully!");
      navigate("/");

    } catch (err) {
      console.error("Order Error:", err);
      alert("Something went wrong placing your order. Try again.");
    }

    setLoading(false);
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
            <p>${getTotalCartAmount()}</p>
          </div>

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
          </div>

          <button disabled={loading}>
            {loading ? "Placing Order..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
