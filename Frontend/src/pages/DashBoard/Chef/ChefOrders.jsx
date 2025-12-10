import { useState, useEffect } from "react";
import { supabase } from "../../../api/supabaseClient";
import { useAuth } from "../../../context/useAuth";
import "./ChefOrders.css";

export default function ChefOrders() {
  const { auth } = useAuth();
  const restaurant_name = auth?.restaurant_name;
  const chef_id = auth?.user_id;

  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (restaurant_name) fetchOrders();
  }, [restaurant_name, activeTab]);

  // ----------------------------------------------------
  // FETCH ORDERS (Pending, My Orders, or Completed)
  // ----------------------------------------------------
  const fetchOrders = async () => {
    let statusFilter = [];
    let filterQuery = supabase.from("orders").select(
      `
      order_id,
      status,
      chef_id,
      created_at,
      delivery_address,
      users:customer_id (
        first_name,
        last_name
      ),
      order_items (
        quantity,
        price,
        menus ( name )
      )
    `
    );

    // --- TAB: PENDING (unclaimed or in progress)
    if (activeTab === "pending") {
      statusFilter = ["pending", "in_progress"];
      filterQuery = filterQuery
        .eq("restaurant_name", restaurant_name)
        .in("status", statusFilter)
        .order("created_at", { ascending: false });
    }

    // --- TAB: MY ORDERS (only this chef)
    else if (activeTab === "mine") {
      filterQuery = filterQuery
        .eq("restaurant_name", restaurant_name)
        .eq("chef_id", chef_id)
        .order("created_at", { ascending: false });
    }

    // --- TAB: COMPLETED
    else if (activeTab === "completed") {
      filterQuery = filterQuery
        .eq("restaurant_name", restaurant_name)
        .eq("status", "ready_for_pickup")
        .order("created_at", { ascending: false });
    }

    const { data, error } = await filterQuery;

    if (!error) setOrders(data);
    else console.error("Fetch error:", error);
  };

  // ----------------------------------------------------
  // ATOMIC CLAIM ORDER (safe locking)
  // ----------------------------------------------------
  const claimOrder = async (orderId) => {
    // atomic update: claim only if chef_id is NULL
    const { data, error } = await supabase
      .from("orders")
      .update({
        chef_id: chef_id,
        status: "in_progress",
      })
      .eq("order_id", orderId)
      .is("chef_id", null) // prevents double claiming
      .select()
      .single();

    if (error) {
      console.error("Claim error:", error);
      return;
    }

    // If no row updated → someone else claimed it
    if (!data) {
      alert("Sorry, another chef already claimed this order.");
    }

    fetchOrders();
  };

  // ----------------------------------------------------
  // UPDATE STATUS
  // ----------------------------------------------------
  const updateStatus = async (orderId, newStatus) => {
    const normalized = newStatus.toLowerCase();

    await supabase
      .from("orders")
      .update({ status: normalized })
      .eq("order_id", orderId);

    // Create delivery request if ready
    if (normalized === "ready_for_pickup") {
      const { data: info } = await supabase
        .from("orders")
        .select("delivery_address, restaurant_name")
        .eq("order_id", orderId)
        .single();

      await supabase
        .from("delivery_requests")
        .insert({
          order_id: orderId,
          restaurant_name: info.restaurant_name,
          delivery_address: info.delivery_address || "",
        });
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
          className={activeTab === "mine" ? "active" : ""}
          onClick={() => setActiveTab("mine")}
        >
          My Orders
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
          orders.map((order) => {
            const claimedByMe = order.chef_id === chef_id;
            const isClaimed = order.chef_id !== null;

            return (
              <div className="order-card" key={order.order_id}>
                <h3>
                  Order #{order.order_id}: {order.users?.first_name}{" "}
                  {order.users?.last_name}
                </h3>

                <div className="items-section">
                  <strong>Items:</strong>
                  {order.order_items.map((item, i) => (
                    <div key={i}>
                      {item.quantity}× {item.menus?.name} (${item.price})
                    </div>
                  ))}
                </div>

                <div className="status-buttons">

                  {/* 1️⃣ UNCLAIMED ORDER */}
                  {!isClaimed && activeTab === "pending" && (
                    <button
                      className="in-progress-btn"
                      onClick={() => claimOrder(order.order_id)}
                    >
                      Claim & Prepare
                    </button>
                  )}

                  {/* 2️⃣ CLAIMED BY THIS CHEF */}
                  {claimedByMe && (
                    <>
                      {order.status === "in_progress" && (
                        <button
                          className="ready-btn"
                          onClick={() =>
                            updateStatus(order.order_id, "ready_for_pickup")
                          }
                        >
                          Ready for Pickup
                        </button>
                      )}
                    </>
                  )}

                  {/* 3️⃣ CLAIMED BY ANOTHER CHEF */}
                  {isClaimed && !claimedByMe && (
                    <p className="claimed-msg">
                      Being prepared by another chef
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}