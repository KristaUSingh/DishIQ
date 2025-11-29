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

  // Fetch orders with items, chef, driver, ratings
  const fetchOrderHistory = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          dish_id,
          quantity,
          menus ( name )
        ),
        chef:chef_id ( first_name, last_name ),
        driver:deliver_id ( first_name, last_name ),
        ratings:ratings(*)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data);
    } else {
      console.error("Order fetch error:", error);
    }
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
    fetchOrderHistory(); // reload after review
  };

  return (
    <div className="order-history-container">
      <h1 className="order-history-title">Your Order History</h1>

      {orders.map((order) => (
        <div key={order.order_id} className="order-card">

          {/* HEADER */}
          <div className="order-header">
            <h2>{order.restaurant_name}</h2>
            <p className="order-date">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          {/* INFO */}
          <div className="order-info">
            <p><strong>Order ID:</strong> {order.order_id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Price:</strong> ${order.total_price}</p>
            <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
          </div>

          {/* CHEF & DRIVER */}
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

            {order.order_items.map((item, index) => {
              // Check if dish is reviewed
              const dishReviewed = order.ratings?.some(
                (r) =>
                  r.review_type === "dish" &&
                  r.dish_id === item.dish_id
              );

              return (
                <div key={index} className="dish-row">
                  <p>
                    {item.quantity}× {item.menus?.name}
                  </p>

                  <button
                    className={`review-btn ${dishReviewed ? "disabled-review" : ""}`}
                    disabled={dishReviewed}
                    onClick={() =>
                      !dishReviewed && openReviewModal("dish", order, item)
                    }
                  >
                    {dishReviewed ? "Reviewed" : "Review This Dish"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* DRIVER REVIEW BUTTON */}
          {order.deliver_id && (
            (() => {
              const driverReviewed = order.ratings?.some(
                (r) => r.review_type === "driver"
              );

              return (
                <button
                  className={`review-btn driver-btn ${driverReviewed ? "disabled-review" : ""}`}
                  disabled={driverReviewed}
                  onClick={() =>
                    !driverReviewed && openReviewModal("driver", order)
                  }
                >
                  {driverReviewed ? "Driver Reviewed" : "Review Delivery Driver"}
                </button>
              );
            })()
          )}
        </div>
      ))}

      {showModal && (
        <ReviewModal data={selectedReview} onClose={closeModal} />
      )}
    </div>
  );
};

export default OrderHistory;