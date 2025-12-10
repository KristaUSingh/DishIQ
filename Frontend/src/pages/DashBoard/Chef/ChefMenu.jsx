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
  const [editingItem, setEditingItem] = useState(null); // ⭐ NEW
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });

  const [role, setRole] = useState(null);

  // ==============================
  // LOAD USER ROLE + RESTAURANT
  // ==============================
  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("role, restaurant_name")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setRole(profile.role.trim().toUpperCase());
        setRestaurantName(profile.restaurant_name?.trim());
      }
    };

    loadUserInfo();
  }, []);

  const canEdit = role === "CHEF" || role === "manager" || role === "MANAGER";

  // ==============================
  // LOAD MENU
  // ==============================
  const loadMenu = async (restName) => {
    setLoading(true);
    const { data } = await supabase
      .from("menus")
      .select("*")
      .eq("restaurant_name", restName);

    const grouped = {};
    data?.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = { name: item.category, items: [] };
      }
      grouped[item.category].items.push(item);
    });

    setMenuCategories(Object.values(grouped));
    setLoading(false);
  };

  useEffect(() => {
    if (restaurantName) loadMenu(restaurantName);
  }, [restaurantName]);

  // ==============================
  // ADD CATEGORY
  // ==============================
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return alert("Enter a category name.");

    await supabase.from("menus").insert({
      name: "Placeholder",
      price: 0,
      image_url: "",
      description: "",
      restaurant_name: restaurantName,
      category: newCategoryName.trim(),
    });

    setNewCategoryName("");
    setAddingCategory(false);
    loadMenu(restaurantName);
  };

  // ==============================
  // ADD NEW ITEM
  // ==============================
  const handleSaveNewItem = async (categoryName) => {
    if (!itemForm.name.trim() || !itemForm.price)
      return alert("Name and price required.");

    await supabase.from("menus").insert({
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      price: parseFloat(itemForm.price),
      image_url: itemForm.image_url.trim(),
      category: categoryName,
      restaurant_name: restaurantName,
    });

    setAddingItemCategory(null);
    setItemForm({ name: "", description: "", price: "", image_url: "" });
    loadMenu(restaurantName);
  };

  // ==============================
  // DELETE ITEM
  // ==============================
  const handleDeleteItem = async (dish_id) => {
    if (!window.confirm("Delete this dish?")) return;

    await supabase.from("menus").delete().eq("dish_id", dish_id);
    loadMenu(restaurantName);
  };

  // ==============================
  // EDIT ITEM
  // ==============================
  const handleEditItem = (item) => {
    setEditingItem(item.dish_id);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
    });
  };

  const handleSaveEdit = async () => {
    await supabase
      .from("menus")
      .update({
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        image_url: itemForm.image_url,
      })
      .eq("dish_id", editingItem);

    setEditingItem(null);
    setItemForm({ name: "", description: "", price: "", image_url: "" });
    loadMenu(restaurantName);
  };

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
                .filter((i) => i.name !== "Placeholder")
                .map((item) => (
                  <div key={item.dish_id} className="menu-item">
                    {editingItem === item.dish_id ? (
                      // ===========================
                      // EDIT MODE FORM
                      // ===========================
                      <div className="edit-item-form">
                        <input
                          className="input-field"
                          value={itemForm.name}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, name: e.target.value })
                          }
                        />

                        <textarea
                          className="input-field textarea-field"
                          value={itemForm.description}
                          onChange={(e) =>
                            setItemForm({
                              ...itemForm,
                              description: e.target.value,
                            })
                          }
                        />

                        <input
                          className="input-field"
                          type="number"
                          value={itemForm.price}
                          onChange={(e) =>
                            setItemForm({ ...itemForm, price: e.target.value })
                          }
                        />

                        <input
                          className="input-field"
                          value={itemForm.image_url}
                          onChange={(e) =>
                            setItemForm({
                              ...itemForm,
                              image_url: e.target.value,
                            })
                          }
                        />

                        <div className="edit-buttons">
                          <button className="btn save-btn" onClick={handleSaveEdit}>
                            Save
                          </button>

                          <button
                            className="btn cancel-btn"
                            onClick={() => setEditingItem(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ===========================
                      // NORMAL VIEW
                      // ===========================
                      <>
                        <div className="item-text">
                          <h4 className="item-name">{item.name}</h4>
                          <p className="item-description">{item.description}</p>
                          <p className="item-price">${Number(item.price).toFixed(2)}</p>
                        </div>

                        {item.image_url && (
                          <img className="item-image" src={item.image_url} alt={item.name} />
                        )}

                        {canEdit && (
                          <div className="item-actions">
                            <button
                              className="btn edit-item-btn"
                              onClick={() => handleEditItem(item)}
                            >
                              Edit Item
                            </button>

                            <button
                              className="btn delete-item-btn"
                              onClick={() => handleDeleteItem(item.dish_id)}
                            >
                              Delete Item
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

              {/* ADD ITEM FORM */}
              {canEdit && addingItemCategory === category.name && !editingItem && (
                <div className="menu-item add-item-form">
                  <input
                    className="input-field"
                    placeholder="Item name"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                  />

                  <textarea
                    className="input-field textarea-field"
                    placeholder="Description"
                    value={itemForm.description}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, description: e.target.value })
                    }
                  />

                  <input
                    className="input-field"
                    placeholder="Price"
                    type="number"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, price: e.target.value })
                    }
                  />

                  <input
                    className="input-field"
                    placeholder="Image URL"
                    value={itemForm.image_url}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, image_url: e.target.value })
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
                        setItemForm({
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
              )}

              {/* ADD ITEM BUTTON */}
              {canEdit &&
                !editingItem &&
                addingItemCategory !== category.name && (
                  <button
                    className="btn add-item-btn"
                    onClick={() => {
                      setAddingItemCategory(category.name);
                      setItemForm({
                        name: "",
                        description: "",
                        price: "",
                        image_url: "",
                      });
                    }}
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