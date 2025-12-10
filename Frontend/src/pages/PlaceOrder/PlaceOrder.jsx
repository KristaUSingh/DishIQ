import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";

//adding
//inefficent funds and give a warning

//success
//subtract from balance
//ADD TO ORDER COUNT WHEN TRANSCATION GOES THROUGH
//add finalTotal to total_spent


const PlaceOrder = () => {
  const { cartItems, menuItems, delivery, finalTotal, getTotalCartAmount, deleteFromCart } =
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
    const total_price = finalTotal; 
    const delivery_address = `${street}, ${city}, ${stateVal} ${zip}`;

    // --------------------------------------------------
    // 1️⃣ GET CUSTOMER BALANCE FROM FINANCE
    // --------------------------------------------------
    const { data: financeData, error: financeError } = await supabase
      .from("finance")
      .select("balance, num_orders, total_spent")
      .eq("customer_id", auth.user_id)
      .single();

    if (financeError) throw financeError;

    const balance = financeData?.balance ?? 0;

    // --------------------------------------------------
    // 2️⃣ NOT ENOUGH FUNDS → ADD WARNING, DO NOT PLACE ORDER
    // --------------------------------------------------
    if (balance < finalTotal) {
      const { data: userData, error: userError } = await supabase
      .from("users")
      .select("warnings")
      .eq("user_id", customer_id)
      .single();

    if (userError) throw userError;

    const currentWarnings = userData?.warnings ?? 0;

    // 2️⃣ Update warnings
    const { error: updateError } = await supabase
      .from("users")
      .update({ warnings: currentWarnings + 1 })
      .eq("user_id", customer_id);

    if (updateError) throw updateError;

      alert("Insufficient funds! Your balance is too low. A warning has been added to your account.");
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 3️⃣ ENOUGH FUNDS → START ORDER PROCESS
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 4️⃣ INSERT ORDER ITEMS
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 5️⃣ UPDATE FINANCE RECORD
    // --------------------------------------------------
    const newBalance = balance - finalTotal;
    const newNumOrders = financeData.num_orders + 1;
    const newTotalSpent = financeData.total_spent + total_price;

    const { error: financeUpdateError } = await supabase
      .from("finance")
      .update({
        balance: newBalance,
        num_orders: newNumOrders,
        total_spent: newTotalSpent,
      })
      .eq("customer_id", customer_id);

    if (financeUpdateError) throw financeUpdateError;

    // --------------------------------------------------
    // 6️⃣ CLEAR CART + SUCCESS
    // --------------------------------------------------
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

            <p>${getTotalCartAmount().toFixed(2)}</p>
          </div>

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>${delivery ?? "0.00"}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>{"$"}{finalTotal ?? "0.00"}</b>
          </div> 

          <div className="cart-total-details" style={{ marginLeft: "auto" }}>
          {/* original price */}
          {((getTotalCartAmount() + delivery).toFixed(2) !== Number(finalTotal).toFixed(2) && getTotalCartAmount() !== 0)&& (
            <div style={{ fontSize: "0.9rem", color: "#777" }}>
              Original price without discount: ${(getTotalCartAmount() + delivery).toFixed(2)}
            </div>
          )} </div>

          <button style={{ marginLeft: "auto" }} disabled={loading}>
            {loading ? "Placing Order..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;