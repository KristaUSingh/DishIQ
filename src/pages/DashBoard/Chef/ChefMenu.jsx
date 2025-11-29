import React, { useState, useEffect } from "react";
import "./ChefMenu.css";
import { supabase } from "../../../api/supabaseClient";

const ChefMenu = () => {
  const [restaurantName, setRestaurantName] = useState(null);

  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [addingItemCategory, setAddingItemCategory] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });

  const [role, setRole] = useState(null);


  // ==============================
  // LOAD USER ROLE + RESTAURANT NAME
  // ==============================
  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) return;

      // fetch role + restaurant_name from "users" table
      const { data: profile, error } = await supabase
        .from("users")
        .select("role, restaurant_name")
        .eq("user_id", user.id)
        .single();

      if (!error && profile) {
        setRole(profile.role.trim().toUpperCase());
        setRestaurantName(profile.restaurant_name?.trim());
      }
    };

    loadUserInfo();
  }, []);


  const canEdit = role === "CHEF" || role === "MANAGER";


  // ==============================
  // LOAD MENU ITEMS FROM SUPABASE
  // ==============================
  const loadMenu = async (restName) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("restaurant_name", restName);

    if (error) {
      console.error("Load menu error:", error);
      setLoading(false);
      return;
    }

    // Group items by category
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = { name: item.category, items: [] };
      }
      grouped[item.category].items.push(item);
    });

    setMenuCategories(Object.values(grouped));
    setLoading(false);
  };


  // Load menu once restaurantName is ready
  useEffect(() => {
    if (restaurantName) loadMenu(restaurantName);
  }, [restaurantName]);


  // ==============================
  // ADD CATEGORY
  // ==============================
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return alert("Please enter a category name.");
    }
  
    const categoryName = newCategoryName.trim();
  
    const { error } = await supabase.from("menus").insert({
      name: "Placeholder",
      price: 0,
      image_url: "",
      description: "",
      restaurant_name: restaurantName,
      category: categoryName,
    });
  
    if (error) {
      console.error("Add category error:", error);
      return;
    }
  
    setNewCategoryName("");
    setAddingCategory(false);
    loadMenu(restaurantName);
  };
  


  // ==============================
  // ADD ITEM
  // ==============================
  const handleSaveNewItem = async (categoryName) => {
    if (!newItem.name.trim() || !newItem.price)
      return alert("Name and price required.");

    const { error } = await supabase.from("menus").insert({
      name: newItem.name.trim(),
      description: newItem.description.trim(),
      price: parseFloat(newItem.price),
      image_url: newItem.image_url.trim(),
      category: categoryName,
      restaurant_name: restaurantName,
    });

    if (error) {
      console.error("Add item error:", error);
      return;
    }

    setAddingItemCategory(null);
    setNewItem({ name: "", description: "", price: "", image_url: "" });
    loadMenu(restaurantName);
  };


  // ==============================
  // DELETE ITEM
  // ==============================
  const handleDeleteItem = async (dish_id) => {
    if (!window.confirm("Delete this dish?")) return;

    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("dish_id", dish_id);

    if (error) {
      console.error("Delete item error:", error);
      return;
    }

    loadMenu(restaurantName);
  };


  // ==============================
  // DELETE CATEGORY (all dishes inside)
  // ==============================
  const handleDeleteCategory = async (categoryName) => {
    if (!window.confirm("Delete entire category?")) return;

    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("category", categoryName)
      .eq("restaurant_name", restaurantName);

    if (error) {
      console.error("Delete category error:", error);
      return;
    }

    loadMenu(restaurantName);
  };


  // ==============================
  // RENDER UI
  // ==============================
  if (!restaurantName) return <p className="loading">Loading restaurant...</p>;
  if (loading) return <p className="loading">Loading menu...</p>;


  return (
    <div className="chef-dashboard-container">
      <h2 className="dashboard-title">{restaurantName} — Chef Menu</h2>

      <div className="menu-container">
        {menuCategories.map((category) => (
          <section key={category.name} className="category-section">
            <div className="category-header">
              <h3 className="category-title">{category.name}</h3>

              {canEdit && (
                <button
                  className="btn delete-btn"
                  onClick={() => handleDeleteCategory(category.name)}
                >
                  Delete Section
                </button>
              )}
            </div>

            <div className="items-list">
              {category.items
                .filter((item) => item.name !== "Placeholder")
                .map((item) => (
                  <div key={item.dish_id} className="menu-item">
                    <div className="item-text">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-description">{item.description}</p>
                      <p className="item-price">
                        ${Number(item.price).toFixed(2)}
                      </p>
                    </div>

                    {item.image_url && (
                      <img
                        className="item-image"
                        src={item.image_url}
                        alt={item.name}
                      />
                    )}

                    {canEdit && (
                      <button
                        className="btn delete-btn"
                        onClick={() => handleDeleteItem(item.dish_id)}
                      >
                        Delete Item
                      </button>
                    )}
                  </div>
                ))}

              {/* ADD ITEM FORM */}
              {canEdit && addingItemCategory === category.name && (
                <div className="menu-item add-item-form">
                  <div className="item-text">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                    />

                    <textarea
                      className="input-field textarea-field"
                      placeholder="Description"
                      rows={2}
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                    />

                    <input
                      type="number"
                      className="input-field"
                      placeholder="Price"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({ ...newItem, price: e.target.value })
                      }
                    />

                    <input
                      type="text"
                      className="input-field"
                      placeholder="Image URL"
                      value={newItem.image_url}
                      onChange={(e) =>
                        setNewItem({ ...newItem, image_url: e.target.value })
                      }
                    />

                    <div className="add-item-buttons">
                      <button
                        className="btn save-btn"
                        onClick={() => handleSaveNewItem(category.name)}
                      >
                        Save
                      </button>

                      <button
                        className="btn cancel-btn"
                        onClick={() => {
                          setAddingItemCategory(null);
                          setNewItem({
                            name: "",
                            description: "",
                            price: "",
                            image_url: "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTON TO OPEN NEW ITEM FORM */}
              {canEdit && addingItemCategory !== category.name && (
                <button
                  className="btn add-item-btn"
                  onClick={() => setAddingItemCategory(category.name)}
                >
                  + Add Item
                </button>
              )}
            </div>
          </section>
        ))}

        {/* ADD CATEGORY SECTION */}
        {canEdit && (
          <div className="add-category-section">
            {addingCategory ? (
              <div className="add-category-form">
                <input
                  className="input-field"
                  placeholder="New section name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />

                <div className="add-category-buttons">
                  <button className="btn save-btn" onClick={handleAddCategory}>
                    Add Section
                  </button>

                  <button
                    className="btn cancel-btn"
                    onClick={() => {
                      setAddingCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn add-category-btn"
                onClick={() => setAddingCategory(true)}
              >
                + Add Section
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefMenu;
