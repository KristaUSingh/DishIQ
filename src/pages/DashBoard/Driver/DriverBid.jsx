import React, { useState } from "react";
import './DriverBid.css';

const sampleBids = [
  {
    id: 1,
    orderNumber: "ORD-101",
    pickup: "Pizza Palace, Downtown",
    dropoff: "John Doe, Elm Street",
    payment: 12.5,
    distance: "5 km"
  },
  {
    id: 2,
    orderNumber: "ORD-102",
    pickup: "Sushi Express, Midtown",
    dropoff: "Jane Smith, Oak Avenue",
    payment: 15.0,
    distance: "7 km"
  },
  {
    id: 3,
    orderNumber: "ORD-103",
    pickup: "Burger Town, Uptown",
    dropoff: "Mike Johnson, Pine Street",
    payment: 10.0,
    distance: "4 km"
  }
];

const DriverBids = () => {
  const [bids, setBids] = useState(sampleBids);

  const handleAcceptBid = (bidId) => {
    alert(`You accepted bid ${bidId}!`);
    // Remove bid from list
    setBids(prevBids => prevBids.filter(bid => bid.id !== bidId));
  };

  return (
    <div className="driver-bids-dashboard">
      <h2>Available Delivery Bids</h2>

      {bids.length === 0 ? (
        <p className="empty-state-message">No available bids at the moment.</p>
      ) : (
        <div className="bid-cards">
          {bids.map(bid => (
            <div key={bid.id} className="bid-card">
              <div className="bid-header">
                <span className="bid-order">{bid.orderNumber}</span>
                <span className="bid-payment">${bid.payment.toFixed(2)}</span>
              </div>
              <p className="bid-details"><strong>Pickup:</strong> {bid.pickup}</p>
              <p className="bid-details"><strong>Dropoff:</strong> {bid.dropoff}</p>
              <p className="bid-details"><strong>Distance:</strong> {bid.distance}</p>
              <button className="accept-btn" onClick={() => handleAcceptBid(bid.id)}>
                Accept
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverBids;
