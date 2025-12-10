import React, { useEffect, useState } from "react";
import "./ManagerCC.css";
import { supabase } from "../../../api/supabaseClient";
import { useAuth } from "../../../context/useAuth";

const ManagerCC = () => {
  const { auth } = useAuth();
  const managerRestaurant = auth?.restaurant_name;

  const [ratings, setRatings] = useState([]);
  const [activeTab, setActiveTab] = useState("compliments");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    if (managerRestaurant) fetchAllRatings();
  }, [managerRestaurant]);

  // -----------------------------------------
  // FETCH RATINGS FOR THIS MANAGER'S RESTAURANT
  // -----------------------------------------
  const fetchAllRatings = async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select(`
        rating_id,
        review_type,
        review_target,
        comment,
        created_at,
        dispute_status,
        manager_action,
        food_rating,
        delivery_rating,
        restaurant_name,

        customer_id,
        chef_id,
        driver_id
      `)
      .eq("restaurant_name", managerRestaurant)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Manager query error:", error);
      return;
    }

    // get all user IDs involved
    const userIds = [
      ...new Set(
        data.flatMap((r) => [r.customer_id, r.chef_id, r.driver_id]).filter(Boolean)
      ),
    ];

    let userMap = {};
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("user_id, first_name, last_name, role")
        .in("user_id", userIds);

      usersData.forEach((u) => (userMap[u.user_id] = u));
    }

    const merged = data.map((r) => ({
      ...r,
      customer: userMap[r.customer_id] || null,
      chef: userMap[r.chef_id] || null,
      driver: userMap[r.driver_id] || null,
    }));

    setRatings(merged);
  };

  // -----------------------------------------
  // MANAGER ACTION: DISMISS OR WARNING
  // -----------------------------------------
  const handleManagerAction = async (rating_id, action) => {
    // 1️⃣ Update the rating record
    const { data: ratingData, error: ratingError } = await supabase
      .from("ratings")
      .update({
        dispute_status: "resolved",
        manager_action: action,
      })
      .eq("rating_id", rating_id)
      .select("*")
      .single();
  
    if (ratingError) {
      console.error("Rating update error:", ratingError);
      return;
    }
  
    // 2️⃣ Only increment warnings if action = "warning"
    if (action === "warning") {
      // Determine which user is being warned
      let warnedUserId = null;
  
      if (ratingData.review_target === "chef") warnedUserId = ratingData.chef_id;
      if (ratingData.review_target === "driver") warnedUserId = ratingData.driver_id;
      if (ratingData.review_target === "customer") warnedUserId = ratingData.customer_id;
  
      if (warnedUserId) {
        // 3️⃣ Fetch current warnings count
        const { data: userData, error: userFetchError } = await supabase
          .from("users")
          .select("warnings")
          .eq("user_id", warnedUserId)
          .single();
  
        if (userFetchError) {
          console.error("User fetch error:", userFetchError);
        } else {
          const newWarnings = (userData?.warnings || 0) + 1;
  
          // 4️⃣ Update warnings column
          const { error: updateUserError } = await supabase
            .from("users")
            .update({ warnings: newWarnings })
            .eq("user_id", warnedUserId);
  
          if (updateUserError) {
            console.error("User update error:", updateUserError);
          }
        }
      }
    }
  
    // 5️⃣ Refresh UI
    fetchAllRatings();
  };
  

  // -----------------------------------------
  // FILTERING LOGIC
  // -----------------------------------------
  const filtered = ratings.filter((r) => {
    const matchType =
      activeTab === "compliments"
        ? r.review_type === "compliment"
        : r.review_type === "complaint";

    const targetRole =
        r.review_target === "chef"
        ? "chef"
        : r.review_target === "driver"
        ? "driver"
        : r.review_target === "customer"
        ? "customer"
        : null;

    const matchRole =
      roleFilter === "All" ? true : targetRole === roleFilter.toLowerCase();

    return matchType && matchRole;
  });

  return (
    <div className="manager-container">
      <h1 className="manager-title">Compliments & Complaints Dashboard</h1>

      {/* TABS */}
      <div className="manager-tabs">
        <button
          className={activeTab === "compliments" ? "active-tab" : ""}
          onClick={() => setActiveTab("compliments")}
        >
          Compliments
        </button>
        <button
          className={activeTab === "complaints" ? "active-tab" : ""}
          onClick={() => setActiveTab("complaints")}
        >
          Complaints
        </button>
      </div>

      {/* ROLE FILTER */}
      <div className="filter-row">
        <label>Filter by Role:</label>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="chef">Chefs</option>
          <option value="driver">Drivers</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="no-results">No results found.</p>
      ) : (
        filtered.map((r) => {
          // WHO the complaint/compliment is about
          const target =
              r.review_target === "chef"
              ? r.chef
              : r.review_target === "driver"
              ? r.driver
              : r.customer;

          // WHO submitted the review
          const fromUser =
            r.review_target === "customer"
              ? r.driver // driver reviews customer
              : r.customer; // customer reviews chef/driver

          return (
            <div key={r.rating_id} className="manager-card">
              <div className="manager-header">
                <strong>
                  Target: {target?.first_name} {target?.last_name} ({target?.role})
                </strong>
                <span>{new Date(r.created_at).toLocaleString()}</span>
              </div>

              <p>
                <strong>From:</strong> {fromUser?.first_name}{" "}
                {fromUser?.last_name} ({fromUser?.role})
              </p>

              <p>
                <strong>Type:</strong> {r.review_type.toUpperCase()}
              </p>

              <p>
                <strong>Comment:</strong> {r.comment}
              </p>

              {/* ONLY SHOW ACTION BUTTONS FOR COMPLAINTS */}
              {activeTab === "complaints" && (
                <div className="manager-actions">
                  {r.dispute_status === "pending" && (
                    <p className="pending-msg">⚠️ Dispute Pending</p>
                  )}

                  {!r.manager_action ? (
                    <>
                      <button
                        className="dismiss-btn"
                        onClick={() => handleManagerAction(r.rating_id, "dismissed")}
                      >
                        Dismiss Complaint
                      </button>

                      <button
                        className="warning-btn"
                        onClick={() => handleManagerAction(r.rating_id, "warning")}
                      >
                        Issue Warning
                      </button>
                    </>
                  ) : (
                    <p className="resolved-msg">
                      Decision:{" "}
                      <strong>
                        {r.manager_action === "dismissed"
                          ? "Dismissed"
                          : "Warning Issued"}
                      </strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ManagerCC;