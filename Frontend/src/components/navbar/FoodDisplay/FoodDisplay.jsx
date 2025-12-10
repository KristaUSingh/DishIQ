import React, { useContext, useEffect, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { supabase } from "../../../api/supabaseClient";
import { useAuth } from "../../../context/useAuth";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  const { auth } = useAuth();

  const [mostPopular, setMostPopular] = useState([]);
  const [highestRated, setHighestRated] = useState([]);
  const [topChefs, setTopChefs] = useState([]);

  // ⭐ Personalized sections
  const [userMostOrdered, setUserMostOrdered] = useState([]);
  const [userHighestRated, setUserHighestRated] = useState([]);

  useEffect(() => {
    if (auth?.isLoggedIn) {
      fetchUserMostOrdered();
      fetchUserHighestRated();
    } else {
      fetchMostPopular();
      fetchHighestRated();
    }

    fetchTopChefs();
  }, [auth]);

  useEffect(() => {
    console.log("AUTH OBJECT:", auth);
    supabase.auth.getSession().then(res => {
      console.log("SESSION:", res);
    });
  }, [auth]);
  

  // ----------------------------------------------------------
  // GLOBAL MOST POPULAR
  // ----------------------------------------------------------
  const fetchMostPopular = async () => {
    const { data, error } = await supabase
      .from("order_items")
      .select("dish_id");

    if (error) return console.error("Most Popular Error:", error);

    const countMap = {};
    data?.forEach((r) => {
      countMap[r.dish_id] = (countMap[r.dish_id] || 0) + 1;
    });

    const topIds = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => Number(id));

    if (topIds.length === 0) return setMostPopular([]);

    const { data: dishes } = await supabase
      .from("menus")
      .select("*")
      .in("dish_id", topIds);

    // ⭐ Fetch ratings
    const { data: ratings } = await supabase
      .from("ratings")
      .select("dish_id, food_rating")
      .in("dish_id", topIds)
      .not("food_rating", "is", null);

    const ratingMap = {};
    ratings?.forEach((r) => {
      if (!ratingMap[r.dish_id]) ratingMap[r.dish_id] = [];
      ratingMap[r.dish_id].push(r.food_rating);
    });

    const merged = dishes.map((d) => {
      const stars = ratingMap[d.dish_id];
      return {
        ...d,
        rating: stars ? stars.reduce((a, b) => a + b, 0) / stars.length : null,
      };
    });

    setMostPopular(merged);
  };

  // ----------------------------------------------------------
  // GLOBAL HIGHEST RATED
  // ----------------------------------------------------------
  const fetchHighestRated = async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select("dish_id, food_rating")
      .not("food_rating", "is", null);

    if (error) return console.error("Highest Rated Error:", error);

    const ratingMap = {};
    data?.forEach((r) => {
      if (!ratingMap[r.dish_id]) ratingMap[r.dish_id] = [];
      ratingMap[r.dish_id].push(r.food_rating);
    });

    const avgRatings = Object.entries(ratingMap).map(([dish_id, stars]) => ({
      dish_id: Number(dish_id),
      avg: stars.reduce((a, b) => a + b, 0) / stars.length,
    }));

    const top = avgRatings.sort((a, b) => b.avg - a.avg).slice(0, 3);

    const { data: dishes } = await supabase
      .from("menus")
      .select("*")
      .in("dish_id", top.map((d) => d.dish_id));

    const merged = dishes.map((d) => ({
      ...d,
      rating: top.find((t) => t.dish_id === d.dish_id)?.avg,
    }));

    setHighestRated(merged);
  };

  // ----------------------------------------------------------
  // ⭐ USER PERSONALIZED — MOST ORDERED
  // ----------------------------------------------------------
  const fetchUserMostOrdered = async () => {
    const userId = auth?.user_id;
    if (!userId) return setUserMostOrdered([]);
  
    // 1. Get all orders placed by this customer
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("order_id")
      .eq("customer_id", userId);
  
    if (orderError) return console.error(orderError);
  
    const orderIds = orders?.map((o) => o.order_id);
    if (!orderIds || orderIds.length === 0) {
      return setUserMostOrdered([]);
    }
  
    // 2. Get all items from those orders
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("dish_id")
      .in("order_id", orderIds);
  
    if (itemsError) return console.error(itemsError);
  
    if (!items || items.length === 0) return setUserMostOrdered([]);
  
    // 3. Count frequency
    const countMap = {};
    items.forEach((i) => {
      countMap[i.dish_id] = (countMap[i.dish_id] || 0) + 1;
    });
  
    // 4. Get top 3
    const topIds = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => Number(id));
  
    // 5. Fetch the dish info
    const { data: dishes } = await supabase
      .from("menus")
      .select("*")
      .in("dish_id", topIds);
  
    setUserMostOrdered(dishes || []);
  };
  

  // ----------------------------------------------------------
  // ⭐ USER PERSONALIZED — HIGHEST RATED
  // ----------------------------------------------------------
  const fetchUserHighestRated = async () => {
    const userId = auth?.user_id;
    if (!userId) return setUserHighestRated([]);
  
    // 1. Fetch ratings from this user
    const { data: ratings, error } = await supabase
      .from("ratings")
      .select("dish_id, food_rating")
      .eq("customer_id", userId)
      .not("food_rating", "is", null);
  
    if (error) return console.error(error);
    if (!ratings || ratings.length === 0) return setUserHighestRated([]);
  
    // 2. Average ratings
    const ratingMap = {};
    ratings.forEach((r) => {
      if (!ratingMap[r.dish_id]) ratingMap[r.dish_id] = [];
      ratingMap[r.dish_id].push(r.food_rating);
    });
  
    const averages = Object.entries(ratingMap).map(([dish_id, stars]) => ({
      dish_id: Number(dish_id),
      avg: stars.reduce((a, b) => a + b, 0) / stars.length,
    }));
  
    // 3. Top 3 by avg
    const top = averages.sort((a, b) => b.avg - a.avg).slice(0, 3);
  
    // 4. Fetch dishes
    const { data: dishes } = await supabase
      .from("menus")
      .select("*")
      .in("dish_id", top.map((t) => t.dish_id));
  
    // 5. Attach rating
    const merged = dishes.map((d) => ({
      ...d,
      rating: top.find((t) => t.dish_id === d.dish_id)?.avg,
    }));
  
    setUserHighestRated(merged);
  };
  

  // ----------------------------------------------------------
  // ⭐ TOP CHEFS
  // ----------------------------------------------------------
  const fetchTopChefs = async () => {
    const { data: ratings, error } = await supabase
      .from("ratings")
      .select("chef_id, food_rating, restaurant_name")
      .not("chef_id", "is", null)
      .not("food_rating", "is", null);

    if (error) return;

    const chefMap = {};
    ratings.forEach((r) => {
      if (!chefMap[r.chef_id]) chefMap[r.chef_id] = { stars: [], restaurants: [] };
      chefMap[r.chef_id].stars.push(r.food_rating);
      if (r.restaurant_name) chefMap[r.chef_id].restaurants.push(r.restaurant_name);
    });

    const averages = Object.entries(chefMap).map(([chef_id, obj]) => ({
      chef_id,
      avg: obj.stars.reduce((a, b) => a + b, 0) / obj.stars.length,
      restaurant_name: obj.restaurants[0] ?? "Unknown Restaurant",
    }));

    const top = averages.sort((a, b) => b.avg - a.avg).slice(0, 3);
    const chefIds = top.map((c) => c.chef_id);

    const { data: profiles } = await supabase
      .from("users")
      .select("user_id, first_name, last_name")
      .in("user_id", chefIds);

    const merged = top.map((c) => {
      const p = profiles?.find((u) => u.user_id === c.chef_id);
      return {
        chef_id: c.chef_id,
        name: `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim(),
        restaurant_name: c.restaurant_name,
        rating: c.avg,
        isChefCard: true,
      };
    });

    setTopChefs(merged);
  };

  return (
    <div className="food-display">
      <h2>Top Dishes Near You</h2>

      {/* USER PERSONALIZED */}
      {auth?.isLoggedIn && userMostOrdered.length > 0 && (
        <div className="food-section">
          <h3>Your Most Ordered</h3>
          <div className="food-display-list">
            {userMostOrdered.map((item) => (
              <FoodItem key={item.dish_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {auth?.isLoggedIn && userHighestRated.length > 0 && (
        <div className="food-section">
          <h3>Your Highest Rated</h3>
          <div className="food-display-list">
            {userHighestRated.map((item) => (
              <FoodItem key={item.dish_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* GLOBAL FALLBACK */}
      {!auth?.isLoggedIn && mostPopular.length > 0 && (
        <div className="food-section">
          <h3>Most Popular</h3>
          <div className="food-display-list">
            {mostPopular.map((item) => (
              <FoodItem key={item.dish_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {!auth?.isLoggedIn && highestRated.length > 0 && (
        <div className="food-section">
          <h3>Highest Rated</h3>
          <div className="food-display-list">
            {highestRated.map((item) => (
              <FoodItem key={item.dish_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* TOP CHEFS */}
      {topChefs.length > 0 && (
        <div className="food-section">
          <h3>Top Chefs</h3>
          <div className="food-display-list">
            {topChefs.map((chef) => (
              <FoodItem key={chef.chef_id} item={chef} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;