import React, { useState, useEffect, useContext } from "react";
import "./Home.css";
import { AuthContext } from "../../context/AuthContext"; // useContext directly

import Header from "../../components/navbar/Header/Header";
import ExploreRestaurants from "../../components/navbar/ExploreRestaurants/ExploreRestaurants";
import FoodDisplay from "../../components/navbar/FoodDisplay/FoodDisplay";

const Home = () => {
  const [category, setCategory] = useState("All");
  const { auth } = useContext(AuthContext); // access auth
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
  if (auth?.warnings > 0) {
    setShowWarning(true);
    const timer = setTimeout(() => setShowWarning(false), 10000); // 10 seconds
    return () => clearTimeout(timer);
  }
}, [auth?.warnings]);

  return (
    <>
      <div className="header-wrapper">
        {/* Warning banner at the top */}
        {showWarning && auth?.warnings > 0 && (
        <div className="warning-banner">
          ⚠ You have {auth.warnings} warning{auth.warnings > 1 ? "s" : ""}.
        </div>
      )}

        {/* Header stays unchanged */}
        <Header />

        {/* VIP banner at the bottom */}
        {auth?.vip_flag && (
          <div className="vip-banner">
            ⭐ VIP Customer: Use Promo Code "CUNYVIP" for 5% off your next order!
          </div>
        )}
      </div>

      <ExploreRestaurants category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
    </>
  );
};

export default Home;
