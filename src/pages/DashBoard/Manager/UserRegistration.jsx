import './UserRegistration.css';
import React, { useEffect, useState } from "react";
import { supabase } from "../../../api/supabaseClient";


const UserRegistrations = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("*");

      if (error) {
        console.error("Error loading users:", error);
      } else {
        setUsers(data);
      }

      setLoading(false);
    }

    loadUsers();
  }, []);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (user, action) => {
    console.log(`${action} action for ${user.first_name}`);
    setOpenMenuId(null);
    // Here you can call your API to promote/demote/fire
  };

  if (loading) return <p>Loading Registrated Users...</p>;


  return (
    <div className="user-dashboard-container">
      <h2>User Registration</h2>
      <div className="user-cards">
        {users.map(user => (
          <div key={user.user_id} className="user-card">
            <div className="user-avatar">
              <span>{user.first_name?.charAt(0) || "?"}</span>
            </div>
            <div className="user-info">
              <h3>{user.first_name} {user.last_name} </h3>
              <p>
                Role: {user.role == "delivery_person" ? "Delivery Driver" :
                          user.role == "chef" ? "Chef" :
                          user.role == "manager" ? "Manager" :
                          "Customer"}
              </p>
              <p>{user.salary != null && (<p>Salary: ${user.salary}</p>
            )}</p>
            <p>{user.bonus != 0 && (<p>Bonus: ${user.bonus}</p>
            )}</p>
            <p>{user.demotion_count != 0 && (<p>Demotion Count: ${user.demotion_count}</p>
            )}</p>
            <p>{user.vip_flag == true && <p>VIP Status ⭐️</p>}</p>
            <p>{user.warnings != 0 && (<p>Warnings: ${user.warnings}</p>
            )}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default UserRegistrations;
