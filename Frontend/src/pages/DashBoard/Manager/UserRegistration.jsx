import React, { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";
import './UserRegistration.css';

const UserRegistrations = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null); // user_id of open dropdown
  const [managerRestaurant, setManagerRestaurant] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        // Get logged-in user (manager)
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("Error fetching current user:", authError);
          setLoading(false);
          return;
        }
        const currentUser = authData?.user;
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Get manager's restaurant
        const { data: managerData, error: managerError } = await supabase
          .from("users")
          .select("restaurant_name, role")
          .eq("user_id", currentUser.id)
          .single();

        if (managerError) {
          console.error("Error fetching manager restaurant:", managerError);
          setLoading(false);
          return;
        }

        const managerRestaurantId = managerData?.restaurant_name;
        setManagerRestaurant(managerRestaurantId);

        // Fetch all users
        const { data: allUsers, error: usersError } = await supabase
          .from("users")
          .select("*");

        if (usersError) {
          console.error("Error fetching users:", usersError);
          setLoading(false);
          return;
        }

        // Filter users: exclude fired employees
        const filteredUsers = allUsers.filter(user => {
          if (user.fired_flag) return false; // exclude fired users
          if(user.role == "blacklist_customer") return false;

          const role = user.role?.trim();
          if (role === "chef" || role === "manager") {
            return user.restaurant_name === managerRestaurantId; // only same restaurant
          }

          return true; // include customer and delivery_person
        });

        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error loading users:", err);
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const handleAction = async (action, user) => {
    let updates = {};
    const role = user.role?.trim();

    if (role === "customer") {
      if (action === "Upgrade") updates.vip_flag = true;
      if (action === "Warning") updates.warnings = (user.warnings || 0) + 1;
      if (action === "Blacklist") updates.role = "blacklist_customer";
    } 
    else if (role === "close-account") {
      if (action === "close-account") {
        // 1️⃣ Delete from Supabase Auth table
        const { error: authError } = await supabase.auth.admin.deleteUser(user.user_id);
    
        if (authError) {
          console.error("Error deleting user from authentication table:", authError);
        }
    
        // 2️⃣ Delete user profile row
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("user_id", user.user_id);
    
        if (!error) {
          // Remove from UI
          setUsers(prev => prev.filter(u => u.user_id !== user.user_id));
          setActiveMenu(null);
        } else {
          console.error("Error deleting user from users table:", error);
        }
    
        return;
      }
    }
    
    else {
      if (action === "Demote") {
        updates = {
          demotion_count: (user.demotion_count || 0) + 1,
          salary: (user.salary || 0) - 5000,
        };
      } else if (action === "Promote") {
        updates = {
          salary: (user.salary || 0) + 5000,
        };
      } else if (action === "Fire") {
        updates = { fired_flag: true };
      }
    }

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", user.user_id);

    if (!error) {
      setUsers(prev =>
        prev.map(u =>
          u.user_id === user.user_id ? { ...u, ...updates } : u
        ).filter(u => !u.fired_flag) // immediately remove fired users from UI
      );
      setActiveMenu(null);
    }
  };

  if (loading) return <p>Loading Registered Users...</p>;

  return (
    <div className="user-dashboard-container">
      <h2> {managerRestaurant ? managerRestaurant : "Restaurant"} User Registration</h2>
      <div className="user-cards">
        {users.map(user => {
          const role = user.role?.trim();
          return (
            <div key={user.user_id} className="user-card">
              <div className="user-avatar">
                <span>{user.first_name?.charAt(0) || "?"}</span>
              </div>
              <div className="user-info">
                <h3>
                  {user.first_name} {user.last_name}
                  <span
                    className="dots-menu"
                    onClick={() => setActiveMenu(activeMenu === user.user_id ? null : user.user_id)}
                  >
                    ⋮
                    {activeMenu === user.user_id && (
                      <div className="dropdown">
                        {role === "customer" ? (
                          <>
                            <button onClick={() => handleAction("Upgrade", user)}>Upgrade</button>
                            <button onClick={() => handleAction("Warning", user)}>Warning</button>
                            <button onClick={() => handleAction("Blacklist", user)}>Blacklist</button>
                          </>
                        ): role === "close-account" ? (
                          <>
                            <button onClick={() => handleAction("close-account", user)}>Close Account</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleAction("Fire", user)}>Fire</button>
                            <button onClick={() => handleAction("Promote", user)}>Promote</button>
                            <button onClick={() => handleAction("Demote", user)}>Demote</button>
                          </>
                        )}
                      </div>
                    )}
                  </span>
                </h3>
                <p>
                  Role: {role === "delivery_person" ? "Delivery Driver" :
                         role === "chef" ? "Chef" :
                         role === "manager" ? "Manager" :
                         role === "close-account" ? "Close Account Request" :
                         "Customer"}
                </p>
                {user.salary != null && <p>Salary: ${user.salary}</p>}
                {user.bonus != 0 && <p>Bonus: ${user.bonus}</p>}
                {user.demotion_count != 0 && <p>Demotion Count: {user.demotion_count}</p>}
                {user.vip_flag && <p>VIP Status ⭐️</p>}
                {user.warnings != 0 && <p>Warnings: {user.warnings}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserRegistrations;
