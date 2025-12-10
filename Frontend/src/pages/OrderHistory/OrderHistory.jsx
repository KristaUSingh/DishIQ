import React, { useEffect, useState } from "react";
import "./OrderHistory.css";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../context/useAuth";
import ReviewModal from "./ReviewModal";

const OrderHistory = () => {
  const { auth } = useAuth();
  const customerId = auth?.user_id;

  const [orders, setOrders] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load orders + order_items + chef + driver + ratings
  const fetchOrderHistory = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items ( dish_id, quantity, menus ( name ) ),
        chef:chef_id ( first_name, last_name ),
        driver:deliver_id ( first_name, last_name ),
        ratings:ratings(*)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
    else console.error("Order fetch error:", error);
  };

  useEffect(() => {
    if (customerId) fetchOrderHistory();
  }, [customerId]);

  const openReviewModal = (type, order, dish = null) => {
    setSelectedReview({ type, order, dish });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReview(null);
    fetchOrderHistory(); // refresh
  };

  return (
    <div className="order-history-container">
      <h1 className="order-history-title">Your Order History</h1>

      {orders.map((order) => {
        // Disable only reviews SPECIFIC to dish/driver
        const dishReviews = order.ratings.filter(r => r.review_target === "chef");
        const driverReviews = order.ratings.filter(r => r.review_target === "driver");

        return (
          <div key={order.order_id} className="order-card">
            <div className="order-header">
              <h2>{order.restaurant_name}</h2>
              <p className="order-date">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="order-info">
              <p><strong>Order ID:</strong> {order.order_id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total Price:</strong> ${order.total_price}</p>
              <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
            </div>

            <div className="order-info">
              <p>
                <strong>Chef:</strong>{" "}
                {order.chef
                  ? `${order.chef.first_name} ${order.chef.last_name}`
                  : "Not assigned"}
              </p>

              <p>
                <strong>Delivery Driver:</strong>{" "}
                {order.driver
                  ? `${order.driver.first_name} ${order.driver.last_name}`
                  : "Not assigned"}
              </p>
            </div>

            {/* DISH LIST */}
            <div className="dish-list">
              <h3>Dishes in this order:</h3>

              {order.order_items.map((item, i) => {
                const alreadyReviewed = dishReviews.some(
                  r => r.dish_id === item.dish_id
                );

                return (
                  <div key={i} className="dish-row">
                    <p>{item.quantity}× {item.menus?.name}</p>

                    <button
                      className={`review-btn ${alreadyReviewed ? "disabled-review" : ""}`}
                      disabled={alreadyReviewed}
                      onClick={() =>
                        openReviewModal("dish", order, item)
                      }
                    >
                      {alreadyReviewed ? "Reviewed" : "Review This Dish"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* DELIVERY DRIVER REVIEW */}
            {order.deliver_id && (
              <button
                className={`review-btn driver-btn ${
                  driverReviews.length > 0 ? "disabled-review" : ""
                }`}
                disabled={driverReviews.length > 0}
                onClick={() => openReviewModal("driver", order)}
              >
                {driverReviews.length > 0
                  ? "Driver Reviewed"
                  : "Review Delivery Driver"}
              </button>
            )}
          </div>
        );
      })}

      {showModal && <ReviewModal data={selectedReview} onClose={closeModal} />}
    </div>
  );
};

export default OrderHistory;