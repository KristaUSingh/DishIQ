import React, { useEffect, useState } from "react";
import "./OrderHistory.css";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../context/useAuth";
import ReviewModal from "./ReviewModal";

const OrderHistory = () => {
  const { auth } = useAuth();
  const customerId = auth?.user_id;

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch orders + ratings
  const fetchOrderHistory = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        ratings:ratings(order_id, food_rating, delivery_rating, comment)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data);
    } else {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    if (customerId) fetchOrderHistory();
  }, [customerId]);

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    fetchOrderHistory(); // refresh after submit
  };

  return (
    <div className="order-history-container">
      <h1 className="order-history-title">Your Order History</h1>

      {orders.map((order) => {
        const hasReview = order.ratings && order.ratings.length > 0;
        const review = hasReview ? order.ratings[0] : null;

        return (
          <div
            key={order.order_id}
            className={`order-card ${hasReview ? "reviewed-card" : ""}`}
          >
            {/* HEADER */}
            <div className="order-header">
              <h2>{order.restaurant_name}</h2>
              <p className="order-date">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            {/* INFO */}
            <div className="order-info">
              <p>
                <strong>Order ID:</strong> {order.order_id}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Total Price:</strong> ${order.total_price}
              </p>
              <p>
                <strong>Delivery Address:</strong> {order.delivery_address}
              </p>
            </div>

            {/* REVIEW DISPLAY */}
            {hasReview ? (
              <div className="review-box">
                <h3>Your Review</h3>
                <p>
                  <strong>Food Rating:</strong> {review.food_rating} ★
                </p>
                <p>
                  <strong>Delivery Rating:</strong> {review.delivery_rating} ★
                </p>
                <p>
                  <strong>Comment:</strong> {review.comment}
                </p>
              </div>
            ) : (
              <button
                className="review-btn"
                onClick={() => openReviewModal(order)}
              >
                Leave a Review
              </button>
            )}
          </div>
        );
      })}

      {/* REVIEW MODAL */}
      {showModal && (
        <ReviewModal order={selectedOrder} onClose={closeModal} />
      )}
    </div>
  );
};

export default OrderHistory;