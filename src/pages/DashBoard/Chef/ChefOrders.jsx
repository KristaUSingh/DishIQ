import { useState, useEffect } from "react";
import { supabase } from "../../../api/supabaseClient";
import { useAuth } from "../../../context/useAuth";
import "./ChefOrders.css";

export default function ChefOrders() {
  const { auth } = useAuth();
  const restaurant_name = auth?.restaurant_name;

  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (restaurant_name) fetchOrders();
  }, [restaurant_name, activeTab]);

  // ----------------------------------------------------
  // FETCH ORDERS FOR THIS RESTAURANT
  // ----------------------------------------------------
  const fetchOrders = async () => {
    const statusFilter =
      activeTab === "pending"
        ? ["pending", "in_progress"]
        : ["ready_for_pickup"];

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        order_id,
        status,
        created_at,
        delivery_address,
        users:customer_id (
          first_name,
          last_name
        ),
        order_items (
          dish_id,
          quantity,
          price,
          menus (
            name
          )
        )
      `
      )
      .eq("restaurant_name", restaurant_name)
      .in("status", statusFilter)
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch Error:", error);
    else setOrders(data);
  };

  // ----------------------------------------------------
  // UPDATE STATUS + CREATE BID WHEN READY
  // ----------------------------------------------------
  const updateStatus = async (orderId, newStatus) => {
    const normalized = newStatus.toLowerCase();

    // 1️⃣ UPDATE ORDER STATUS
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: normalized })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Status Update Error:", updateError);
      return;
    }

    // 2️⃣ IF READY → CREATE BID ENTRY
    if (normalized === "ready_for_pickup") {
      const { data: orderInfo, error: fetchError } = await supabase
        .from("orders")
        .select("delivery_address, restaurant_name")
        .eq("order_id", orderId)
        .single();

      if (fetchError) {
        console.error("Fetch Delivery Address Error:", fetchError);
        return;
      }

      // Insert into bids
      const { error: insertError } = await supabase.from("delivery_requests").insert({
        order_id: orderId,
        restaurant_name: orderInfo.restaurant_name,
        delivery_address: orderInfo.delivery_address || "",
      });

      if (insertError) {
        console.error("Bid Insert Error:", insertError);
        return;
      }
    }

    fetchOrders();
  };

  return (
    <div className="chef-orders">

      {/* -------------------- TABS -------------------- */}
      <div className="tabs">
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>

        <button
          className={activeTab === "completed" ? "active" : ""}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      {/* -------------------- ORDER LIST -------------------- */}
      <div className="orders-container">
        {orders.length === 0 ? (
          <p className="empty">No orders here.</p>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.order_id}>
              
              <h3>
                Order #{order.order_id}: {order.users?.first_name} {order.users?.last_name}
              </h3>

              <div className="items-section">
                <strong>Items:</strong>
                {order.order_items.map((item, index) => (
                  <div key={index}>
                    {item.quantity}× {item.menus?.name} (${item.price})
                  </div>
                ))}
              </div>

              {activeTab === "pending" && (
                <div className="status-buttons">

                  {/* SHOW ONLY WHEN PENDING */}
                  {order.status === "pending" && (
                    <button
                      className="in-progress-btn"
                      onClick={() => updateStatus(order.order_id, "in_progress")}
                    >
                      In Progress
                    </button>
                  )}

                  {/* SHOW READY BUTTON IN BOTH STATES */}
                  {(order.status === "pending" ||
                    order.status === "in_progress") && (
                    <button
                      className="ready-btn"
                      onClick={() => updateStatus(order.order_id, "ready_for_pickup")}
                    >
                      Ready for Pickup
                    </button>
                  )}

                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
