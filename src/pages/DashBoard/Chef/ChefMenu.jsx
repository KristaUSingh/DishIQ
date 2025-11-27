import React, { useState, useEffect } from "react";
import './ChefMenu.css';

const ChefMenu = () => {
  const [menuCategories, setMenuCategories] = useState([
    {
      id: 1,
      name: "Top Dishes Near You",
      items: [
        {
          id: 101,
          name: "Halal Chicken Sandwich & Fries",
          description: "Crispy chicken sandwich with golden fries",
          price: 8.99,
          image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400"
        },
        {
          id: 102,
          name: "Plant-Based Chicken Sandwich & Fries",
          description: "Delicious plant-based chicken with crispy fries",
          price: 9.49,
          image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400"
        },
      ]
    },
    {
      id: 2,
      name: "Sides & Snacks",
      items: [
        {
          id: 201,
          name: "Chicken Tenders & Fries",
          description: "Crispy breaded chicken tenders with fries",
          price: 7.99,
          image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400"
        },
      ]
    }
  ]);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingItemCategoryId, setAddingItemCategoryId] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", image: "" });
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  // Add Category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return alert("Please enter a category name.");
    const newCat = { id: Date.now(), name: newCategoryName.trim(), items: [] };
    setMenuCategories([...menuCategories, newCat]);
    setNewCategoryName("");
    setAddingCategory(false);
  };

  // Add Item
  const handleAddItemClick = (catId) => {
    setAddingItemCategoryId(catId);
    setNewItem({ name: "", description: "", price: "", image: "" });
  };
  const handleNewItemChange = (field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveNewItem = (catId) => {
    if (!newItem.name.trim() || !newItem.price) return alert("Name and price are required.");
    const newItemToAdd = {
      id: Date.now(),
      name: newItem.name.trim(),
      description: newItem.description.trim(),
      price: parseFloat(newItem.price),
      image: newItem.image.trim()
    };
    setMenuCategories(menuCategories.map(cat =>
      cat.id === catId ? { ...cat, items: [...cat.items, newItemToAdd] } : cat
    ));
    setAddingItemCategoryId(null);
    setNewItem({ name: "", description: "", price: "", image: "" });
  };
  const handleCancelNewItem = () => {
    setAddingItemCategoryId(null);
    setNewItem({ name: "", description: "", price: "", image: "" });
  };

  // Delete Category
  const handleDeleteCategory = (catId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setMenuCategories(menuCategories.filter(cat => cat.id !== catId));
    }
  };

  // Delete Item
  const handleDeleteItem = (catId, itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setMenuCategories(menuCategories.map(cat =>
        cat.id === catId ? { ...cat, items: cat.items.filter(item => item.id !== itemId) } : cat
      ));
    }
  };

  return (
    <div className="chef-dashboard-container">
      <h2 className="dashboard-title">Chef Menu</h2>

      <div className="menu-container">
        {menuCategories.length === 0 && (
          <p className="empty-state-message">No menu sections yet.</p>
        )}

        {menuCategories.map(category => (
          <section key={category.id} className="category-section">
            <div className="category-header">
              <h3 className="category-title">{category.name}</h3>
              {role === "CHEF" && (
                <button className="btn delete-btn" onClick={() => handleDeleteCategory(category.id)}>
                  Delete Section
                </button>
              )}
            </div>

            <div className="items-list">
              {category.items.map(item => (
                <div key={item.id} className="menu-item">
                  <div className="item-text">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">${item.price.toFixed(2)}</p>
                  </div>
                  {item.image && <img className="item-image" src={item.image} alt={item.name} />}
                  {role === "CHEF" && (
                    <button className="btn delete-btn" onClick={() => handleDeleteItem(category.id, item.id)}>
                      Delete Item
                    </button>
                  )}
                </div>
              ))}

              {role === "CHEF" && addingItemCategoryId === category.id && (
                <div className="menu-item add-item-form">
                  <div className="item-text">
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => handleNewItemChange('name', e.target.value)}
                      className="input-field"
                      placeholder="Item name"
                    />
                    <textarea
                      value={newItem.description}
                      onChange={(e) => handleNewItemChange('description', e.target.value)}
                      className="input-field textarea-field"
                      placeholder="Description"
                      rows={2}
                    />
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => handleNewItemChange('price', e.target.value)}
                      className="input-field"
                      placeholder="Price"
                      step="0.01"
                      min="0"
                    />
                    <input
                      type="text"
                      value={newItem.image}
                      onChange={(e) => handleNewItemChange('image', e.target.value)}
                      className="input-field"
                      placeholder="Image URL"
                    />
                    <div className="add-item-buttons">
                      <button className="btn save-btn" onClick={() => handleSaveNewItem(category.id)}>Save</button>
                      <button className="btn cancel-btn" onClick={handleCancelNewItem}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {role === "CHEF" && addingItemCategoryId !== category.id && (
                <button className="btn add-item-btn" onClick={() => handleAddItemClick(category.id)}>
                  + Add Item
                </button>
              )}
            </div>
          </section>
        ))}

        {role === "CHEF" && (
          <div className="add-category-section">
            {addingCategory ? (
              <div className="add-category-form">
                <input
                  type="text"
                  placeholder="New section name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input-field"
                />
                <div className="add-category-buttons">
                  <button className="btn save-btn" onClick={handleAddCategory}>Add Section</button>
                  <button className="btn cancel-btn" onClick={() => { setAddingCategory(false); setNewCategoryName(""); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn add-category-btn" onClick={() => setAddingCategory(true)}>
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
